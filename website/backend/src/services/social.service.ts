import pool from '../db.js';
import { getUserByUsername } from './user.service.js';
import { createNotification } from './notification.service.js';

type PublicationPayload = {
  caption: string;
  image: string;
  location?: string;
  mediaType?: 'image' | 'video';
};

type PublicProfileReview = {
  id: number;
  reviewerUsername: string;
  reviewerName: string;
  rating: number;
  information: string;
  sentDate: string;
};

const getProfileType = (userRole: string | null | undefined, genre: string | null | undefined): string => {
  if (userRole === 'customer') {
    return 'Event Lover';
  }

  return genre ? 'Artist' : 'Promoter';
};

export async function getPublicProfile(viewerUsername: string | undefined, targetUsername: string) {
  const viewer = viewerUsername ? await getUserByUsername(viewerUsername) : null;
  const target = await getUserByUsername(targetUsername);

  if (!target) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const profileResult = await pool.query(
    `SELECT
        u.id,
        u.username,
        COALESCE(u.name, u.username) AS name,
        u.email,
        u.role,
        u.information AS bio,
        u.location,
        pp.is_verified AS "isVerified",
        pp.genre,
        pp.rating
     FROM users u
     LEFT JOIN professional_profile pp ON pp.user_id = u.id
     WHERE u.username = $1`,
    [targetUsername],
  );

  if (profileResult.rowCount === 0) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const profile = profileResult.rows[0];

  const reviewsResult = profile.role === 'professional'
    ? await pool.query(
        `SELECT
            pr.user_id AS id,
            reviewer.username AS "reviewerUsername",
            COALESCE(reviewer.name, reviewer.username) AS "reviewerName",
            pr.rating,
            pr.information,
            pr.sent_date AS "sentDate"
         FROM professional_review pr
         JOIN users reviewer ON reviewer.id = pr.user_id
         WHERE pr.professional_id = $1
         ORDER BY pr.sent_date DESC, pr.user_id DESC`,
        [profile.id],
      )
    : { rows: [] as PublicProfileReview[] };

  const preferencesResult = profile.role === 'customer'
    ? await pool.query(
        `SELECT cp.tag_name AS tag
         FROM customer_preferences cp
         WHERE cp.customer_id = $1
         ORDER BY cp.tag_name ASC`,
        [profile.id],
      )
    : { rows: [] as { tag: string }[] };

  const [publicationCountResult, followersCountResult, friendsCountResult] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM publication WHERE user_id = $1', [profile.id]),
    profile.role === 'professional'
      ? pool.query('SELECT COUNT(*)::int AS count FROM follows WHERE professional_id = $1', [profile.id])
      : Promise.resolve({ rows: [{ count: 0 }] }),
    pool.query(
      'SELECT COUNT(*)::int AS count FROM friends WHERE user1_id = $1 OR user2_id = $1',
      [profile.id],
    ),
  ]);

  const isFollowing = Boolean(viewer && profile.role === 'professional'
    ? (await pool.query(
        'SELECT 1 FROM follows WHERE customer_id = $1 AND professional_id = $2',
        [viewer.id, profile.id],
      )).rowCount
    : false);

  return {
    ok: true as const,
    profile: {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      bio: profile.bio,
      location: profile.location,
      profileType: getProfileType(profile.role, profile.genre),
      isVerified: profile.isVerified ?? false,
      genre: profile.genre,
      rating: profile.rating,
      preferences: preferencesResult.rows.map((entry) => entry.tag),
      publicationCount: Number(publicationCountResult.rows[0]?.count || 0),
      followersCount: Number(followersCountResult.rows[0]?.count || 0),
      friendsCount: Number(friendsCountResult.rows[0]?.count || 0),
      isMe: viewer?.id === profile.id,
      isFollowing,
      canReview: Boolean(viewer && viewer.role === 'customer' && profile.role === 'professional' && viewer.id !== profile.id),
      reviews: reviewsResult.rows as PublicProfileReview[],
    },
  };
}

export async function saveProfessionalReview(username: string, professionalUsername: string, rating: number, information: string) {
  const reviewer = await getUserByUsername(username);
  const target = await getUserByUsername(professionalUsername);

  if (!reviewer || !target) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (reviewer.role !== 'customer') {
    return { ok: false as const, status: 403, message: 'Only event lovers can review professionals' };
  }

  if (target.role !== 'professional') {
    return { ok: false as const, status: 400, message: 'You can only review professionals' };
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false as const, status: 400, message: 'Rating must be between 1 and 5' };
  }

  if (!information.trim()) {
    return { ok: false as const, status: 400, message: 'Review text cannot be empty' };
  }

  await pool.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [reviewer.id]);

  const result = await pool.query(
    `INSERT INTO professional_review (user_id, professional_id, rating, sent_date, information)
     VALUES ($1, $2, $3, CURRENT_DATE, $4)
     ON CONFLICT (user_id, professional_id)
     DO UPDATE SET rating = EXCLUDED.rating, sent_date = EXCLUDED.sent_date, information = EXCLUDED.information
     RETURNING user_id, professional_id, rating, sent_date, information`,
    [reviewer.id, target.id, rating, information.trim()],
  );

  return { ok: true as const, review: result.rows[0] };
}

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
      u.username AS username,
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

    if (nextLiked && publication.rows[0].user_id !== currentUser.id) {
      void createNotification({
        recipientId: publication.rows[0].user_id,
        actorId: currentUser.id,
        kind: 'like',
        title: 'New Like',
        message: `${currentUser.name || currentUser.username} liked your publication.`,
        publicationId,
      });
    }

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

  if (publication.rows[0].user_id !== currentUser.id) {
    void createNotification({
      recipientId: publication.rows[0].user_id,
      actorId: currentUser.id,
      kind: 'comment',
      title: 'New Comment',
      message: `${currentUser.name || currentUser.username} commented on your publication.`,
      publicationId,
    });
  }

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

  await pool.query(
    'INSERT INTO follows (customer_id, professional_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [currentUser.id, targetUser.id],
  );

  void createNotification({
    recipientId: targetUser.id,
    actorId: currentUser.id,
    kind: 'follow',
    title: 'New Follower',
    message: `${currentUser.name || currentUser.username} started following you.`,
  });

  return { ok: true as const, message: 'Followed successfully' };
}

export async function unfollowProfessional(username: string, professionalUsername: string) {
  const currentUser = await getUserByUsername(username);
  const targetUser = await getUserByUsername(professionalUsername);

  if (!currentUser || !targetUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  await pool.query(
    'DELETE FROM follows WHERE customer_id = $1 AND professional_id = $2',
    [currentUser.id, targetUser.id],
  );

  return { ok: true as const, message: 'Unfollowed successfully' };
}

export async function getFollowStatus(viewerUsername: string, targetUsername: string) {
  const viewer = await getUserByUsername(viewerUsername);
  const target = await getUserByUsername(targetUsername);

  if (!viewer || !target) return { ok: false as const, status: 404, message: 'User not found' };

  const result = await pool.query(
    'SELECT 1 FROM follows WHERE customer_id = $1 AND professional_id = $2',
    [viewer.id, target.id],
  );

  return { ok: true as const, isFollowing: (result.rowCount ?? 0) > 0 };
}

type FriendRow = {
  friendId: number;
  username: string;
  name: string;
  role: string;
  chatId: number | null;
};

type FriendRequestRow = {
  id: number;
  senderUsername: string;
  senderName: string;
  createdAt: string;
};

export async function listFriends(username: string) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const result = await pool.query(
    `SELECT
        u.id AS "friendId",
        u.username,
        COALESCE(u.name, u.username) AS name,
        u.role,
        c.id AS "chatId"
     FROM friends f
     JOIN users u
       ON u.id = CASE
         WHEN f.user1_id = $1 THEN f.user2_id
         ELSE f.user1_id
       END
     LEFT JOIN LATERAL (
        SELECT c.id
        FROM chat c
        JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = $1
        JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id = u.id
        LIMIT 1
     ) c ON TRUE
     WHERE f.user1_id = $1 OR f.user2_id = $1
     ORDER BY u.name ASC, u.username ASC`,
    [currentUser.id],
  );

  return { ok: true as const, friends: result.rows as FriendRow[] };
}

export async function searchFriends(username: string, query: string) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const searchTerm = `%${query.trim()}%`;

  const result = await pool.query(
    `SELECT
        u.id AS "friendId",
        u.username,
        COALESCE(u.name, u.username) AS name,
        u.role,
        EXISTS(
          SELECT 1
          FROM friends f
          WHERE (f.user1_id = $1 AND f.user2_id = u.id)
             OR (f.user2_id = $1 AND f.user1_id = u.id)
        ) AS "isFriend"
     FROM users u
     WHERE u.id <> $1
       AND (
         u.username ILIKE $2
         OR u.name ILIKE $2
       )
     ORDER BY u.name ASC, u.username ASC
     LIMIT 20`,
    [currentUser.id, searchTerm],
  );

  return { ok: true as const, results: result.rows };
}


export async function listIncomingFriendRequests(username: string) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const result = await pool.query(
    `SELECT
        fr.id,
        u.username AS "senderUsername",
        COALESCE(u.name, u.username) AS "senderName",
        fr.created_at AS "createdAt"
     FROM friend_requests fr
     JOIN users u ON u.id = fr.sender_id
     WHERE fr.receiver_id = $1
       AND fr.status = 'pending'
     ORDER BY fr.created_at DESC, fr.id DESC`,
    [currentUser.id],
  );

  return { ok: true as const, requests: result.rows as FriendRequestRow[] };
}

export async function sendFriendRequest(username: string, receiverUsername: string) {
  const sender = await getUserByUsername(username);
  const receiver = await getUserByUsername(receiverUsername);

  if (!sender || !receiver) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (sender.id === receiver.id) {
    return { ok: false as const, status: 400, message: 'You cannot request yourself' };
  }

  await pool.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [sender.id]);
  await pool.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [receiver.id]);

  const existingFriend = await pool.query(
    'SELECT 1 FROM friends WHERE (user1_id = LEAST($1::int, $2::int) AND user2_id = GREATEST($1::int, $2::int))',
    [sender.id, receiver.id],
  );

  if (existingFriend.rowCount) {
    return { ok: false as const, status: 400, message: 'You are already friends' };
  }

  const existingRequest = await pool.query(
    'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
    [sender.id, receiver.id],
  );

  if (existingRequest.rowCount) {
    return { ok: true as const, requestId: existingRequest.rows[0].id, message: 'Request already sent' };
  }

  const result = await pool.query(
    'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING id',
    [sender.id, receiver.id, 'pending'],
  );

  void createNotification({
    recipientId: receiver.id,
    actorId: sender.id,
    kind: 'friend_request' as any,
    title: 'Friend Request',
    message: `${sender.name || sender.username} sent you a friend request.`,
  });

  return { ok: true as const, requestId: result.rows[0].id, message: 'Friend request sent' };
}

export async function acceptFriendRequest(username: string, requestId: number) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const request = await pool.query(
    'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = $1',
    [requestId],
  );

  if (request.rowCount === 0) {
    return { ok: false as const, status: 404, message: 'Friend request not found' };
  }

  const pendingRequest = request.rows[0];

  if (pendingRequest.receiver_id !== currentUser.id) {
    return { ok: false as const, status: 403, message: 'You cannot accept this request' };
  }

  if (pendingRequest.status !== 'pending') {
    return { ok: false as const, status: 400, message: 'Friend request is not pending' };
  }

  const user1 = Math.min(pendingRequest.sender_id, pendingRequest.receiver_id);
  const user2 = Math.max(pendingRequest.sender_id, pendingRequest.receiver_id);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [pendingRequest.sender_id]);
    await client.query('INSERT INTO customer (customer_id) VALUES ($1) ON CONFLICT DO NOTHING', [pendingRequest.receiver_id]);
    await client.query('INSERT INTO friends (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user1, user2]);
    await client.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);
    await client.query('COMMIT');

    void createNotification({
      recipientId: pendingRequest.sender_id,
      actorId: currentUser.id,
      kind: 'friend_accept' as any,
      title: 'Friend Request Accepted',
      message: `${currentUser.name || currentUser.username} accepted your friend request.`,
    });

    return { ok: true as const, message: 'Friend request accepted' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function declineFriendRequest(username: string, requestId: number) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const result = await pool.query(
    'UPDATE friend_requests SET status = $1 WHERE id = $2 AND receiver_id = $3 AND status = $4 RETURNING id',
    ['declined', requestId, currentUser.id, 'pending'],
  );

  if (result.rowCount === 0) {
    return { ok: false as const, status: 404, message: 'Friend request not found' };
  }

  return { ok: true as const, message: 'Friend request declined' };
}
