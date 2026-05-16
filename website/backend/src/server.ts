import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import pool from './db.js';
import { isValidEmail } from './utils.js';

// secret key for signing JWTs
const SECRET_KEY = 'my_secret_key'; //WARNING: this should probably not be here in prod, also same for all users???

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
dotenv.config();
const PORT = process.env.PORT || 3000;

if (process.env.PROD) {
	app.use(cors({origin: 'http://localhost:5173', credentials: true}));
	console.log("Prod/container cors enabled.");
} else {
	app.use(cors({origin: 'http://localhost:5173', credentials: true})); //WARNING: 0.0.0.0 != localhost - ISMA
	console.log("Dev cors enabled.");
}

//
// GETS
//
app.get('/', (req, res) => {
	res.send("Backend is running!");
})

//
// POSTS
//
app.post('/register', async (req, res) => {
	try {
		console.log(req.body);
		const {username, name, email, password} = req.body; // all non-nullable attributes in db, except role
		const role = "customer";

		// check if the account already exists
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) return res.status(400).json({success: false, message: 'An account under the provided email already exists'});

		// then check for conflicting usernames
		const username_conflict = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
		if (username_conflict.rows.length > 0)
			return res.status(409).json({success: false, message: 'Username not available.'})

        res.status(200).json({ success: true, message: 'Validation passed.' });
	} catch(err) {
		console.error(err);
		res.status(500).json({success: false, message: 'Internal server error'});
	}
});

app.post('/register/complete', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, name, email, password, accountType, bio, location, preferences } = req.body;

        const salt = await bcryptjs.genSalt(10);
        const hashedPass = await bcryptjs.hash(password, salt);

        const role = accountType === 'customer' ? 'customer' : 'professional';

        await client.query('BEGIN');

        // insert into users
		const result = await client.query(
			'INSERT INTO users (username, name, email, pass, role, information) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
			[username, name, email, hashedPass, role, bio]
		);
        const userId = result.rows[0].id;

        if (accountType === 'customer') {
            // insert into customer table
            await client.query(
                'INSERT INTO customer (customer_id) VALUES ($1)',
                [userId]
            );

            // insert preferences
            if (preferences && preferences.length > 0) {
                for (const pref of preferences) {
                    // insert tag if it doesn't exist yet
                    await client.query(
                        'INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT DO NOTHING',
                        [pref]
                    );
                    await client.query(
                        'INSERT INTO customer_preferences (customer_id, tag_name) VALUES ($1, $2)',
                        [userId, pref]
                    );
                }
            }

        } else {
            // artist or promoter -> professional_profile
            await client.query(
                'INSERT INTO professional_profile (user_id, is_verified, genre) VALUES ($1, $2, $3)',
                [userId, false, accountType == 'artist' ? preferences[0] : null]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'User created!' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/login', async(req, res) => {
	try {
		const {credential, password} = req.body;

		let db_user;
		if (isValidEmail(credential)) {
			const result = await pool.query('SELECT username, name, email, role, pass, name, email, role FROM users WHERE email = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided email not found'});

			db_user = user;
		} else {
			// authenticate based on username
			const result = await pool.query('SELECT username, name, email, role, pass, name, email, role FROM users WHERE username = $1', [credential]);

	const getEventsQuery = `
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
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided username not found'});

			db_user = user;

	app.get('/events', async (_req: any, res: any) => {
		try {
			const events = await pool.query(getEventsQuery);
			res.status(200).json({ success: true, events: events.rows });
		} catch (err) {
			console.error(err);
			res.status(500).json({ success: false, message: 'Internal server error' });
		}
	});

	app.post('/events', loginMiddleware, async (req: any, res: any) => {
		const client = await pool.connect();
		try {
			const currentUserResult = await pool.query('SELECT id, role FROM users WHERE username = $1', [req.user.username]);
			const currentUser = currentUserResult.rows[0];

			if (!currentUser) {
				return res.status(404).json({ success: false, message: 'User not found' });
			}

			if (currentUser.role !== 'professional') {
				return res.status(403).json({ success: false, message: 'Only professionals can create events' });
			}

			const {
				title,
				eventType,
				venue,
				latitude,
				longitude,
				sdate,
				edate,
				eventTime,
				target,
				description,
				price,
				imageUrl,
				imageAlt,
			} = req.body;

			if (!title || !eventType || !venue || latitude === undefined || longitude === undefined || !sdate || !edate || !eventTime || !description) {
				return res.status(400).json({ success: false, message: 'Missing required event fields' });
			}

			await client.query('BEGIN');

			const insertedEvent = await client.query(
				`INSERT INTO events (publisher_id, title, event_type, venue, latitude, longitude, sdate, edate, event_time, target, description, price)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
				 RETURNING id`,
				[
					currentUser.id,
					title,
					eventType,
					venue,
					latitude,
					longitude,
					sdate,
					edate,
					eventTime,
					target || null,
					description,
					price || null,
				],
			);

			const eventId = insertedEvent.rows[0].id;

			if (imageUrl) {
				const image = await client.query(
					'INSERT INTO images (url, alt_text) VALUES ($1, $2) RETURNING id',
					[imageUrl, imageAlt || title],
				);

				await client.query(
					'INSERT INTO event_images (event_id, image_id, is_cover) VALUES ($1, $2, TRUE)',
					[eventId, image.rows[0].id],
				);
			}

			await client.query('COMMIT');

			const createdEvent = await pool.query(`SELECT * FROM (${getEventsQuery}) events WHERE id = $1`, [eventId]);
			res.status(201).json({ success: true, event: createdEvent.rows[0] });
		} catch (err) {
			await client.query('ROLLBACK');
			console.error(err);
			res.status(500).json({ success: false, message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
		}
		
		const db_password: string = db_user.pass;
		let isPassValid;
		if (db_password !== undefined) {
			isPassValid = await bcryptjs.compare(password, db_password);
		} else {
			isPassValid = false;
		}
		if (!isPassValid) {
			return res.status(401).json({success: false, message: 'Invalid password'});
		}

        const { pass, ...userWithoutPassword } = db_user;
		// JWT
        const payload = { 
			username: db_user.username,
			name: db_user.name,
			email: db_user.email,
			role: db_user.role
		};
		const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'});

		res.status(200).json({
            token, 
            success: true, 
            message: 'Logged in successfully',
            user: userWithoutPassword // send data to frontend
        }); // change the queries here and the auth reception on the frontend if you need to send more info on the user
	} catch (err) {
		console.error(err);
		res.status(500).json({success: false, message: 'Internal server error'});
	}
});

// use this to protect routes
const loginMiddleware = async (req: any, res: any, next: any) => {
	const authorization = req.headers['authorization'];
	const token = authorization && authorization.split(' ')[1];

	if (!token) {
		return res.status(401).json({ success: false, message: 'Inexistent or invalid auth token'});
	}

	jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
		if (err) return res.status(403).json({success: false, message: 'Invalid auth token'});

		req.user = user;
		next();
	});
};

//
// CHAT ENDPOINTS
//

// Get or create a chat between two users
app.post('/chat/initiate', loginMiddleware, async (req: any, res: any) => {
	try {
		const { friendUsername } = req.body;
		const currentUsername = req.user.username;

		const currentUserResult = await pool.query('SELECT id FROM users WHERE username = $1', [currentUsername]);
		const friendUserResult = await pool.query('SELECT id FROM users WHERE username = $1', [friendUsername]);

		if (currentUserResult.rows.length === 0 || friendUserResult.rows.length === 0) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		const currentUserId = currentUserResult.rows[0].id;
		const friendUserId = friendUserResult.rows[0].id;

		const existingChat = await pool.query(
			`SELECT c.id FROM chat c
			 JOIN chat_participants cp1 ON c.id = cp1.chat_id
			 JOIN chat_participants cp2 ON c.id = cp2.chat_id
			 WHERE (cp1.user_id = $1 AND cp2.user_id = $2) OR (cp1.user_id = $2 AND cp2.user_id = $1)`,
			[currentUserId, friendUserId]
		);

		let chatId;
		if (existingChat.rows.length > 0) {
			chatId = existingChat.rows[0].id;
		} else {
			const newChat = await pool.query('INSERT INTO chat DEFAULT VALUES RETURNING id');
			chatId = newChat.rows[0].id;

			await pool.query('INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)', 
				[chatId, currentUserId, friendUserId]);
		}

		res.status(200).json({ success: true, chatId, message: 'Chat initiated' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

app.get('/chat/messages/:chatId', loginMiddleware, async (req: any, res: any) => {
	try {
		const { chatId } = req.params;
		const currentUsername = req.user.username;

		const currentUserResult = await pool.query('SELECT id FROM users WHERE username = $1', [currentUsername]);
		const currentUserId = currentUserResult.rows[0].id;

		const chatParticipant = await pool.query(
			'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
			[chatId, currentUserId]
		);

		if (chatParticipant.rows.length === 0) {
			return res.status(403).json({ success: false, message: 'Not part of this chat' });
		}

		const messages = await pool.query(
			`SELECT m.id, m.content, m.sent_at, u.username, u.name
			 FROM message m
			 JOIN users u ON m.sender_id = u.id
			 WHERE m.chat_id = $1
			 ORDER BY m.sent_at ASC`,
			[chatId]
		);

		res.status(200).json({ success: true, messages: messages.rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

app.post('/chat/send', loginMiddleware, async (req: any, res: any) => {
	try {
		const { chatId, content } = req.body;
		const currentUsername = req.user.username;

		const senderResult = await pool.query('SELECT id FROM users WHERE username = $1', [currentUsername]);
		const senderId = senderResult.rows[0].id;

		const chatParticipant = await pool.query(
			'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
			[chatId, senderId]
		);

		if (chatParticipant.rows.length === 0) {
			return res.status(403).json({ success: false, message: 'Not part of this chat' });
		}

		const message = await pool.query(
			`INSERT INTO message (chat_id, sender_id, content, sent_at)
			 VALUES ($1, $2, $3, NOW())
			 RETURNING id, content, sent_at`,
			[chatId, senderId, content]
		);

		res.status(201).json({ success: true, message: message.rows[0] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

app.get('/chat/friends', loginMiddleware, async (req: any, res: any) => {
	try {
		const currentUsername = req.user.username;

		const currentUserResult = await pool.query('SELECT id FROM users WHERE username = $1', [currentUsername]);
		const currentUserId = currentUserResult.rows[0].id;

		const chats = await pool.query(
			`SELECT DISTINCT c.id, u.username, u.name, u.role
			 FROM chat c
			 JOIN chat_participants cp1 ON c.id = cp1.chat_id
			 JOIN chat_participants cp2 ON c.id = cp2.chat_id
			 JOIN users u ON cp2.user_id = u.id
			 WHERE cp1.user_id = $1 AND cp2.user_id != $1
			 ORDER BY c.id DESC`,
			[currentUserId]
		);

		res.status(200).json({ success: true, chats: chats.rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

app.listen(PORT, () => console.log('running broder ' + process.env.DB_HOST));
