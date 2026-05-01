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

		const salt = await bcryptjs.genSalt(10);
		const hashedPass = await bcryptjs.hash(password, salt);

        await pool.query(
            'INSERT INTO users (username, name, email, pass, role) VALUES ($1, $2, $3, $4, $5)',
            [username, name, email, hashedPass, role]
        );

		res.status(201).json({success: true, message: 'New user created!'});
		console.log("Registration successful");
	} catch(err) {
		console.error(err);
		res.status(500).json({success: false, message: 'Internal server error'});
	}
});

app.post('/login', async(req, res) => {
	try {
		const {credential, password} = req.body;

		let db_user;
		if (isValidEmail(credential)) {
			const result = await pool.query('SELECT username, pass, name, email, role FROM users WHERE email = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided email not found'});

			db_user = user;
		} else {
			// authenticate based on username
			const result = await pool.query('SELECT username, pass, name, email, role FROM users WHERE username = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided username not found'});

			db_user = user;
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

		const username: string = db_user.username;

		// JWT
		const payload = { 
			username: db_user.username,
			name: db_user.name,
			email: db_user.email,
			role: db_user.role
		};
		const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'});

		res.status(200).json({token, success: true, message: 'Logged in successfully'});
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
