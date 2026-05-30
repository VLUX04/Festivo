import pool from '../db.js';
import { getUserRoleByUsername } from './user.service.js';

export const getEventsQuery = `
    SELECT
        e.id,
        e.title,
        e.event_type AS "eventType",
        e.venue,
        e.latitude,
        e.longitude,
        e.sdate,
        e.edate,
        e.event_time AS "eventTime",
        e.target,
        e.description,
        e.price,
        COALESCE(u.name, u.username) AS promoter,
        COALESCE(img.url, '') AS src,
        COALESCE(img.alt_text, e.title) AS alt,
        COALESCE(attending.attending_count, 0) AS "attendingCount"
    FROM events e
    LEFT JOIN users u ON e.publisher_id = u.id
    LEFT JOIN LATERAL (
        SELECT i.url, i.alt_text
        FROM event_images ei
        JOIN images i ON i.id = ei.image_id
        WHERE ei.event_id = e.id
        ORDER BY ei.is_cover DESC, i.id ASC
        LIMIT 1
    ) img ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS attending_count
        FROM application a
        WHERE a.event_id = e.id
    ) attending ON true
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
	imageUrl?: string;
	imageAlt?: string;
};

export async function listEvents() {
	const events = await pool.query(getEventsQuery);
	return events.rows;
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