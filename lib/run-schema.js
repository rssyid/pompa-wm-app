const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

async function runSchema() {
  const sqlPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("🚀 Menjalankan schema.sql ke database...\n");

  try {
    await pool.query(sql);
    console.log("✅ Semua tabel berhasil dibuat!\n");

    // Verifikasi: tampilkan daftar tabel yang terbuat
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📋 Daftar tabel di database:");
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    // Verifikasi: tampilkan foreign keys
    const fkResult = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name AS tabel_asal,
        kcu.column_name AS kolom,
        ccu.table_name AS tabel_referensi,
        ccu.column_name AS kolom_referensi
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `);

    console.log("\n🔗 Relasi Foreign Key:");
    fkResult.rows.forEach((fk) => {
      console.log(
        `   ${fk.tabel_asal}.${fk.kolom} → ${fk.tabel_referensi}.${fk.kolom_referensi} (${fk.constraint_name})`
      );
    });
  } catch (err) {
    console.error("❌ Gagal menjalankan schema:", err.message);
  } finally {
    await pool.end();
    console.log("\n🔌 Koneksi database ditutup.");
  }
}

runSchema();
