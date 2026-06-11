require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`
      UPDATE trn_aset_pompa 
      SET kondisi_terkini = 'baik' 
      WHERE kondisi_terkini IS NULL OR kondisi_terkini = ''
    `);
    console.log(`Updated ${res.rowCount} rows to kondisi_terkini = 'baik'`);

    // Cek hasilnya
    const check = await pool.query(`SELECT kondisi_terkini, count(*) FROM trn_aset_pompa GROUP BY kondisi_terkini`);
    console.log('Kondisi breakdown:', check.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
