"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";

import { setLang } from "@/lib/actions/session";
import type { Lang } from "@/lib/i18n";

type ThemeChoice = "light" | "dark" | "system";

const ORDER: ThemeChoice[] = ["light", "dark", "system"];

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* localStorage bisa diblokir (private mode) — abaikan. */
  }
  return "system";
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;

  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    /* mode privat: terapkan ke DOM saja */
  }

  root.classList.toggle("dark", theme === "dark" || (theme === "system" && systemPrefersDark()));
}

const themeListeners = new Set<() => void>();

/** Beritahu komponen bahwa nilai tersimpan sudah berubah. */
function notifyTheme() {
  for (const listener of themeListeners) listener();
}

/**
 * Langganan perubahan tema: klik tombol di tab ini (lewat `notifyTheme`)
 * dan tab lain (event `storage`). Dipakai `useSyncExternalStore` sehingga
 * tidak perlu `setState` di dalam effect.
 */
function subscribeTheme(onStoreChange: () => void): () => void {
  themeListeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === "theme" || event.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Tombol ganti bahasa EN ↔ ID.
 *
 * Menulis cookie `lang` lewat Server Action lalu me-refresh payload RSC,
 * sehingga seluruh teks (termasuk layout server) ikut berganti tanpa reload
 * penuh dan tanpa kilatan teks yang berubah sendiri.
 */
export function LangToggle({
  lang,
  labels,
  ariaLabel,
}: {
  lang: Lang;
  labels: { en: string; id: string };
  ariaLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  function switchTo(next: Lang) {
    if (next === lang || pending) return;
    startTransition(async () => {
      // `setLang` memanggil `revalidatePath`, sehingga seluruh pohon RSC
      // (termasuk atribut `lang` pada <html>) ikut di-render ulang.
      await setLang(next);
    });
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-lg border border-border bg-surface-2/60 p-0.5"
    >
      {(["en", "id"] as const).map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            disabled={pending}
            onClick={() => switchTo(code)}
            className={
              active
                ? "rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-contrast"
                : "rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-foreground"
            }
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}

/**
 * Tombol tema tiga tahap: terang → gelap → sistem.
 *
 * Sumber kebenaran disimpan di `localStorage.theme`; nilai `system` berarti
 * mengikuti preferensi perangkat (dihapus dari penyimpanan). Script anti-flash
 * di root layout membaca nilai yang sama sebelum paint pertama.
 */
export function ThemeToggle({
  labels,
  ariaLabel,
}: {
  labels: { light: string; dark: string; system: string };
  ariaLabel: string;
}) {
  // Nilai dibaca langsung dari `localStorage` lewat store eksternal,
  // sehingga tidak ada efek yang memanggil `setState`.
  const theme = useSyncExternalStore<ThemeChoice>(
    subscribeTheme,
    readStoredTheme,
    () => "system",
  );

  // Saat mode sistem aktif, ikuti perubahan preferensi OS secara langsung.
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={`${labels[theme]} → ${labels[next]}`}
      onClick={() => {
        applyTheme(next);
        notifyTheme();
      }}
      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface-2/60 text-muted transition hover:border-accent/40 hover:text-foreground"
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}
