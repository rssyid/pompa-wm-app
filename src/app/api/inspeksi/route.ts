import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Ambil riwayat inspeksi
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        i.id_inspeksi,
        i.asset_code,
        a.asset_name,
        i.tgl_inspeksi,
        i.estate_code,
        e.estate_name,
        e.company_code,
        i.block,
        i.catatan,
        i.user_id_inspektur,
        u.username AS inspektur_name,
        (
          SELECT COALESCE(json_agg(json_build_object('id_issue', iss.id_issue, 'id_kerusakan', k.id_kerusakan, 'nama_kerusakan', k.nama_kerusakan)), '[]'::json)
          FROM trn_issue_pompa iss
          JOIN mst_jenis_kerusakan k ON iss.id_kerusakan = k.id_kerusakan
          WHERE iss.id_inspeksi_open = i.id_inspeksi
        ) as issues_opened,
        (
          SELECT COALESCE(json_agg(json_build_object('id_issue', iss.id_issue, 'id_kerusakan', k.id_kerusakan, 'nama_kerusakan', k.nama_kerusakan)), '[]'::json)
          FROM trn_issue_pompa iss
          JOIN mst_jenis_kerusakan k ON iss.id_kerusakan = k.id_kerusakan
          WHERE iss.id_inspeksi_close = i.id_inspeksi
        ) as issues_solved
      FROM trn_inspeksi i
      JOIN trn_aset_pompa a ON i.asset_code = a.asset_code
      JOIN mst_estate e ON i.estate_code = e.estate_code
      LEFT JOIN mst_user u ON i.user_id_inspektur = u.id_user
      ORDER BY i.tgl_inspeksi DESC, i.id_inspeksi DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Lakukan inspeksi (INSERT riwayat & UPDATE kondisi aset)
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const {
      asset_code,
      tgl_inspeksi,
      estate_code,
      block,
      new_issues, // array of id_kerusakan (number[])
      solved_issues, // array of id_issue (number[])
      catatan,
      user_id_inspektur
    } = body;

    if (!asset_code || !estate_code) {
      return NextResponse.json(
        { error: "Field asset_code dan estate_code wajib diisi." },
        { status: 400 }
      );
    }

    // Mulai Database Transaction
    await client.query('BEGIN');

    // 1. INSERT ke riwayat inspeksi
    const insertResult = await client.query(
      `INSERT INTO trn_inspeksi 
        (asset_code, tgl_inspeksi, estate_code, block, catatan, user_id_inspektur)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        asset_code, 
        tgl_inspeksi ? new Date(tgl_inspeksi) : new Date(), 
        estate_code,
        block || null, 
        catatan || null,
        user_id_inspektur || null
      ]
    );

    const idInspeksi = insertResult.rows[0].id_inspeksi;

    // 2. Mark solved issues
    if (Array.isArray(solved_issues) && solved_issues.length > 0) {
      for (const id_issue of solved_issues) {
        await client.query(
          `UPDATE trn_issue_pompa 
           SET status = 'solved', id_inspeksi_close = $1 
           WHERE id_issue = $2 AND asset_code = $3`,
          [idInspeksi, id_issue, asset_code]
        );
      }
    }

    // 3. Insert new issues
    if (Array.isArray(new_issues) && new_issues.length > 0) {
      for (const id_kerusakan of new_issues) {
        await client.query(
          `INSERT INTO trn_issue_pompa (asset_code, id_kerusakan, id_inspeksi_open)
           VALUES ($1, $2, $3)`,
          [asset_code, id_kerusakan, idInspeksi]
        );
      }
    }

    // 4. Hitung ulang kondisi terkini aset
    const openIssuesCheck = await client.query(
      `SELECT COUNT(*) FROM trn_issue_pompa WHERE asset_code = $1 AND status = 'open'`,
      [asset_code]
    );
    
    const countOpen = parseInt(openIssuesCheck.rows[0].count, 10);
    const statusAset = countOpen > 0 ? "rusak berat" : "baik";

    await client.query(
      `UPDATE trn_aset_pompa 
       SET kondisi_terkini = $1 
       WHERE asset_code = $2`,
      [statusAset, asset_code]
    );

    // Commit Transaction
    await client.query('COMMIT');

    return NextResponse.json({ 
      message: "Inspeksi berhasil dicatat", 
      data: insertResult.rows[0] 
    }, { status: 201 });

  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}

// PUT: Edit basic data inspeksi
export async function PUT(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const {
      id_inspeksi,
      tgl_inspeksi,
      estate_code,
      block,
      catatan
    } = body;

    if (!id_inspeksi || !estate_code) {
      return NextResponse.json(
        { error: "Field id_inspeksi dan estate_code wajib diisi." },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const updateResult = await client.query(
      `UPDATE trn_inspeksi 
       SET tgl_inspeksi = $1, estate_code = $2, block = $3, catatan = $4
       WHERE id_inspeksi = $5
       RETURNING *`,
      [
        tgl_inspeksi ? new Date(tgl_inspeksi) : new Date(), 
        estate_code,
        block || null, 
        catatan || null,
        id_inspeksi
      ]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
    }

    await client.query('COMMIT');

    return NextResponse.json({ 
      message: "Edit data inspeksi berhasil", 
      data: updateResult.rows[0] 
    }, { status: 200 });

  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
