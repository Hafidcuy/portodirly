import type { LoadFailure } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n";

type AdminNoticeProps = {
  reason: LoadFailure | "error";
  /** Nama variabel yang belum terisi (hanya untuk `not-configured`). */
  missing?: string[];
  /** Pesan error mentah dari Supabase (opsional, untuk penelusuran). */
  detail?: string;
  /** Tujuan tombol muat ulang (server component — tidak bisa `location.reload`). */
  retryHref?: string;
  t: Dictionary;
};

/**
 * Versi ringkas `SetupNotice` untuk dalam panel admin: tanpa padding section
 * besar, karena panel sudah punya chrome-nya sendiri.
 *
 * Sengaja tetap server component: `Dictionary` memuat fungsi (t.admin.blocked)
 * sehingga tidak boleh dikirim ke client component.
 */
export function AdminNotice({
  reason,
  missing = [],
  detail,
  retryHref = "/admin",
  t,
}: AdminNoticeProps) {
  const notConfigured = reason === "not-configured";

  return (
    <div className="card p-6 sm:p-8">
      <p className="section-kicker">
        {notConfigured ? t.setup.title : t.setup.configuredTitle}
      </p>
      <h1 className="mt-2 text-xl font-bold sm:text-2xl">
        {notConfigured ? t.setup.title : t.setup.configuredTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {notConfigured ? t.setup.body : t.setup.configuredBody}
      </p>

      {notConfigured && missing.length > 0 ? (
        <div className="mt-5 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {t.setup.missingTitle}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {missing.map((name) => (
              <li
                key={name}
                className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail ? (
        <p className="mt-4 rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-xs text-muted">
          {detail}
        </p>
      ) : null}

      <ol className="mt-6 space-y-3">
        {t.setup.steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-foreground">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-contrast">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <a href={retryHref} className="btn btn-ghost mt-6">
        {t.setup.retry}
      </a>
    </div>
  );
}
