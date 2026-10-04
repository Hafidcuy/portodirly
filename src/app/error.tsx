"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  dictionaries,
  isLang,
  LANG_COOKIE,
  type Lang,
} from "@/lib/i18n/dictionaries";

const NOOP = () => () => {};

/**
 * Baca cookie `lang` di client.
 * Default `id` dipakai saat SSR/hydration agar teks tidak berbeda antara
 * server dan browser (state di-sync otomatis oleh `useSyncExternalStore`).
 */
function readLang(): Lang {
  if (typeof document === "undefined") return "id";
  const pair = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LANG_COOKIE}=`));
  const value = pair ? decodeURIComponent(pair.slice(LANG_COOKIE.length + 1)) : "";
  return isLang(value) ? value : "id";
}

/**
 * Cookie tidak mengirim event sendiri — berlangganan perubahan halaman
 * (tab kembali aktif / kembali terlihat) lalu `useSyncExternalStore`
 * membaca ulang nilai terbaru tanpa `setState` manual.
 */
function subscribeLang(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return NOOP();
  window.addEventListener("focus", onStoreChange);
  document.addEventListener("visibilitychange", onStoreChange);
  return () => {
    window.removeEventListener("focus", onStoreChange);
    document.removeEventListener("visibilitychange", onStoreChange);
  };
}

/**
 * Boundary error tingkat aplikasi.
 * Selalu client component (kebutuhan Next) — kamus diambil langsung dari
 * `@/lib/i18n/dictionaries` karena `@/lib/i18n` memakai `next/headers`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useSyncExternalStore<Lang>(
    subscribeLang,
    readLang,
    () => "id" satisfies Lang,
  );

  const t = dictionaries[lang];

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="card w-full max-w-lg text-center">
        <p className="section-kicker">500</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {t.errors.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.errors.body}</p>

        {error.digest ? (
          <p className="mt-4 break-all rounded-lg bg-surface-2 px-3 py-2 font-mono text-[11px] text-muted">
            {error.digest}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn btn-primary">
            {t.errors.retry}
          </button>
          <Link href="/" className="btn btn-ghost">
            {t.errors.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
