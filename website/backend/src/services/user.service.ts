import pool from '../db.js';

export async function getUserByEmail(email: string) {
	const result = await pool.query(
		'SELECT id, username, name, email, role, pass, information FROM users WHERE email = $1',
		[email],
	);

	return result.rows[0];
}

export async function getUserByUsername(username: string) {
	const result = await pool.query(
		'SELECT id, username, name, email, role, pass, information FROM users WHERE username = $1',
		[username],
	);

	return result.rows[0];
}

export async function getUserIdByUsername(username: string) {
	const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

	return result.rows[0];
}

export async function getUserRoleByUsername(username: string) {
	const result = await pool.query('SELECT id, role FROM users WHERE username = $1', [username]);

	return result.rows[0];
}