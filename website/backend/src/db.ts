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

export async function ensureTextMediaColumns() {
  await pool.query(`ALTER TABLE publication ALTER COLUMN media TYPE TEXT USING media::TEXT`);
  await pool.query(`ALTER TABLE stories ALTER COLUMN media TYPE TEXT USING media::TEXT`);
}

export async function ensureFriendRequestsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
      UNIQUE (sender_id, receiver_id)
    )
  `);
}
