import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { type, data } = body; // type = 'estate' or 'aset'

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Data kosong atau format salah." }, { status: 400 });
    }

    await client.query("BEGIN");

    let successCount = 0;
    const errors = [];

    if (type === "estate") {
      for (const row of data) {
        try {
          const cleanRow: any = {};
          for (const k in row) {
            const cleanKey = k.replace(/^\uFEFF/, '').trim();
            cleanRow[cleanKey] = typeof row[k] === 'string' ? row[k].trim() : row[k];
          }
          if (!cleanRow.estate_code || !cleanRow.estate_name) {
            errors.push(`Baris dilewati: estate_code atau estate_name kosong.`);
            continue;
          }
          await client.query(
            `INSERT INTO mst_estate (estate_code, estate_name, company_code, region)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (estate_code) DO UPDATE
             SET estate_name = EXCLUDED.estate_name,
                 company_code = EXCLUDED.company_code,
                 region = EXCLUDED.region`,
            [cleanRow.estate_code, cleanRow.estate_name, cleanRow.company_code || null, cleanRow.region || null]
          );
          successCount++;
        } catch (e: any) {
          errors.push(`Gagal estate ${row.estate_code || 'unknown'}: ${e.message}`);
        }
      }
    } else if (type === "aset") {
      for (const row of data) {
        try {
          const cleanRow: any = {};
          for (const k in row) {
            const cleanKey = k.replace(/^\uFEFF/, '').trim();
            cleanRow[cleanKey] = typeof row[k] === 'string' ? row[k].trim() : row[k];
          }
          if (!cleanRow.asset_code || !cleanRow.asset_name || !cleanRow.est_code) {
            errors.push(`Baris dilewati: asset_code, asset_name, atau est_code kosong.`);
            continue;
          }
          await client.query(
            `INSERT INTO trn_aset_pompa 
              (asset_code, asset_name, id_tipe, est_code, est_code_deployed, tahun_perolehan, kondisi_terkini)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (asset_code) DO UPDATE
             SET asset_name = EXCLUDED.asset_name,
                 est_code = EXCLUDED.est_code,
                 est_code_deployed = EXCLUDED.est_code_deployed,
                 tahun_perolehan = EXCLUDED.tahun_perolehan,
                 kondisi_terkini = EXCLUDED.kondisi_terkini`,
            [
              cleanRow.asset_code,
              cleanRow.asset_name,
              null, // id_tipe dibiarkan null sementara
              cleanRow.est_code,
              cleanRow.est_code, // default deployed ke estate asal
              cleanRow.tahun_perolehan && !isNaN(parseInt(cleanRow.tahun_perolehan, 10)) ? parseInt(cleanRow.tahun_perolehan, 10) : null,
              cleanRow.kondisi_terkini || "baik",
            ]
          );
          successCount++;
        } catch (e: any) {
          errors.push(`Gagal aset ${row.asset_code || 'unknown'}: ${e.message}`);
        }
      }
    } else {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Tipe upload tidak valid." }, { status: 400 });
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: `Berhasil mengunggah ${successCount} baris data.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  } finally {
    client.release();
  }
}
