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
	app.use(cors({origin: 'http://frontend:5173', credentials: true}));
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
        const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) return res.status(400).json({success: false, message: 'An account under the provided email already exists'});

		// then check for conflicting usernames
		const username_conflict = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
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
			// authenticate based on email
			const result = await pool.query('SELECT 1 FROM users WHERE email = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided email not found'});

			db_user = user;
		} else {
			// authenticate based on username
			const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided username not found'});

			db_user = user;
		}
		const isPassValid = await bcryptjs.compare(password, db_user.pass);
		if (!isPassValid) {
			return res.status(401).json({success: false, message: 'Invalid password'});
		}

		const username = db_user.username;

		// JWT
		const payload = { username };
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

app.listen(PORT, () => console.log('running'));
