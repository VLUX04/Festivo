import pool from '../db.js';
import { getUserByUsername, getUserRoleByUsername } from './user.service.js';

export type WorkOpportunityPayload = {
  title: string;
  position: string;
  mode: 'remote' | 'hybrid' | 'onsite';
  duration: 'week' | 'month' | 'contract' | 'ongoing';
  employment: 'part-time' | 'full-time';
  pay: string;
  description: string;
  location?: string;
};

export async function listWorkOpportunities(viewerUsername?: string) {
  const viewer = viewerUsername ? await getUserByUsername(viewerUsername) : null;
  const viewerId = viewer?.id ?? null;

  const result = await pool.query(
    `SELECT
        wo.id,
        wo.title,
        wo.position,
        wo.mode,
        wo.duration,
        wo.employment,
        wo.pay,
        wo.description,
        wo.location,
        wo.created_at AS "createdAt",
        u.username AS "posterUsername",
        COALESCE(u.name, u.username) AS poster,
        u.role AS "posterRole"
     FROM work_opportunities wo
     JOIN users u ON u.id = wo.poster_id
        WHERE ($1::int IS NULL OR wo.poster_id <> $1)
     ORDER BY wo.created_at DESC, wo.id DESC`,
       [viewerId],
  );

  return result.rows;
}

export async function listMyWorkOpportunities(username: string) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const result = await pool.query(
    `SELECT
        wo.id,
        wo.title,
        wo.position,
        wo.mode,
        wo.duration,
        wo.employment,
        wo.pay,
        wo.description,
        wo.location,
        wo.created_at AS "createdAt",
        u.username AS "posterUsername",
        COALESCE(u.name, u.username) AS poster,
        u.role AS "posterRole"
     FROM work_opportunities wo
     JOIN users u ON u.id = wo.poster_id
     WHERE wo.poster_id = $1
     ORDER BY wo.created_at DESC, wo.id DESC`,
    [currentUser.id],
  );

  return { ok: true as const, opportunities: result.rows };
}

export async function createWorkOpportunity(username: string, payload: WorkOpportunityPayload) {
  const currentUser = await getUserByUsername(username);

  if (!currentUser) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  const role = await getUserRoleByUsername(username);

  if (!role || role.role !== 'professional') {
    return { ok: false as const, status: 403, message: 'Only professionals can post work opportunities' };
  }

  if (!payload.title || !payload.position || !payload.mode || !payload.duration || !payload.employment || !payload.pay || !payload.description) {
    return { ok: false as const, status: 400, message: 'Missing required work opportunity fields' };
  }

  const result = await pool.query(
    `INSERT INTO work_opportunities (poster_id, title, position, mode, duration, employment, pay, description, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      currentUser.id,
      payload.title,
      payload.position,
      payload.mode,
      payload.duration,
      payload.employment,
      payload.pay,
      payload.description,
      payload.location || null,
    ],
  );

  return { ok: true as const, opportunityId: result.rows[0].id };
}

export async function searchProfessionals(query: string) {
  const term = `%${query.trim()}%`;
  const result = await pool.query(
    `SELECT
        u.id,
        u.username,
        COALESCE(u.name, u.username) AS name,
        u.location,
        u.information AS bio,
        pp.genre,
        pp.rating,
        pp.is_verified AS "isVerified",
        (SELECT COUNT(*)::int FROM follows f WHERE f.professional_id = u.id) AS "followersCount"
     FROM users u
     JOIN professional_profile pp ON pp.user_id = u.id
     WHERE (u.username ILIKE $1 OR u.name ILIKE $1 OR u.information ILIKE $1 OR pp.genre ILIKE $1)
     ORDER BY pp.rating DESC NULLS LAST, u.name ASC
     LIMIT 30`,
    [term],
  );
  return { ok: true as const, professionals: result.rows };
}

export async function applyForOpportunity(username: string, opportunityId: number, information: string, contact: string) {
  const currentUser = await getUserByUsername(username);
  if (!currentUser) return { ok: false as const, status: 404, message: 'User not found' };

  const role = await getUserRoleByUsername(username);
  if (!role || role.role !== 'professional') {
    return { ok: false as const, status: 403, message: 'Only professionals can apply for work opportunities' };
  }

  const oppCheck = await pool.query('SELECT id, title FROM work_opportunities WHERE id = $1', [opportunityId]);
  if (oppCheck.rowCount === 0) return { ok: false as const, status: 404, message: 'Opportunity not found' };

  const profCheck = await pool.query('SELECT user_id FROM professional_profile WHERE user_id = $1', [currentUser.id]);
  if (profCheck.rowCount === 0) return { ok: false as const, status: 400, message: 'Professional profile not found' };

  const oppTitle = oppCheck.rows[0].title as string;
  const combined = `[Opportunity #${opportunityId}: ${oppTitle}] ${information || ''}`.trim();

  const result = await pool.query(
    `INSERT INTO application (publisher_id, event_id, information, contact)
     VALUES ($1, NULL, $2, $3)
     RETURNING id`,
    [currentUser.id, combined, contact || null],
  );

  return { ok: true as const, applicationId: result.rows[0].id };
}
