import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id_tipe, jenis_pompa, merek, mesin_penggerak, nama_vendor, debit_m3_jam, hp_mesin FROM mst_tipe_pompa ORDER BY jenis_pompa ASC"
    );
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jenis_pompa, merek, mesin_penggerak, nama_vendor, debit_m3_jam, hp_mesin } = body;

    if (!jenis_pompa) {
      return NextResponse.json(
        { error: "Field jenis_pompa wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO mst_tipe_pompa (jenis_pompa, merek, mesin_penggerak, nama_vendor, debit_m3_jam, hp_mesin)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        jenis_pompa, 
        merek || null, 
        mesin_penggerak || null, 
        nama_vendor || null, 
        debit_m3_jam ? Number(debit_m3_jam) : null, 
        hp_mesin ? Number(hp_mesin) : null
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_tipe, jenis_pompa, merek, mesin_penggerak, nama_vendor, debit_m3_jam, hp_mesin } = body;

    if (!id_tipe || !jenis_pompa) {
      return NextResponse.json(
        { error: "Field id_tipe dan jenis_pompa wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE mst_tipe_pompa 
       SET jenis_pompa = $1, merek = $2, mesin_penggerak = $3, nama_vendor = $4, debit_m3_jam = $5, hp_mesin = $6
       WHERE id_tipe = $7 RETURNING *`,
      [
        jenis_pompa, 
        merek || null, 
        mesin_penggerak || null, 
        nama_vendor || null, 
        debit_m3_jam ? Number(debit_m3_jam) : null, 
        hp_mesin ? Number(hp_mesin) : null,
        id_tipe
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Tipe Pompa tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
