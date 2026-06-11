import pool from '../db.js';
import { getUserByUsername, getUserRoleByUsername } from './user.service.js';

export const getEventsQuery = `
    SELECT
        e.id,
        e.title,
        e.event_type AS "eventType",
		u.username AS "promoterUsername",
		COALESCE(u.name, u.username) AS promoter,
        e.venue,
        e.latitude,
        e.longitude,
        e.sdate,
        e.edate,
        e.event_time AS "eventTime",
        e.target,
        e.description,
        e.price,
		e.ticket_link AS "ticketLink",
		COALESCE((
			SELECT i.url
			FROM event_images ei
			JOIN images i ON i.id = ei.image_id
			WHERE ei.event_id = e.id AND ei.is_cover = TRUE
			ORDER BY i.id ASC
			LIMIT 1
		), '') AS src,
		COALESCE(e.title, e.description, 'Event') AS alt,
		0::int AS "attendingCount"
    FROM events e
    LEFT JOIN users u ON u.id = e.publisher_id
    ORDER BY e.sdate ASC, e.event_time ASC, e.id ASC
`;

type CreateEventPayload = {
	title: string;
	eventType: string;
	venue: string;
	latitude: number;
	longitude: number;
	sdate: string;
	edate: string;
	eventTime: string;
	target?: string;
	description: string;
	price?: number;
	ticketLink?: string;
	imageUrl?: string;
	imageAlt?: string;
};

export async function listEvents() {
	const events = await pool.query(getEventsQuery);
	return events.rows;
}

export async function getEventById(eventId: number) {
	const result = await pool.query(`SELECT * FROM (${getEventsQuery}) events WHERE id = $1`, [eventId]);
	return result.rows[0] ?? null;
}

export async function createEvent(username: string, payload: CreateEventPayload) {
	const currentUser = await getUserRoleByUsername(username);

	if (!currentUser) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	if (currentUser.role !== 'professional') {
		return { ok: false as const, status: 403, message: 'Only professionals can create events' };
	}

	if (
		!payload.title ||
		!payload.eventType ||
		!payload.venue ||
		payload.latitude === undefined ||
		payload.longitude === undefined ||
		!payload.sdate ||
		!payload.edate ||
		!payload.eventTime ||
		!payload.description
	) {
		return { ok: false as const, status: 400, message: 'Missing required event fields' };
	}

	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const insertedEvent = await client.query(
			`INSERT INTO events (publisher_id, title, event_type, venue, latitude, longitude, sdate, edate, event_time, target, description, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
			[
				currentUser.id,
				payload.title,
				payload.eventType,
				payload.venue,
				payload.latitude,
				payload.longitude,
				payload.sdate,
				payload.edate,
				payload.eventTime,
				payload.target || null,
				payload.description,
				payload.price || null,
			],
		);

		const eventId = insertedEvent.rows[0].id;

		if (payload.ticketLink) {
			await client.query('UPDATE events SET ticket_link = $1 WHERE id = $2', [payload.ticketLink, eventId]);
		}

		if (payload.imageUrl) {
			const image = await client.query('INSERT INTO images (url, alt_text) VALUES ($1, $2) RETURNING id', [
				payload.imageUrl,
				payload.imageAlt || payload.title,
			]);

			await client.query('INSERT INTO event_images (event_id, image_id, is_cover) VALUES ($1, $2, TRUE)', [
				eventId,
				image.rows[0].id,
			]);
		}

		await client.query('COMMIT');

		const createdEvent = await pool.query(`SELECT * FROM (${getEventsQuery}) events WHERE id = $1`, [eventId]);

		return { ok: true as const, event: createdEvent.rows[0] };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

export async function getRecommendedEvents(userId: string) {
	const result = await pool.query(
		`
            SELECT 
                e.*,
                COUNT(DISTINCT cp.tag_name) AS score
            FROM events e
            LEFT JOIN event_tags et ON et.event_id = e.id
            LEFT JOIN customer_preferences cp 
                ON cp.tag_name = et.tag_name
                AND cp.customer_id = $1
            GROUP BY e.id
            ORDER BY score DESC
            LIMIT 6
        `,
		[userId],
	);

	return result.rows;
}

export async function getEventReviews(eventId: number) {
	const result = await pool.query(
		`SELECT
			er.user_id AS id,
			u.username AS "reviewerUsername",
			COALESCE(u.name, u.username) AS "reviewerName",
			er.rating,
			er.information,
			er.sent_date AS "sentDate"
		 FROM event_review er
		 JOIN users u ON u.id = er.user_id
		 WHERE er.event_id = $1
		 ORDER BY er.sent_date DESC, er.user_id DESC`,
		[eventId],
	);
	return result.rows;
}

export async function createEventReview(username: string, eventId: number, rating: number, information: string) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
		return { ok: false as const, status: 400, message: 'Rating must be between 1 and 5' };
	}

	const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) {
		return { ok: false as const, status: 404, message: 'Event not found' };
	}

	await pool.query(
		`INSERT INTO event_review (user_id, event_id, rating, sent_date, information)
		 VALUES ($1, $2, $3, CURRENT_DATE, $4)
		 ON CONFLICT (user_id, event_id)
		 DO UPDATE SET rating = EXCLUDED.rating, sent_date = EXCLUDED.sent_date, information = EXCLUDED.information`,
		[user.id, eventId, rating, information.trim()],
	);

	return { ok: true as const };
}

export async function attendEvent(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) {
		return { ok: false as const, status: 404, message: 'Event not found' };
	}

	await pool.query(
		`INSERT INTO attended_events (user_id, event_id, status)
		 VALUES ($1, $2, 'Going')
		 ON CONFLICT (user_id, event_id) DO NOTHING`,
		[user.id, eventId],
	);

	return { ok: true as const };
}

export async function cancelAttendance(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	await pool.query('DELETE FROM attended_events WHERE user_id = $1 AND event_id = $2', [user.id, eventId]);
	return { ok: true as const };
}

export async function getAttendanceStatus(username: string | undefined, eventId: number) {
	if (!username) return { attending: false };
	const user = await getUserByUsername(username);
	if (!user) return { attending: false };

	const result = await pool.query(
		'SELECT status FROM attended_events WHERE user_id = $1 AND event_id = $2',
		[user.id, eventId],
	);
	return { attending: (result.rowCount ?? 0) > 0, status: result.rows[0]?.status || null };
}

export async function getEventAttendees(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id, publisher_id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };

	const result = await pool.query(
		`SELECT
			ae.user_id AS "userId",
			COALESCE(u.name, u.username) AS name,
			u.username,
			u.role,
			ae.status,
			ae.attended_at AS "attendedAt"
		 FROM attended_events ae
		 JOIN users u ON u.id = ae.user_id
		 WHERE ae.event_id = $1
		 ORDER BY ae.attended_at ASC`,
		[eventId],
	);

	return { ok: true as const, attendees: result.rows, total: result.rowCount ?? 0 };
}

export async function updateAttendeeStatus(organizerUsername: string, eventId: number, userId: number, status: string) {
	const organizer = await getUserByUsername(organizerUsername);
	if (!organizer) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id, publisher_id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };
	if (eventCheck.rows[0].publisher_id !== organizer.id) {
		return { ok: false as const, status: 403, message: 'Only the event organizer can update attendee status' };
	}

	await pool.query(
		`INSERT INTO attended_events (user_id, event_id, status)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (user_id, event_id) DO UPDATE SET status = EXCLUDED.status`,
		[userId, eventId, status],
	);

	return { ok: true as const };
}

export async function updateEvent(username: string, eventId: number, payload: Partial<CreateEventPayload>) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id, publisher_id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };
	if (eventCheck.rows[0].publisher_id !== user.id) {
		return { ok: false as const, status: 403, message: 'You can only edit your own events' };
	}

	const fields: string[] = [];
	const values: unknown[] = [];
	let idx = 1;

	const map: Record<string, string> = {
		title: 'title', eventType: 'event_type', venue: 'venue',
		latitude: 'latitude', longitude: 'longitude',
		sdate: 'sdate', edate: 'edate', eventTime: 'event_time',
		target: 'target', description: 'description', price: 'price', ticketLink: 'ticket_link',
	};

	for (const [key, col] of Object.entries(map)) {
		const val = (payload as Record<string, unknown>)[key];
		if (val !== undefined) {
			fields.push(`${col} = $${idx++}`);
			values.push(val);
		}
	}

	if (fields.length === 0) return { ok: false as const, status: 400, message: 'No fields to update' };

	values.push(eventId);
	await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = $${idx}`, values);

	return { ok: true as const };
}

export async function getMyEvents(username: string) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const result = await pool.query(
		`SELECT
			e.id,
			e.title,
			e.event_type AS "eventType",
			e.venue,
			e.sdate,
			e.edate,
			e.event_time AS "eventTime",
			e.description,
			e.price,
			e.ticket_link AS "ticketLink",
			COUNT(ae.user_id)::int AS "attendeeCount"
		 FROM events e
		 LEFT JOIN attended_events ae ON ae.event_id = e.id
		 WHERE e.publisher_id = $1
		 GROUP BY e.id
		 ORDER BY e.sdate ASC, e.id ASC`,
		[user.id],
	);

	return { ok: true as const, events: result.rows };
}

export async function sendProfessionalInvite(organizerUsername: string, professionalUsername: string, eventId: number, message: string) {
	const organizer = await getUserByUsername(organizerUsername);
	const professional = await getUserByUsername(professionalUsername);

	if (!organizer || !professional) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id, publisher_id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };
	if (eventCheck.rows[0].publisher_id !== organizer.id) {
		return { ok: false as const, status: 403, message: 'Only the event organizer can send invites' };
	}

	const profCheck = await pool.query('SELECT user_id FROM professional_profile WHERE user_id = $1', [professional.id]);
	if (profCheck.rowCount === 0) return { ok: false as const, status: 400, message: 'Target user must be a professional' };

	await pool.query(
		`INSERT INTO professional_invite (sender_id, receiver_id, event_id, invite, answer)
		 VALUES ($1, $2, $3, $4, 'pending')
		 ON CONFLICT (sender_id, receiver_id) DO UPDATE SET event_id = EXCLUDED.event_id, invite = EXCLUDED.invite, answer = 'pending'`,
		[organizer.id, professional.id, eventId, message || null],
	);

	await pool.query(
		`INSERT INTO professional_history (professional_id, event_id)
		 VALUES ($1, $2)
		 ON CONFLICT DO NOTHING`,
		[professional.id, eventId],
	);

	return { ok: true as const };
}

export async function getMyProfessionalAssignments(username: string) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const result = await pool.query(
		`SELECT
			e.id,
			e.title,
			e.event_type AS "eventType",
			e.venue AS location,
			e.sdate,
			e.edate,
			COALESCE(pi.answer, 'pending') AS status
		 FROM professional_history ph
		 JOIN events e ON e.id = ph.event_id
		 LEFT JOIN professional_invite pi ON pi.receiver_id = ph.professional_id AND pi.event_id = ph.event_id
		 WHERE ph.professional_id = $1
		 ORDER BY e.sdate DESC`,
		[user.id],
	);

	return { ok: true as const, assignments: result.rows };
}

export async function saveEvent(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };

	await pool.query(
		'INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
		[user.id, eventId],
	);
	return { ok: true as const };
}

export async function unsaveEvent(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	await pool.query('DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2', [user.id, eventId]);
	return { ok: true as const };
}

export async function getSavedStatus(username: string | undefined, eventId: number) {
	if (!username) return { saved: false };
	const user = await getUserByUsername(username);
	if (!user) return { saved: false };

	const result = await pool.query(
		'SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2',
		[user.id, eventId],
	);
	return { saved: (result.rowCount ?? 0) > 0 };
}

export async function getSavedEvents(username: string) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const result = await pool.query(
		`SELECT
			e.id,
			e.title,
			e.event_type AS "eventType",
			e.venue,
			e.sdate,
			e.edate,
			e.event_time AS "eventTime",
			e.description,
			e.price,
			se.saved_at AS "savedAt"
		 FROM saved_events se
		 JOIN events e ON e.id = se.event_id
		 WHERE se.user_id = $1
		 ORDER BY se.saved_at DESC`,
		[user.id],
	);
	return { ok: true as const, events: result.rows };
}

export async function getEventGallery(eventId: number) {
	const result = await pool.query(
		`SELECT
			p.id,
			COALESCE(u.name, u.username) AS author,
			u.username,
			p.media AS image,
			COALESCE(p.media_type, 'image') AS "mediaType",
			p.information AS caption,
			p.likes,
			TO_CHAR(p.publish_date, 'Mon DD, YYYY') AS date
		 FROM publication p
		 JOIN users u ON u.id = p.user_id
		 WHERE p.event_id = $1
		 ORDER BY p.publish_date DESC, p.id DESC
		 LIMIT 30`,
		[eventId],
	);
	return { ok: true as const, gallery: result.rows };
}

export async function getEventAnalytics(username: string, eventId: number) {
	const user = await getUserByUsername(username);
	if (!user) return { ok: false as const, status: 404, message: 'User not found' };

	const eventCheck = await pool.query('SELECT id, publisher_id FROM events WHERE id = $1', [eventId]);
	if (eventCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Event not found' };
	if (eventCheck.rows[0].publisher_id !== user.id) {
		return { ok: false as const, status: 403, message: 'Only the organizer can view analytics' };
	}

	const [attendees, reviews, publications, saved] = await Promise.all([
		pool.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = \'Going\')::int AS going, COUNT(*) FILTER (WHERE status = \'VIP\')::int AS vip FROM attended_events WHERE event_id = $1', [eventId]),
		pool.query('SELECT COUNT(*)::int AS total, ROUND(AVG(rating), 1) AS avg_rating FROM event_review WHERE event_id = $1', [eventId]),
		pool.query('SELECT COUNT(*)::int AS total, COALESCE(SUM(likes),0)::int AS total_likes, COALESCE(SUM(shares),0)::int AS total_shares FROM publication WHERE event_id = $1', [eventId]),
		pool.query('SELECT COUNT(*)::int AS total FROM saved_events WHERE event_id = $1', [eventId]),
	]);

	return {
		ok: true as const,
		analytics: {
			attendance: attendees.rows[0],
			reviews: reviews.rows[0],
			publications: publications.rows[0],
			saves: saved.rows[0].total,
		},
	};
}
