require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query('ALTER TABLE trn_aset_pompa ALTER COLUMN id_tipe DROP NOT NULL');
    console.log('Database altered successfully');
  } catch (error) {
    console.error('Error altering database:', error);
  } finally {
    await pool.end();
  }
}

run();
