require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Clearing tables...');
    // TRUNCATE CASCADE will automatically delete rows from all tables that have foreign-key references to any of the named tables
    await pool.query(`
      TRUNCATE TABLE 
        trn_aset_pompa,
        mst_estate
      CASCADE;
    `);
    console.log('Tables cleared successfully.');
  } catch (error) {
    console.error('Error clearing tables:', error);
  } finally {
    await pool.end();
  }
}

run();
