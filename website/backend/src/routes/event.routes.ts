import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { SECRET_KEY } from '../services/auth.service.js';
import {
	attendEvent,
	cancelAttendance,
	createEvent,
	createEventReview,
	getAttendanceStatus,
	getEventAnalytics,
	getEventAttendees,
	getEventById,
	getEventGallery,
	getEventReviews,
	getMyEvents,
	getMyProfessionalAssignments,
	getRecommendedEvents,
	getSavedEvents,
	getSavedStatus,
	listEvents,
	saveEvent,
	sendProfessionalInvite,
	unsaveEvent,
	updateAttendeeStatus,
	updateEvent,
} from '../services/event.service.js';

const router = Router();

const extractOptionalUsername = (req: any): string | undefined => {
	const authorization = req.headers['authorization'];
	const token = authorization && authorization.split(' ')[1];
	if (!token) return undefined;
	try {
		const payload = jwt.verify(token, SECRET_KEY) as { username?: string };
		return typeof payload.username === 'string' ? payload.username : undefined;
	} catch {
		return undefined;
	}
};

router.get('/saved', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getSavedEvents(req.user.username);
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true, events: result.events });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/my', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getMyEvents(req.user.username);
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true, events: result.events });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/my-assignments', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getMyProfessionalAssignments(req.user.username);
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true, assignments: result.assignments });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

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

router.get('/:id', async (req, res) => {
	try {
		const event = await getEventById(Number(req.params.id));
		if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
		res.status(200).json({ success: true, event });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.put('/:id', loginMiddleware, async (req: any, res) => {
	try {
		const eventId = Number(req.params.id);
		const result = await updateEvent(req.user.username, eventId, req.body);
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/reviews', async (req, res) => {
	try {
		const reviews = await getEventReviews(Number(req.params.id));
		res.status(200).json({ success: true, reviews });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/:id/reviews', loginMiddleware, async (req: any, res) => {
	try {
		const { rating, information } = req.body;
		const result = await createEventReview(req.user.username, Number(req.params.id), Number(rating), information ?? '');
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(201).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/attend-status', async (req: any, res) => {
	try {
		const username = extractOptionalUsername(req);
		const result = await getAttendanceStatus(username, Number(req.params.id));
		res.status(200).json({ success: true, ...result });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/:id/attend', loginMiddleware, async (req: any, res) => {
	try {
		const result = await attendEvent(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.delete('/:id/attend', loginMiddleware, async (req: any, res) => {
	try {
		const result = await cancelAttendance(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/attendees', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getEventAttendees(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true, attendees: result.attendees, total: result.total });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.put('/:id/attendees/:userId', loginMiddleware, async (req: any, res) => {
	try {
		const { status } = req.body;
		const result = await updateAttendeeStatus(req.user.username, Number(req.params.id), Number(req.params.userId), status);
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/:id/invites', loginMiddleware, async (req: any, res) => {
	try {
		const { professionalUsername, message } = req.body;
		const result = await sendProfessionalInvite(req.user.username, professionalUsername, Number(req.params.id), message ?? '');
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(201).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/gallery', async (req, res) => {
	try {
		const result = await getEventGallery(Number(req.params.id));
		res.status(200).json({ success: true, gallery: result.gallery });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/save-status', async (req: any, res) => {
	try {
		const username = extractOptionalUsername(req);
		const result = await getSavedStatus(username, Number(req.params.id));
		res.status(200).json({ success: true, ...result });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/:id/save', loginMiddleware, async (req: any, res) => {
	try {
		const result = await saveEvent(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.delete('/:id/save', loginMiddleware, async (req: any, res) => {
	try {
		const result = await unsaveEvent(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.get('/:id/analytics', loginMiddleware, async (req: any, res) => {
	try {
		const result = await getEventAnalytics(req.user.username, Number(req.params.id));
		if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
		res.status(200).json({ success: true, analytics: result.analytics });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

export default router;