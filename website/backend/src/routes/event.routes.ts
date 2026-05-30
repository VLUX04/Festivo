import { Router } from 'express';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { createEvent, getRecommendedEvents, listEvents } from '../services/event.service.js';

const router = Router();

router.get('/', async (_req, res) => {
	try {
		const events = await listEvents();
		res.status(200).json({ success: true, events });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/', loginMiddleware, async (req: any, res) => {
	try {
		const result = await createEvent(req.user.username, req.body);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(201).json({ success: true, event: result.event });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/recommended/:userId', async (req, res) => {
	try {
		const events = await getRecommendedEvents(req.params.userId);
		res.status(200).json({ success: true, events });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

export default router;