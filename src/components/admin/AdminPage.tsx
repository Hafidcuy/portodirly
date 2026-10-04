import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  /** Teks kecil di atas judul (mis. "Content"). */
  kicker: string;
  title: string;
  subtitle?: string;
  /** Aksi di kanan atas — biasanya `AdminCreateLink`. */
  action?: ReactNode;
};

/**
 * Judul halaman CRUD admin. Sengaja server component: hanya menerima teks
 * dari kamus sehingga tidak perlu (dan tidak boleh) masuk bundle client.
 */
export function AdminPageHeader({ kicker, title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

/** Tombol "Buat baru" bergaya `.btn btn-primary btn-sm`. */
export function AdminCreateLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn btn-primary btn-sm">
      {label}
    </Link>
  );
}

type FormPanelProps = {
  title: string;
  /** Sembunyikan panel (mis. setelah menekan "Batal"). */
  closeHref?: string;
  closeLabel?: string;
  children: ReactNode;
};

/**
 * Kartu pembungkus form di atas daftar item.
 *
 * Panel dirender oleh server page, tetapi `children` biasanya berisi form
 * client — jadi panel ini tetap server component agar teks kamus tidak
 * ikut terkirim ke browser.
 */
export function FormPanel({ title, closeHref, closeLabel, children }: FormPanelProps) {
  return (
    <section aria-label={title} className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {closeHref && closeLabel ? (
          <Link
            href={closeHref}
            className="text-sm font-medium text-muted transition hover:text-foreground"
          >
            {closeLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Judul kecil untuk memisahkan blok field dalam satu form panjang. */
export function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 border-t border-border pt-5 text-sm font-semibold text-foreground first:mt-0 first:border-0 first:pt-0">
      {children}
    </h3>
  );
}
