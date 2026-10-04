/**
 * Verifikasi token sesi & penghitung percobaan login.
 *
 * Modul ini sengaja TIDAK memakai `server-only` sehingga bisa diimpor
 * dari `src/proxy.ts` (penjaga route) maupun dari kode server biasa.
 * Semuanya murni perhitungan — tidak ada akses database atau cookie.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import { requireAuthEnv } from "@/lib/env";

/** Cookie yang menyimpan sesi admin. */
export const SESSION_COOKIE = "admin_session";
/** Cookie penghitung percobaan login gagal. */
export const ATTEMPTS_COOKIE = "admin_attempts";

/** Sesi berlaku 7 hari. */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Jendela pemblokiran: 5 kali gagal berturut-turut. */
export const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Perbandingan yang tahan timing attack.
 * Panjang berbeda langsung dianggap tidak cocok (dengan return di luar
 * `timingSafeEqual` yang melempar error bila panjangnya beda).
 */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    // Tetap lakukan perbandingan agar waktu tidak bocor dari panjang.
    timingSafeEqual(bufferA, bufferA);
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}

/** Cocokkan password input dengan `ADMIN_PASSWORD` secara aman. */
export function verifyPassword(input: string): boolean {
  const { password } = requireAuthEnv();
  return safeEqual(input, password);
}

/** Buat token sesi: `<unix-expiry>.<signature>`. */
export function createSessionToken(now = Date.now()): string {
  const { secret } = requireAuthEnv();
  const expiresAt = Math.floor(now / 1000) + Math.floor(SESSION_TTL_MS / 1000);
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Validasi token sesi.
 * Mengembalikan `false` untuk token kosong, kadaluarsa, atau tanda tangannya
 * tidak cocok — termasuk bila `SESSION_SECRET` belum diisi.
 */
export function verifySessionToken(
  token: string | undefined | null,
  now = Date.now(),
): boolean {
  if (!token) return false;

  let secret: string;
  try {
    secret = requireAuthEnv().secret;
  } catch {
    return false;
  }

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!payload || !signature) return false;

  const expected = sign(payload, secret);
  if (!safeEqual(signature, expected)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt * 1000 > now;
}

// ---------------------------------------------------------------------------
// Penghitung percobaan login gagal
// ---------------------------------------------------------------------------

export type Attempts = { count: number; windowStart: number };

export function parseAttempts(raw: string | undefined | null): Attempts {
  if (!raw) return { count: 0, windowStart: 0 };
  const [countRaw, windowRaw] = raw.split(".");
  const count = Number(countRaw);
  const windowStart = Number(windowRaw);
  if (!Number.isFinite(count) || !Number.isFinite(windowStart)) {
    return { count: 0, windowStart: 0 };
  }
  return { count, windowStart };
}

export function serializeAttempts(attempts: Attempts): string {
  return `${attempts.count}.${attempts.windowStart}`;
}

/**
 * Catat satu kali kegagalan. Jendela kedaluwarsa otomatis di-reset,
 * sehingga 5 kegagalan yang menyebar seharian tidak ikut mengunci.
 */
export function recordFailedAttempt(
  raw: string | undefined | null,
  now = Date.now(),
): { attempts: Attempts; blocked: boolean } {
  const current = parseAttempts(raw);
  const withinWindow =
    current.windowStart > 0 && now - current.windowStart < ATTEMPT_WINDOW_MS;

  const count = withinWindow ? current.count + 1 : 1;
  const windowStart = withinWindow ? current.windowStart : now;
  const attempts = { count, windowStart };

  return { attempts, blocked: count >= MAX_ATTEMPTS };
}

/** True bila admin sedang terkunci karena terlalu banyak kegagalan. */
export function isBlocked(
  raw: string | undefined | null,
  now = Date.now(),
): boolean {
  const { count, windowStart } = parseAttempts(raw);
  if (count < MAX_ATTEMPTS) return false;
  return now - windowStart < ATTEMPT_WINDOW_MS;
}

/** Hitung sisa detik penguncian (untuk pesan error yang informatif). */
export function blockedForSeconds(
  raw: string | undefined | null,
  now = Date.now(),
): number {
  const { count, windowStart } = parseAttempts(raw);
  if (count < MAX_ATTEMPTS) return 0;
  const remaining = windowStart + ATTEMPT_WINDOW_MS - now;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
