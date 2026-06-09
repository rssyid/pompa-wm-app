import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-fallback";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ambil token dari cookie
  const token = request.cookies.get("auth_token")?.value;
  let user: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      });
      user = payload;
    } catch (error) {
      // Token invalid / expired
    }
  }

  // Identifikasi kategori route
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/api/auth");

  // Proteksi rute dari user belum login
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isApiRoute && !isAuthRoute && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ============================================
  // ROLE-BASED ACCESS CONTROL (RBAC)
  // ============================================

  // 1. Blokir akses halaman Master Data bagi non-admin
  if (pathname.startsWith("/dashboard/master") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Blokir akses memodifikasi data Master bagi non-admin (POST, PUT, DELETE)
  const method = request.method;
  const isMasterDataApi = 
    pathname.startsWith("/api/estate") || 
    pathname.startsWith("/api/tipe-pompa") || 
    pathname.startsWith("/api/jenis-kerusakan") || 
    pathname.startsWith("/api/user");

  if (isMasterDataApi && method !== "GET" && user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Akses hanya untuk Admin" }, 
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk menerapkan middleware ini
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
