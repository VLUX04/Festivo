import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { SECRET_KEY } from '../services/auth.service.js';
import { applyForOpportunity, createWorkOpportunity, listMyWorkOpportunities, listWorkOpportunities, searchProfessionals } from '../services/work.service.js';

const router = Router();

router.get('/opportunities', async (req: any, res) => {
  try {
    const authorization = req.headers['authorization'];
    const token = authorization && authorization.split(' ')[1];
    const viewerUsername = token
      ? (() => {
          try {
            const payload = jwt.verify(token, SECRET_KEY) as { username?: string };
            return typeof payload.username === 'string' ? payload.username : undefined;
          } catch {
            return undefined;
          }
        })()
      : undefined;

    const opportunities = await listWorkOpportunities(viewerUsername);
    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/opportunities/mine', loginMiddleware, async (req: any, res) => {
  try {
    const result = await listMyWorkOpportunities(req.user.username);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, opportunities: result.opportunities });
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

router.post('/opportunities/:id/apply', loginMiddleware, async (req: any, res) => {
  try {
    const { information, contact } = req.body;
    const result = await applyForOpportunity(req.user.username, Number(req.params.id), information ?? '', contact ?? '');
    if (!result.ok) return res.status(result.status).json({ success: false, message: result.message });
    res.status(201).json({ success: true, applicationId: result.applicationId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/professionals', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await searchProfessionals(q);
    res.status(200).json({ success: true, professionals: result.professionals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
