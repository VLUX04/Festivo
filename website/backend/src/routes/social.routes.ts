import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { loginMiddleware } from '../middleware/auth.middleware.js';
import { SECRET_KEY } from '../services/auth.service.js';
import {
  addPublicationComment,
  createPublication,
  acceptFriendRequest,
  declineFriendRequest,
  followProfessional,
  getSocialFeed,
  listIncomingFriendRequests,
  listFriends,
  sendFriendRequest,
  sharePublication,
  searchFriends,
  togglePublicationFavorite,
  togglePublicationLike,
} from '../services/social.service.js';

const router = Router();

router.get('/feed', async (req: any, res) => {
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

    const result = await getSocialFeed(viewerUsername);

    res.status(200).json({ success: true, feed: result.feed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/publications', loginMiddleware, async (req: any, res) => {
  try {
    const result = await createPublication(req.user.username, req.body);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, publicationId: result.publicationId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/publications/:id/like', loginMiddleware, async (req: any, res) => {
  try {
    const result = await togglePublicationLike(req.user.username, Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, liked: result.liked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/publications/:id/favorite', loginMiddleware, async (req: any, res) => {
  try {
    const result = await togglePublicationFavorite(req.user.username, Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, favorited: result.favorited });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/publications/:id/share', loginMiddleware, async (req: any, res) => {
  try {
    const result = await sharePublication(req.user.username, Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, shared: result.shared });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/publications/:id/comments', loginMiddleware, async (req: any, res) => {
  try {
    const result = await addPublicationComment(req.user.username, Number(req.params.id), req.body.body ?? req.body.comment ?? '');

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, comment: result.comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/follows', loginMiddleware, async (req: any, res) => {
  try {
    const { professionalUsername } = req.body;
    const result = await followProfessional(req.user.username, professionalUsername);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/friend-requests', loginMiddleware, async (req: any, res) => {
  try {
    const result = await listIncomingFriendRequests(req.user.username);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, requests: result.requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/friend-requests', loginMiddleware, async (req: any, res) => {
  try {
    const { receiverUsername } = req.body;
    const result = await sendFriendRequest(req.user.username, receiverUsername);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, message: result.message, requestId: result.requestId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/friend-requests/:id/accept', loginMiddleware, async (req: any, res) => {
  try {
    const result = await acceptFriendRequest(req.user.username, Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/friend-requests/:id/decline', loginMiddleware, async (req: any, res) => {
  try {
    const result = await declineFriendRequest(req.user.username, Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/friends', loginMiddleware, async (req: any, res) => {
  try {
    const result = await listFriends(req.user.username);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, friends: result.friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/friends/search', loginMiddleware, async (req: any, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await searchFriends(req.user.username, query);

    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, results: result.results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /friends route removed — use friend-requests flow instead

export default router;
