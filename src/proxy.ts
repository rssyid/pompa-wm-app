import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-fallback";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  // Hanya proses jika mengakses rute /dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      // Jika tidak ada token, arahkan ke login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verifikasi token
      await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      });
      // Jika valid, lanjutkan request
      return NextResponse.next();
    } catch (error) {
      // Jika token tidak valid / expired, arahkan ke login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Jika mengakses rute root (/) arahkan ke dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/aset", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi agar middleware hanya berjalan di rute tertentu
export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
