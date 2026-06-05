import { Router } from 'express';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { createWorkOpportunity, listWorkOpportunities } from '../services/work.service.js';

const router = Router();

router.get('/opportunities', async (_req, res) => {
  try {
    const opportunities = await listWorkOpportunities();
    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/opportunities', loginMiddleware, async (req: any, res) => {
  try {
    const result = await createWorkOpportunity(req.user.username, req.body);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, opportunityId: result.opportunityId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
