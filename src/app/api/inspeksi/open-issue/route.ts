import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset_code = searchParams.get('asset_code');

    if (!asset_code) {
      return NextResponse.json(
        { error: "Parameter asset_code wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(`
      SELECT 
        i.id_issue,
        i.id_kerusakan,
        k.nama_kerusakan,
        i.status,
        i.created_at
      FROM trn_issue_pompa i
      JOIN mst_jenis_kerusakan k ON i.id_kerusakan = k.id_kerusakan
      WHERE i.asset_code = $1 AND i.status = 'open'
      ORDER BY i.created_at ASC
    `, [asset_code]);

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
