import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id_kerusakan, nama_kerusakan, kategori FROM mst_jenis_kerusakan ORDER BY kategori ASC, nama_kerusakan ASC"
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
    const { nama_kerusakan, kategori } = body;

    if (!nama_kerusakan) {
      return NextResponse.json(
        { error: "Field nama_kerusakan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO mst_jenis_kerusakan (nama_kerusakan, kategori)
       VALUES ($1, $2) RETURNING *`,
      [nama_kerusakan, kategori || null]
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
    const { id_kerusakan, nama_kerusakan, kategori } = body;

    if (!id_kerusakan || !nama_kerusakan) {
      return NextResponse.json(
        { error: "Field id_kerusakan dan nama_kerusakan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE mst_jenis_kerusakan 
       SET nama_kerusakan = $1, kategori = $2
       WHERE id_kerusakan = $3 RETURNING *`,
      [nama_kerusakan, kategori || null, id_kerusakan]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Jenis Kerusakan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
