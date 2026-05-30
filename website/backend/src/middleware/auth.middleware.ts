import jwt from 'jsonwebtoken';

import { SECRET_KEY } from '../services/auth.service.js';

export const loginMiddleware = async (req: any, res: any, next: any) => {
	const authorization = req.headers['authorization'];
	const token = authorization && authorization.split(' ')[1];

	if (!token) {
		return res.status(401).json({ success: false, message: 'Inexistent or invalid auth token' });
	}

	jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
		if (err) {
			return res.status(403).json({ success: false, message: 'Invalid auth token' });
		}

		req.user = user;
		next();
	});
};