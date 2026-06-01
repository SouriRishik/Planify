import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please provide a Postgres connection string.');
}

const pool = new Pool({ connectionString });

async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
      status TEXT CHECK (status IN ('todo','in_progress','done')) DEFAULT 'todo',
      due_date TIMESTAMP WITH TIME ZONE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS signup_otps (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
  } finally {
    client.release();
  }
}

// Retry helper: wait ms
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function ensureSchemaWithRetry(maxAttempts = 20) {
  let attempt = 0;
  let delay = 500;
  while (attempt < maxAttempts) {
    try {
      await ensureSchema();
      console.log('DB schema ensured');
      return;
    } catch (err) {
      attempt += 1;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`DB not ready (attempt ${attempt}/${maxAttempts}): ${msg}`);
      await wait(delay);
      delay = Math.min(5000, delay * 2);
    }
  }
  console.error('Failed to ensure DB schema after retries.');
}

// Ensure schema on startup (with retries)
ensureSchemaWithRetry().catch((err) => console.error('Failed to ensure DB schema:', err));

export default pool;
