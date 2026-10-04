import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { LangToggle, ThemeToggle } from "@/components/site/Toggles";
import { currentAdmin } from "@/lib/actions/guard";
import { logout } from "@/lib/actions/session";
import { dict, getLang } from "@/lib/i18n";

/**
 * Chrome panel admin: guard sesi + header + navigasi.
 *
 * Guard ada di sini (bukan di `proxy.ts`) agar cookie yang expired langsung
 * dialihkan ke login tanpa menunggu middleware; `proxy.ts` tetap menjadi
 * lapisan pertama untuk semua rute `/admin/*`.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) redirect("/admin/login");

  const lang = await getLang();
  const t = dict(lang);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/admin"
              className="truncate text-sm font-bold uppercase tracking-[0.18em] text-accent"
            >
              {t.admin.signInTitle}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LangToggle lang={lang} labels={t.admin.tabs} ariaLabel={t.nav.language} />
            <ThemeToggle
              labels={{ light: t.nav.light, dark: t.nav.dark, system: t.nav.system }}
              ariaLabel={t.nav.theme}
            />
            <Link href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              {t.nav.home}
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost btn-sm">
                {t.admin.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-surface md:hidden">
        <div className="mx-auto max-w-7xl overflow-x-auto px-3 py-2">
          <AdminNav lang={lang} variant="bar" />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-20">
            <AdminNav lang={lang} variant="sidebar" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
