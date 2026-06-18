import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Resilient Schema Initialization
export async function initializeDatabaseSchema(): Promise<void> {
  let client;
  try {
    client = await pool.connect();
    console.log('🟢 [DB] PostgreSQL connected successfully.');
    
    // Creating generic demonstration tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS showcase_tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('📊 [DB] Database tables initialized/verified.');
  } catch (err: any) {
    console.error('🔴 [DB] Failed to connect or initialize database. Operating in memory-fallback mode.', err.message);
  } finally {
    if (client) client.release();
  }
}

// Resilient Query helper that catches error and allows fallback logic
export async function dbQuery<T = any>(text: string, params?: any[]): Promise<T[]> {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err: any) {
    console.error(`🔴 [DB] Query Execution Error: ${err.message}`);
    throw new Error(`DB_QUERY_FAILURE: ${err.message}`);
  }
}
