import { Router } from 'express';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { getChatMessages, getFriendChats, initiateChat, sendChatMessage } from '../services/chat.service.js';

const router = Router();

router.post('/initiate', loginMiddleware, async (req: any, res) => {
	try {
		const { friendUsername } = req.body;
		const result = await initiateChat(req.user.username, friendUsername);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(200).json({ success: true, chatId: result.chatId, message: result.message });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/messages/:chatId', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getChatMessages(req.user.username, req.params.chatId);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(200).json({ success: true, messages: result.messages });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/send', loginMiddleware, async (req: any, res) => {
	try {
		const { chatId, content } = req.body;
		const result = await sendChatMessage(req.user.username, chatId, content);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(201).json({ success: true, message: result.message });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

// Removed legacy /share endpoint — sharing is handled by initiating a chat and sending
// a message via /initiate and /send. This keeps the API minimal.

router.get('/friends', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getFriendChats(req.user.username);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(200).json({ success: true, chats: result.chats });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

export default router;