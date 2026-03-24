import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import pool from './db.js';

// secret key for signing JWTs
const SECRET_KEY = 'my_secret_key'; //WARNING: this should probably not be here in prod, also same for all users???

const app = express();
const PORT = 3000;

app.use(cors({origin: 'http://127.0.0.1:5173'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
		const {username, email, password, role} = req.body; // all non-nullable attributes in db

        const existing = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
		if (existing.rows.length > 0) return res.status(400).json({success: false, message: 'User already exists'});

		const salt = await bcryptjs.genSalt(10);
		const hashedPass = await bcryptjs.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, email, pass, role) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPass, role]
        );

		res.status(201).json({success: true, message: 'New user created!'});
	} catch(err) {
		console.error(err);
		res.status(500).json({success: false, message: 'Internal server error'});
	}
});

app.post('/login', async(req, res) => {
	try {
		const {username, password} = req.body;

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0]; 
		if (!user) return res.status(404).json({success: false, message: 'User not found'});

		const isPassValid = await bcryptjs.compare(password, user.pass);
		if (!isPassValid) {
			return res.status(401).json({success: false, message: 'Invalid password'});
		}

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
