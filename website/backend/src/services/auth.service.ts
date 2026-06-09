import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import pool from '../db.js';
import { isValidEmail } from '../utils.js';
import { getUserByEmail, getUserByUsername } from './user.service.js';

export const SECRET_KEY = process.env.JWT_SECRET ?? 'my_secret_key';

type RegisterPayload = {
	username: string;
	name: string;
	email: string;
	password: string;
};

type CompleteRegistrationPayload = RegisterPayload & {
	accountType: 'customer' | 'artist' | 'promoter' | string;
	bio?: string;
	location?: string;
	preferences?: string[];
};

export async function validateRegistration(payload: RegisterPayload) {
	if (!isValidEmail(payload.email)) {
		return { ok: false as const, status: 400, message: 'Invalid email address' };
	}

	const existing = await getUserByEmail(payload.email);
	if (existing) {
		return { ok: false as const, status: 400, message: 'An account under the provided email already exists' };
	}

	const usernameConflict = await getUserByUsername(payload.username);
	if (usernameConflict) {
		return { ok: false as const, status: 409, message: 'Username not available.' };
	}

	return { ok: true as const, message: 'Validation passed.' };
}

export async function completeRegistration(payload: CompleteRegistrationPayload) {
	const client = await pool.connect();

	try {
		const salt = await bcryptjs.genSalt(10);
		const hashedPass = await bcryptjs.hash(payload.password, salt);
		const role = payload.accountType === 'customer' ? 'customer' : 'professional';

		await client.query('BEGIN');

		const result = await client.query(
			'INSERT INTO users (username, name, email, pass, role, information) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
			[payload.username, payload.name, payload.email, hashedPass, role, payload.bio ?? null],
		);
		const userId = result.rows[0].id;

		if (payload.accountType === 'customer') {
			await client.query('INSERT INTO customer (customer_id) VALUES ($1)', [userId]);

			if (payload.preferences && payload.preferences.length > 0) {
				for (const preference of payload.preferences) {
					await client.query('INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT DO NOTHING', [preference]);
					await client.query(
						'INSERT INTO customer_preferences (customer_id, tag_name) VALUES ($1, $2)',
						[userId, preference],
					);
				}
			}
		} else {
			await client.query(
				'INSERT INTO professional_profile (user_id, is_verified, genre) VALUES ($1, $2, $3)',
				[userId, false, payload.accountType === 'artist' ? payload.preferences?.[0] ?? null : null],
			);
		}

		await client.query('COMMIT');
		return { success: true, message: 'User created!' };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

export async function loginUser(credential: string, password: string) {
	const credentialIsEmail = isValidEmail(credential);
	const user = credentialIsEmail
		? await getUserByEmail(credential)
		: await getUserByUsername(credential) || await pool.query(
			'SELECT id, username, name, email, role, pass, information FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1',
			[credential],
		  ).then((result) => result.rows[0]);

	if (!user) {
		return {
			ok: false as const,
			status: 404,
			message: credentialIsEmail ? 'User with the provided email not found' : 'User with the provided username not found',
		};
	}

	const isPassValid = user.pass ? await bcryptjs.compare(password, user.pass) : false;
	if (!isPassValid) {
		return { ok: false as const, status: 401, message: 'Invalid password' };
	}

	const { pass, ...userWithoutPassword } = user;
	const payload = {
		id: user.id,
		username: user.username,
		name: user.name,
	email: user.email,
		role: user.role,
	};
	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

	return {
		ok: true as const,
		token,
		user: userWithoutPassword,
	};
}