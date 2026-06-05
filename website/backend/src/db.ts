import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME
});

export default pool;

const serialTablesToSync = [
  'users',
  'events',
  'images',
  'chat',
  'message',
  'publication',
  'comments',
  'stories',
  'notifications',
  'work_opportunities',
];

export async function syncSerialSequences() {
  for (const tableName of serialTablesToSync) {
    await pool.query(
      `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE(MAX(id), 0) + 1, false) FROM ${tableName}`,
      [tableName],
    );
  }
}
