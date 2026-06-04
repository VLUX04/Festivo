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

router.post('/share', loginMiddleware, async (req: any, res) => {
	try {
		const { friendUsername, itemType, itemId, title, url, body } = req.body;

		if (!friendUsername || !itemType || !itemId || !title || !url) {
			return res.status(400).json({ success: false, message: 'Missing share data' });
		}

		const chatResult = await initiateChat(req.user.username, friendUsername);

		if (!chatResult.ok) {
			return res.status(chatResult.status).json({ success: false, message: chatResult.message });
		}

		const content = JSON.stringify({
			kind: 'share',
			itemType,
			itemId,
			title,
			url,
			body: body || '',
		});

		const sendResult = await sendChatMessage(req.user.username, String(chatResult.chatId), content);

		if (!sendResult.ok) {
			return res.status(sendResult.status).json({ success: false, message: sendResult.message });
		}

		res.status(201).json({ success: true, chatId: chatResult.chatId, message: 'Shared successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

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