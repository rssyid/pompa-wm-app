import { Pool } from "pg";

// Next.js secara otomatis memuat .env, jadi tidak perlu dotenv
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
