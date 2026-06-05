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

export async function listWorkOpportunities() {
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
     ORDER BY wo.created_at DESC, wo.id DESC`,
  );

  return result.rows;
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
