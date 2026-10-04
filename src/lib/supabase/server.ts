import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseEnv, supabaseConfigured } from "@/lib/env";

export type Database = Record<string, never>;

let cached: SupabaseClient | null = null;

/**
 * Klien Supabase khusus server dengan **service role key**.
 *
 * Klien ini tidak pernah dikirim ke browser, dan RLS pada semua tabel
 * sengaja dibiarkan tanpa policy publik — satu-satunya jalur data adalah
 * Server Component / Server Action ini.
 */
export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const { url, key } = requireSupabaseEnv();

  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { "x-application-name": "portodirly" },
    },
  });

  return cached;
}

export { supabaseConfigured };

/** Nama bucket publik tempat seluruh gambar diunggah. */
export function bucketName(): string {
  return requireSupabaseEnv().bucket;
}

/**
 * Bangun URL publik sebuah objek Storage dari path-nya.
 * Menyimpan path saja (bukan URL penuh) membuat bucket mudah dipindah.
 */
export function publicObjectUrl(path: string): string {
  const { url, bucket } = requireSupabaseEnv();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Ekstrak path objek dari URL publik Supabase Storage.
 * Mengembalikan `null` bila URL bukan milik bucket kita (mis. gambar eksternal),
 * supaya tidak ada aset orang lain yang ikut terhapus.
 */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { pathname } = new URL(url);
    const marker = "/storage/v1/object/public/";
    const index = pathname.indexOf(marker);
    if (index === -1) return null;
    const rest = pathname.slice(index + marker.length);
    const slash = rest.indexOf("/");
    if (slash === -1) return null;
    const [bucket, ...segments] = rest.slice(slash + 1).split("/");
    if (bucket !== requireSupabaseEnv().bucket) return null;
    return segments.join("/") || null;
  } catch {
    return null;
  }
}
