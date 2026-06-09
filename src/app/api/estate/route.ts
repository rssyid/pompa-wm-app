import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT estate_code, estate_name, company_code, region FROM mst_estate ORDER BY estate_name ASC"
    );
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
    const { estate_code, estate_name, company_code, region } = body;

    if (!estate_code || !estate_name) {
      return NextResponse.json(
        { error: "Field estate_code dan estate_name wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO mst_estate (estate_code, estate_name, company_code, region)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [estate_code, estate_name, company_code || null, region || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // Tangkap error duplicate PK (P23505 di postgres)
    if (message.includes("duplicate key value")) {
      return NextResponse.json({ error: `Estate Code '${body.estate_code}' sudah terdaftar.` }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { estate_code, estate_name, company_code, region } = body;

    if (!estate_code || !estate_name) {
      return NextResponse.json(
        { error: "Field estate_code dan estate_name wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE mst_estate 
       SET estate_name = $1, company_code = $2, region = $3
       WHERE estate_code = $4 RETURNING *`,
      [estate_name, company_code || null, region || null, estate_code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Estate tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
