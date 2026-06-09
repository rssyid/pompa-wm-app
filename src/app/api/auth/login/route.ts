import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encrypt, comparePassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil data user
    const result = await query("SELECT * FROM mst_user WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Cek password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Buat JWT Token
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Hari
    const sessionToken = await encrypt({
      id: user.id_user,
      username: user.username,
      role: user.role,
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      { message: "Login berhasil", role: user.role },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
