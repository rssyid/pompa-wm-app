import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Delete all existing dummy inspections
    console.log('Deleting dummy inspection data...');
    await client.query('DELETE FROM trn_inspeksi');
    
    // 2. Drop the id_kerusakan column from trn_inspeksi
    console.log('Dropping id_kerusakan from trn_inspeksi...');
    await client.query('ALTER TABLE trn_inspeksi DROP COLUMN IF EXISTS id_kerusakan');
    
    // 3. Create the trn_issue_pompa table
    console.log('Creating trn_issue_pompa table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS trn_issue_pompa (
        id_issue SERIAL PRIMARY KEY,
        asset_code VARCHAR(50) REFERENCES trn_aset_pompa(asset_code) ON DELETE CASCADE,
        id_kerusakan INT REFERENCES mst_jenis_kerusakan(id_kerusakan),
        status VARCHAR(20) DEFAULT 'open',
        id_inspeksi_open INT REFERENCES trn_inspeksi(id_inspeksi) ON DELETE CASCADE,
        id_inspeksi_close INT REFERENCES trn_inspeksi(id_inspeksi) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 4. Reset aset condition to "baik" to ensure clean state
    console.log('Resetting all aset conditions to "baik"...');
    await client.query(`UPDATE trn_aset_pompa SET kondisi_terkini = 'baik'`);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
