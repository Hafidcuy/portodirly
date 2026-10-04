import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { LangToggle, ThemeToggle } from "@/components/site/Toggles";
import { currentAdmin } from "@/lib/actions/guard";
import { dict, getLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Sign in · Admin",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await currentAdmin()) redirect("/admin");

  const params = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const next = typeof params.next === "string" ? params.next : "";
  const expired = params.reason === "expired";

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Toggles di kanan atas, konsisten dengan halaman detail proyek */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <LangToggle lang={lang} labels={t.admin.tabs} ariaLabel={t.nav.language} />
        <ThemeToggle
          labels={{ light: t.nav.light, dark: t.nav.dark, system: t.nav.system }}
          ariaLabel={t.nav.theme}
        />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
            >
              {t.nav.home}
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              {t.admin.signInTitle}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {expired ? t.admin.sessionExpired : t.admin.signInSubtitle}
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <LoginForm lang={lang} next={next} />
          </div>
        </div>
      </main>
    </div>
  );
}
