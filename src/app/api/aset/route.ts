import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: Ambil semua aset pompa dengan JOIN ke tipe pompa dan estate
export async function GET() {
  try {
    const result = await query(`
      SELECT
        a.asset_code,
        a.asset_name,
        a.id_tipe,
        a.est_code,
        a.est_code_deployed,
        a.tahun_perolehan,
        a.kondisi_terkini,
        t.jenis_pompa,
        t.merek,
        t.mesin_penggerak,
        t.debit_m3_jam,
        t.hp_mesin,
        e1.estate_name AS estate_name,
        e2.estate_name AS estate_deployed_name,
        (SELECT block_tujuan FROM trn_mutasi_pompa m WHERE m.asset_code = a.asset_code ORDER BY m.tgl_pindah DESC, m.id_mutasi DESC LIMIT 1) AS block_deployed
      FROM trn_aset_pompa a
      LEFT JOIN mst_tipe_pompa t ON a.id_tipe = t.id_tipe
      LEFT JOIN mst_estate e1 ON a.est_code = e1.estate_code
      LEFT JOIN mst_estate e2 ON a.est_code_deployed = e2.estate_code
      ORDER BY a.asset_code ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Tambah aset pompa baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      asset_code,
      asset_name,
      id_tipe,
      est_code,
      est_code_deployed,
      tahun_perolehan,
      kondisi_terkini,
    } = body;

    if (!asset_code || !asset_name || !est_code) {
      return NextResponse.json(
        { error: "Field asset_code, asset_name, dan est_code wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO trn_aset_pompa
        (asset_code, asset_name, id_tipe, est_code, est_code_deployed, tahun_perolehan, kondisi_terkini)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        asset_code,
        asset_name,
        id_tipe || null,
        est_code,
        est_code_deployed || null,
        tahun_perolehan || null,
        kondisi_terkini || "baik",
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Edit aset pompa
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      asset_code,
      asset_name,
      id_tipe,
      est_code,
      tahun_perolehan,
    } = body;

    if (!asset_code || !asset_name || !est_code) {
      return NextResponse.json(
        { error: "Field asset_code, asset_name, dan est_code wajib diisi." },
        { status: 400 }
      );
    }

    // kondisi_terkini and est_code_deployed are omitted because they are managed by inspections and mutations
    const result = await query(
      `UPDATE trn_aset_pompa
       SET asset_name = $1, id_tipe = $2, est_code = $3, tahun_perolehan = $4
       WHERE asset_code = $5
       RETURNING *`,
      [
        asset_name,
        id_tipe || null,
        est_code,
        tahun_perolehan || null,
        asset_code,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Aset tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
