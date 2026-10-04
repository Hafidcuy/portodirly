/**
 * Pembaca environment variable terpusat.
 *
 * Semua nilai dibaca pada runtime server (bukan build time), sehingga
 * mengubah `.env.local` cukup dengan restart `next dev`.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const env = {
  get supabaseUrl() {
    return read("SUPABASE_URL");
  },
  get supabaseServiceRoleKey() {
    return read("SUPABASE_SERVICE_ROLE_KEY");
  },
  get supabaseBucket() {
    return read("SUPABASE_BUCKET") ?? "portfolio-assets";
  },
  get adminPassword() {
    return read("ADMIN_PASSWORD");
  },
  get sessionSecret() {
    return read("SESSION_SECRET") ?? read("ADMIN_PASSWORD");
  },
} as const;

export const supabaseConfigured = () =>
  Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

export const authConfigured = () =>
  Boolean(env.adminPassword && env.sessionSecret);

/**
 * Error yang dilempar ketika `.env.local` belum diisi.
 * Ditangkap di lapisan halaman untuk menampilkan panduan setup,
 * bukan stack trace merah.
 */
export class NotConfiguredError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(
      `Variabel environment belum diatur: ${missing.join(", ")}. ` +
        "Salin .env.local.example menjadi .env.local lalu isi nilainya.",
    );
    this.name = "NotConfiguredError";
    this.missing = missing;
  }
}

/** Daftar variabel Supabase yang belum terisi (tanpa melempar error). */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("SUPABASE_URL");
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

export function requireSupabaseEnv(): {
  url: string;
  key: string;
  bucket: string;
} {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("SUPABASE_URL");
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) throw new NotConfiguredError(missing);

  return {
    url: env.supabaseUrl as string,
    key: env.supabaseServiceRoleKey as string,
    bucket: env.supabaseBucket,
  };
}

export function requireAuthEnv(): { password: string; secret: string } {
  const missing: string[] = [];
  if (!env.adminPassword) missing.push("ADMIN_PASSWORD");
  if (!env.sessionSecret) missing.push("SESSION_SECRET");
  if (missing.length > 0) throw new NotConfiguredError(missing);

  return {
    password: env.adminPassword as string,
    secret: env.sessionSecret as string,
  };
}
