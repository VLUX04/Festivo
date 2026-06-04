import pool from '../db.js';
import { getUserByUsername } from './user.service.js';

type PublicationPayload = {
  caption: string;
  image: string;
  location?: string;
  mediaType?: 'image' | 'video';
};

const publicationCommentsQuery = `
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'author', COALESCE(u.name, u.username),
        'body', c.information,
        'timestamp', c.publish_date
      )
      ORDER BY c.publish_date ASC, c.id ASC
    ),
    '[]'::json
  ) AS comments
  FROM comments c
  JOIN users u ON u.id = c.user_id
  WHERE c.publication_id = p.id
`;

export async function getSocialFeed(username?: string) {
  const currentUser = username ? await getUserByUsername(username) : null;
  const viewerId = currentUser?.id ?? null;

  const stories = await pool.query(
    `SELECT
        s.id,
        COALESCE(u.name, u.username) AS author,
        ('https://picsum.photos/seed/story-' || s.id || '/100/100') AS avatar,
        s.media AS image,
        COALESCE(s.label, 'Story') AS label
     FROM stories s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC, s.id DESC`,
  );

  const posts = await pool.query(
    `SELECT
        p.id,
        p.user_id,
        COALESCE(u.name, u.username) AS author,
        ('https://picsum.photos/seed/user-' || u.id || '/120/120') AS avatar,
        p.media AS image,
        COALESCE(p.media_type, CASE
          WHEN p.media ~* '\\.(mp4|webm|ogg)(\\?.*)?$' THEN 'video'
          ELSE 'image'
        END) AS "mediaType",
        p.information AS caption,
        COALESCE(p.location, 'Festivo Feed') AS location,
        p.likes,
        p.favorites,
        p.shares,
        COALESCE(pr.liked, FALSE) AS "likedByMe",
        COALESCE(pr.favorited, FALSE) AS "favoritedByMe",
        COALESCE(pr.shared, FALSE) AS "sharedByMe",
        COALESCE((p.user_id = $1), FALSE) AS "isMine",
        (${publicationCommentsQuery}) AS comments
     FROM publication p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN publication_reactions pr
        ON pr.publication_id = p.id
       AND pr.user_id = $1
     ORDER BY p.publish_date DESC, p.id DESC`,
    [viewerId],
  );

  const attendedEvents = viewerId
    ? await pool.query(
    `SELECT
        ae.event_id AS id,
        e.title,
        COALESCE(img.url, '') AS image,
        e.venue AS location,
        TO_CHAR(COALESCE(e.sdate, ae.attended_at::date), 'Mon DD, YYYY') AS date,
        ae.status
     FROM attended_events ae
     JOIN events e ON e.id = ae.event_id
     LEFT JOIN LATERAL (
        SELECT i.url
        FROM event_images ei
        JOIN images i ON i.id = ei.image_id
        WHERE ei.event_id = e.id
        ORDER BY ei.is_cover DESC, i.id ASC
        LIMIT 1
     ) img ON TRUE
     WHERE ae.user_id = $1
     ORDER BY ae.attended_at DESC, ae.event_id DESC`,
    [viewerId],
  )
    : { rows: [] };

  return {
    ok: true as const,
    feed: {
      stories: stories.rows,
      posts: posts.rows.map((post) => ({
        ...post,
        comments: Array.isArray(post.comments) ? post.comments : [],
      })),
      attendedEvents: attendedEvents.rows,
    },
  };
}

export async function createPublication(username: string, payload: PublicationPayload) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (!payload.caption.trim() || !payload.image.trim()) {
    return { ok: false as const, status: 400, message: 'Missing publication data' };
  }

  const result = await pool.query(
    `INSERT INTO publication (user_id, media, media_type, publish_date, information, location)
     VALUES ($1, $2, $3, NOW(), $4, $5)
     RETURNING id`,
    [currentUser.id, payload.image, payload.mediaType || 'image', payload.caption.trim(), payload.location?.trim() || 'Festivo Feed'],
  );

  return { ok: true as const, publicationId: result.rows[0].id };
}

type QueryExecutor = {
  query: (text: string, values?: any[]) => Promise<{ rows: any[] }>;
};

const upsertReaction = async (executor: QueryExecutor, publicationId: number, userId: number) => {
  const existing = await executor.query(
    'SELECT liked, favorited, shared FROM publication_reactions WHERE publication_id = $1 AND user_id = $2',
    [publicationId, userId],
  );

  if (existing.rows.length === 0) {
    const inserted = await executor.query(
      'INSERT INTO publication_reactions (publication_id, user_id) VALUES ($1, $2) RETURNING liked, favorited, shared',
      [publicationId, userId],
    );

    return inserted.rows[0];
  }

  return existing.rows[0];
};

export async function togglePublicationLike(username: string, publicationId: number) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const publication = await pool.query('SELECT id, user_id, likes, information FROM publication WHERE id = $1', [publicationId]);

  if (publication.rows.length === 0) {
    return { ok: false as const, status: 404, message: 'Publication not found' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reaction = await upsertReaction(client, publicationId, currentUser.id);
    const nextLiked = !reaction.liked;

    await client.query('UPDATE publication_reactions SET liked = $1 WHERE publication_id = $2 AND user_id = $3', [nextLiked, publicationId, currentUser.id]);
    await client.query('UPDATE publication SET likes = GREATEST(0, likes + $1) WHERE id = $2', [nextLiked ? 1 : -1, publicationId]);

    await client.query('COMMIT');
    return { ok: true as const, liked: nextLiked };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function togglePublicationFavorite(username: string, publicationId: number) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const reaction = await upsertReaction(pool, publicationId, currentUser.id);
  const nextFavorited = !reaction.favorited;

  await pool.query('UPDATE publication_reactions SET favorited = $1 WHERE publication_id = $2 AND user_id = $3', [nextFavorited, publicationId, currentUser.id]);
  await pool.query('UPDATE publication SET favorites = GREATEST(0, favorites + $1) WHERE id = $2', [nextFavorited ? 1 : -1, publicationId]);

  return { ok: true as const, favorited: nextFavorited };
}

export async function sharePublication(username: string, publicationId: number) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const reaction = await upsertReaction(pool, publicationId, currentUser.id);

  if (!reaction.shared) {
    await pool.query('UPDATE publication_reactions SET shared = TRUE WHERE publication_id = $1 AND user_id = $2', [publicationId, currentUser.id]);
    await pool.query('UPDATE publication SET shares = shares + 1 WHERE id = $1', [publicationId]);
  }

  return { ok: true as const, shared: true };
}

export async function addPublicationComment(username: string, publicationId: number, body: string) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (!body.trim()) {
    return { ok: false as const, status: 400, message: 'Comment cannot be empty' };
  }

  const publication = await pool.query('SELECT user_id, information FROM publication WHERE id = $1', [publicationId]);

  if (publication.rows.length === 0) {
    return { ok: false as const, status: 404, message: 'Publication not found' };
  }

  const comment = await pool.query(
    `INSERT INTO comments (publication_id, user_id, information, publish_date)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, information, publish_date`,
    [publicationId, currentUser.id, body.trim()],
  );

  return { ok: true as const, comment: comment.rows[0] };
}

export async function followProfessional(username: string, professionalUsername: string) {
  const currentUser = await getUserByUsername(username);
  const targetUser = await getUserByUsername(professionalUsername);

  if (!currentUser || !targetUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (targetUser.role !== 'professional') {
    return { ok: false as const, status: 400, message: 'Can only follow professionals' };
  }

  if (currentUser.role !== 'customer') {
    return { ok: false as const, status: 400, message: 'Only customers can follow professionals' };
  }

  // Ensure a customer profile exists for the follower to satisfy FK constraint
  await pool.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [currentUser.id]);

  const followResult = await pool.query(
    'INSERT INTO follows (customer_id, professional_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING customer_id',
    [currentUser.id, targetUser.id],
  );

  return { ok: true as const, message: 'Followed successfully' };
}
