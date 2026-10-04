/**
 * API autentikasi untuk kode server (Server Actions, layout admin, dll).
 *
 * Logika token hidup di `@/lib/auth-token` tanpa `server-only` agar bisa
 * dipakai juga oleh `src/proxy.ts`; file ini hanya membungkusnya dengan
 * penanda "jangan impor dari client component".
 */

import "server-only";

export * from "@/lib/auth-token";
