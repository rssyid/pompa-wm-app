require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query('SELECT estate_code, estate_name FROM mst_estate');
    console.log('ESTATES:', res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
