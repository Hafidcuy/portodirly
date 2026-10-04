import Link from "next/link";

import { dict, getLang } from "@/lib/i18n";

/** 404 — dirender di dalam root layout (Server Component, bisa baca cookie). */
export default async function NotFound() {
  const lang = await getLang();
  const t = dict(lang);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="card w-full max-w-lg text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {t.errors.notFoundTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.errors.notFoundBody}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn btn-primary">
            {t.errors.backHome}
          </Link>
          <Link href="/#projects" className="btn btn-ghost">
            {t.projects.viewAll}
          </Link>
        </div>
      </div>
    </main>
  );
}
