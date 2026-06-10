import pool from '../db.js';
import { getUserByUsername } from './user.service.js';

export async function createNotification(params: {
  recipientId: number;
  actorId: number;
  kind: 'follow' | 'like' | 'comment' | 'share' | 'favorite' | 'friend_request' | 'friend_accept';
  title: string;
  message: string;
  publicationId?: number;
  eventId?: number;
}) {
  if (params.recipientId === params.actorId) return;
  await pool.query(
    `INSERT INTO notifications (recipient_user_id, actor_user_id, kind, title, message, publication_id, event_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [params.recipientId, params.actorId, params.kind, params.title, params.message,
     params.publicationId ?? null, params.eventId ?? null],
  );
}

export async function getNotifications(username: string) {
  const user = await getUserByUsername(username);
  if (!user) return { ok: false as const, status: 404, message: 'User not found' };

  const result = await pool.query(
    `SELECT
        n.id,
        n.kind,
        n.title,
        n.message,
        n.is_read AS "isRead",
        n.created_at AS "createdAt",
        n.publication_id AS "publicationId",
        n.event_id AS "eventId",
        u.username AS "actorUsername",
        COALESCE(u.name, u.username) AS "actorName"
     FROM notifications n
     JOIN users u ON u.id = n.actor_user_id
     WHERE n.recipient_user_id = $1
     ORDER BY n.created_at DESC, n.id DESC
     LIMIT 50`,
    [user.id],
  );

  const unreadCount = result.rows.filter((r) => !r.isRead).length;
  return { ok: true as const, notifications: result.rows, unreadCount };
}

export async function markNotificationRead(username: string, notificationId: number) {
  const user = await getUserByUsername(username);
  if (!user) return { ok: false as const, status: 404, message: 'User not found' };

  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_user_id = $2',
    [notificationId, user.id],
  );
  return { ok: true as const };
}

export async function markAllNotificationsRead(username: string) {
  const user = await getUserByUsername(username);
  if (!user) return { ok: false as const, status: 404, message: 'User not found' };

  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE recipient_user_id = $1 AND is_read = FALSE',
    [user.id],
  );
  return { ok: true as const };
}
