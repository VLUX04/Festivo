import pool from '../db.js';
import { getUserByUsername, getUserIdByUsername } from './user.service.js';

const ensureSameRole = async (currentUsername: string, friendUsername: string) => {
	const currentUser = await getUserByUsername(currentUsername);
	const friendUser = await getUserByUsername(friendUsername);

	if (!currentUser || !friendUser) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	if (!currentUser.role || !friendUser.role || currentUser.role !== friendUser.role) {
		return { ok: false as const, status: 403, message: 'Chats are only allowed between users with the same role' };
	}

	return { ok: true as const, currentUser, friendUser };
};

export async function initiateChat(currentUsername: string, friendUsername: string) {
	const sameRoleCheck = await ensureSameRole(currentUsername, friendUsername);

	if (!sameRoleCheck.ok) {
		return sameRoleCheck;
	}

	const currentUser = sameRoleCheck.currentUser;
	const friendUser = sameRoleCheck.friendUser;

	if (!currentUser || !friendUser) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	const existingChat = await pool.query(
		`SELECT c.id FROM chat c
             JOIN chat_participants cp1 ON c.id = cp1.chat_id
             JOIN chat_participants cp2 ON c.id = cp2.chat_id
             WHERE (cp1.user_id = $1 AND cp2.user_id = $2) OR (cp1.user_id = $2 AND cp2.user_id = $1)`,
		[currentUser.id, friendUser.id],
	);

	let chatId;
	if (existingChat.rows.length > 0) {
		chatId = existingChat.rows[0].id;
	} else {
		const newChat = await pool.query('INSERT INTO chat DEFAULT VALUES RETURNING id');
		chatId = newChat.rows[0].id;

		await pool.query('INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)', [
			chatId,
			currentUser.id,
			friendUser.id,
		]);
	}

	return { ok: true as const, chatId, message: 'Chat initiated' };
}

export async function getChatMessages(currentUsername: string, chatId: string) {
	const currentUser = await getUserByUsername(currentUsername);

	if (!currentUser) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	const chatParticipant = await pool.query('SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2', [
		chatId,
		currentUser.id,
	]);

	if (chatParticipant.rows.length === 0) {
		return { ok: false as const, status: 403, message: 'Not part of this chat' };
	}

	const otherParticipant = await pool.query(
		`SELECT u.id, u.role
		 FROM chat_participants cp
		 JOIN users u ON u.id = cp.user_id
		 WHERE cp.chat_id = $1 AND cp.user_id != $2
		 LIMIT 1`,
		[chatId, currentUser.id],
	);

	if (otherParticipant.rows.length > 0 && otherParticipant.rows[0].role !== currentUser.role) {
		return { ok: false as const, status: 403, message: 'Chats are only allowed between users with the same role' };
	}

	const messages = await pool.query(
		`SELECT m.id, m.content, m.sent_at, u.username, u.name
             FROM message m
             JOIN users u ON m.sender_id = u.id
             WHERE m.chat_id = $1
             ORDER BY m.sent_at ASC`,
		[chatId],
	);

	return { ok: true as const, messages: messages.rows };
}

export async function sendChatMessage(currentUsername: string, chatId: string, content: string) {
	const sender = await getUserByUsername(currentUsername);

	if (!sender) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	const chatParticipant = await pool.query('SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2', [
		chatId,
		sender.id,
	]);

	if (chatParticipant.rows.length === 0) {
		return { ok: false as const, status: 403, message: 'Not part of this chat' };
	}

	const otherParticipant = await pool.query(
		`SELECT u.id, u.role
		 FROM chat_participants cp
		 JOIN users u ON u.id = cp.user_id
		 WHERE cp.chat_id = $1 AND cp.user_id != $2
		 LIMIT 1`,
		[chatId, sender.id],
	);

	if (otherParticipant.rows.length > 0 && otherParticipant.rows[0].role !== sender.role) {
		return { ok: false as const, status: 403, message: 'Chats are only allowed between users with the same role' };
	}

	const message = await pool.query(
		`INSERT INTO message (chat_id, sender_id, content, sent_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, content, sent_at`,
		[chatId, sender.id, content],
	);

	return { ok: true as const, message: message.rows[0] };
}

export async function getFriendChats(currentUsername: string) {
	const currentUser = await getUserByUsername(currentUsername);

	if (!currentUser) {
		return { ok: false as const, status: 404, message: 'User not found' };
	}

	const chats = await pool.query(
		`SELECT DISTINCT c.id, u.username, u.name, u.role
             FROM chat c
             JOIN chat_participants cp1 ON c.id = cp1.chat_id
             JOIN chat_participants cp2 ON c.id = cp2.chat_id
             JOIN users u ON cp2.user_id = u.id
			 WHERE cp1.user_id = $1 AND cp2.user_id != $1 AND u.role = $2
             ORDER BY c.id DESC`,
		[currentUser.id, currentUser.role],
	);

	return { ok: true as const, chats: chats.rows };
}