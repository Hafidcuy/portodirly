import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-token";

const LOGIN_PATH = "/admin/login";

/**
 * Penjaga route `/admin/*` (Next 16: `proxy.ts` menggantikan `middleware.ts`).
 *
 * Ini pemeriksaan optimistik: token diverifikasi HMAC + masa berlaku di sini
 * agar halaman admin yang palsu/kedaluwarsa tidak pernah ter-render.
 * Pemeriksaan sesungguhnya tetap dijalankan `requireAdmin()` pada setiap
 * Server Action dan `currentAdmin()` di layout admin.
 *
 * Proxy berjalan di Node runtime, sehingga `node:crypto` aman dipakai.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Halaman login selalu terbuka.
  if (pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("reason", "expired");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Batasi ke area admin saja agar halaman publik tidak memakai proxy.
  matcher: ["/admin/:path*"],
};
