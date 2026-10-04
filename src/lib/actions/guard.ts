import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Ambil sesi admin dari cookie.
 * `null` berarti belum login atau token kedaluwarsa/dimanipulasi.
 */
export async function currentAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Penjaga untuk Server Action admin: hentikan eksekusi bila bukan admin.
 *
 * Melempar `NEXT_REDIRECT` (bukan error biasa) sehingga `useActionState`
 * akan meneruskan user ke halaman login.
 */
export async function requireAdmin(): Promise<void> {
  if (await currentAdmin()) return;
  redirect("/admin/login?reason=expired");
}
