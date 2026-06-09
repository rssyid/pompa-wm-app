import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    // Jangan return password (meskipun di-hash) ke client untuk keamanan
    const result = await query(
      "SELECT id_user, username, role FROM mst_user ORDER BY username ASC"
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
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Field username, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    // Enkripsi password menggunakan helper dari auth.ts
    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO mst_user (username, password, role)
       VALUES ($1, $2, $3) RETURNING id_user, username, role`,
      [username, hashedPassword, role]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // Tangkap error duplicate username
    if (message.includes("duplicate key value") || message.includes("unique constraint")) {
      return NextResponse.json({ error: `Username '${body.username}' sudah digunakan.` }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_user, username, role, password } = body; // password is optional on edit

    if (!id_user || !username || !role) {
      return NextResponse.json(
        { error: "Field id_user, username, dan role wajib diisi." },
        { status: 400 }
      );
    }

    let result;
    if (password && password.trim() !== "") {
      const hashedPassword = await hashPassword(password);
      result = await query(
        `UPDATE mst_user 
         SET role = $1, password = $2
         WHERE id_user = $3 RETURNING id_user, username, role`,
        [role, hashedPassword, id_user]
      );
    } else {
      result = await query(
        `UPDATE mst_user 
         SET role = $1
         WHERE id_user = $2 RETURNING id_user, username, role`,
        [role, id_user]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
