import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Ambil riwayat mutasi
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        m.id_mutasi,
        m.asset_code,
        a.asset_name,
        m.estate_tujuan,
        e.estate_name,
        e.company_code,
        m.block_tujuan,
        m.tgl_pindah,
        m.user_id_pic,
        u.username AS pic_name
      FROM trn_mutasi_pompa m
      JOIN trn_aset_pompa a ON m.asset_code = a.asset_code
      JOIN mst_estate e ON m.estate_tujuan = e.estate_code
      LEFT JOIN mst_user u ON m.user_id_pic = u.id_user
      ORDER BY m.tgl_pindah DESC, m.id_mutasi DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Lakukan mutasi (INSERT riwayat & UPDATE lokasi terkini)
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const {
      asset_code,
      estate_tujuan,
      block_tujuan,
      tgl_pindah,
      user_id_pic
    } = body;

    if (!asset_code || !estate_tujuan) {
      return NextResponse.json(
        { error: "Field asset_code dan estate_tujuan wajib diisi." },
        { status: 400 }
      );
    }

    // Mulai Database Transaction
    await client.query('BEGIN');

    // 1. INSERT ke riwayat mutasi
    const insertResult = await client.query(
      `INSERT INTO trn_mutasi_pompa 
        (asset_code, estate_tujuan, block_tujuan, tgl_pindah, user_id_pic)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        asset_code, 
        estate_tujuan, 
        block_tujuan || null, 
        tgl_pindah ? new Date(tgl_pindah) : new Date(), 
        user_id_pic || null
      ]
    );

    // 2. UPDATE lokasi terkini (est_code_deployed) di tabel aset
    await client.query(
      `UPDATE trn_aset_pompa 
       SET est_code_deployed = $1 
       WHERE asset_code = $2`,
      [estate_tujuan, asset_code]
    );

    // Commit Transaction jika kedua operasi berhasil
    await client.query('COMMIT');

    return NextResponse.json({ 
      message: "Mutasi berhasil", 
      data: insertResult.rows[0] 
    }, { status: 201 });

  } catch (error: unknown) {
    // Rollback jika terjadi error pada salah satu operasi
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Lepaskan client kembali ke pool
    client.release();
  }
}

// PUT: Edit mutasi (UPDATE riwayat & UPDATE lokasi terkini)
export async function PUT(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const {
      id_mutasi,
      asset_code, // digunakan untuk update tabel aset
      estate_tujuan,
      block_tujuan,
      tgl_pindah,
    } = body;

    if (!id_mutasi || !asset_code || !estate_tujuan) {
      return NextResponse.json(
        { error: "Field id_mutasi, asset_code, dan estate_tujuan wajib diisi." },
        { status: 400 }
      );
    }

    // Mulai Database Transaction
    await client.query('BEGIN');

    // 1. UPDATE riwayat mutasi
    const updateResult = await client.query(
      `UPDATE trn_mutasi_pompa 
       SET estate_tujuan = $1, block_tujuan = $2, tgl_pindah = $3
       WHERE id_mutasi = $4
       RETURNING *`,
      [
        estate_tujuan, 
        block_tujuan || null, 
        tgl_pindah ? new Date(tgl_pindah) : new Date(), 
        id_mutasi
      ]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Mutasi tidak ditemukan." }, { status: 404 });
    }

    // 2. UPDATE lokasi terkini (est_code_deployed) di tabel aset
    await client.query(
      `UPDATE trn_aset_pompa 
       SET est_code_deployed = $1 
       WHERE asset_code = $2`,
      [estate_tujuan, asset_code]
    );

    // Commit Transaction
    await client.query('COMMIT');

    return NextResponse.json({ 
      message: "Edit mutasi berhasil", 
      data: updateResult.rows[0] 
    }, { status: 200 });

  } catch (error: unknown) {
    // Rollback jika terjadi error pada salah satu operasi
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Lepaskan client kembali ke pool
    client.release();
  }
}
