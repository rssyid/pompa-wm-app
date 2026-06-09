const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verifikasi koneksi saat modul dimuat
pool.on("connect", () => {
  console.log("✅ Terhubung ke database PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error koneksi database:", err.message);
  process.exit(-1);
});

/**
 * Menjalankan query ke database.
 * @param {string} text - SQL query string
 * @param {Array} params - Parameter query (opsional)
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
