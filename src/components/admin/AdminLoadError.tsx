import { AdminNotice } from "@/components/admin/AdminNotice";
import { missingSupabaseEnv, NotConfiguredError } from "@/lib/env";
import type { Dictionary } from "@/lib/i18n";

type AdminLoadErrorProps = {
  t: Dictionary;
  /** Error yang dilempar fetcher admin (`adminSkills()`, dll.). */
  error: unknown;
  /** Halaman tempat tombol "Coba lagi" diarahkan. */
  retryHref: string;
};

/**
 * Notifikasi bila data admin gagal dimuat.
 *
 * Membedakan dua kasus: `.env.local` yang belum diisi (tampil daftar variabel
 * yang kurang) versus error Supabase / baris seed yang belum ada (tampil pesan
 * error mentahnya). Selalu dirender sebagai server component.
 */
export function AdminLoadError({ t, error, retryHref }: AdminLoadErrorProps) {
  const missing =
    error instanceof NotConfiguredError ? error.missing : missingSupabaseEnv();

  return (
    <AdminNotice
      reason={missing.length > 0 ? "not-configured" : "failed"}
      missing={missing}
      detail={error instanceof Error ? error.message : undefined}
      retryHref={retryHref}
      t={t}
    />
  );
}
