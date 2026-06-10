import { Router } from 'express';
import { loginMiddleware } from '../middleware/auth.middleware.js';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notification.service.js';

const router = Router();

router.get('/', loginMiddleware, async (req: any, res) => {
  try {
    const result = await getNotifications(req.user.username);
    if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
    res.status(200).json({ success: true, notifications: result.notifications, unreadCount: result.unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/read-all', loginMiddleware, async (req: any, res) => {
  try {
    await markAllNotificationsRead(req.user.username);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id/read', loginMiddleware, async (req: any, res) => {
  try {
    const result = await markNotificationRead(req.user.username, Number(req.params.id));
    if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
