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
	app.use(cors({origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true}));
	console.log("Prod/container cors enabled.");
} else {
	app.use(cors({origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true})); //WARNING: 0.0.0.0 != localhost - ISMA
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
            'INSERT INTO users (username, name, email, pass, role, information, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [username, name, email, hashedPass, role, bio, location]
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
                'INSERT INTO professional_profile (user_id, is_verified) VALUES ($1, $2)',
                [userId, false]
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
			// authenticate based on email
			const result = await pool.query('SELECT username, pass FROM users WHERE email = $1', [credential]);
			const user = result.rows[0];
			if (!user) return res.status(404).json({success: false, message: 'User with the provided email not found'});

			db_user = user;
		} else {
			// authenticate based on username
			const result = await pool.query('SELECT username, pass FROM users WHERE username = $1', [credential]);
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

app.listen(PORT, () => console.log('running broder ' + process.env.DB_HOST));
