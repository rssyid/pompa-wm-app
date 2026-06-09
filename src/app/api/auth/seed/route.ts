import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    // Cek apakah admin sudah ada
    const check = await query("SELECT id_user FROM mst_user WHERE username = 'admin'");
    
    if (check.rows.length > 0) {
      return NextResponse.json({ message: "Admin sudah ada." }, { status: 200 });
    }

    const hashed = await hashPassword("admin123");

    // Insert admin user dan operator user
    await query(
      `INSERT INTO mst_user (username, password, role) VALUES ($1, $2, 'admin')`,
      ["admin", hashed]
    );

    const hashedOp = await hashPassword("operator123");
    await query(
      `INSERT INTO mst_user (username, password, role) VALUES ($1, $2, 'operator')`,
      ["operator", hashedOp]
    );

    return NextResponse.json({ 
      message: "Akun default berhasil dibuat!",
      accounts: [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "operator", password: "operator123", role: "operator" }
      ]
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
