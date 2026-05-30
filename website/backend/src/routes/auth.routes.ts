import { Router } from 'express';

import { completeRegistration, loginUser, validateRegistration } from '../services/auth.service.js';

const router = Router();

router.post('/register', async (req, res) => {
	try {
		const validation = await validateRegistration(req.body);

		if (!validation.ok) {
			return res.status(validation.status).json({ success: false, message: validation.message });
		}

		res.status(200).json({ success: true, message: validation.message });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/register/complete', async (req, res) => {
	try {
		await completeRegistration(req.body);
		res.status(201).json({ success: true, message: 'User created!' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { credential, password } = req.body;
		const result = await loginUser(credential, password);

		if (!result.ok) {
			return res.status(result.status).json({ success: false, message: result.message });
		}

		res.status(200).json({
			token: result.token,
			success: true,
			message: 'Logged in successfully',
			user: result.user,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

export default router;