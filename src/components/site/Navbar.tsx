"use client";

import { useCallback, useEffect, useState } from "react";

import { LangToggle, ThemeToggle } from "@/components/site/Toggles";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

export type NavItem = { id: string; label: string };

type NavbarProps = {
  brand: string;
  items: NavItem[];
  lang: Lang;
  labels: {
    menu: string;
    close: string;
    skipToContent: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    langEn: string;
    langId: string;
  };
};

/**
 * Bilah navigasi lengket di seluruh halaman.
 *
 * Menjadi komponen client karena memuat menu mobile dan dua tombol interaktif
 * (bahasa & tema); tautan navigasinya sendiri tetap hash ke section halaman.
 */
export function Navbar({ brand, items, lang, labels }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-contrast"
      >
        {labels.skipToContent}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <a
            href="#top"
            onClick={close}
            className="truncate text-sm font-bold tracking-tight text-foreground"
          >
            {brand}
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-5">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[13px] font-medium text-muted transition hover:text-foreground xl:text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle
              lang={lang}
              ariaLabel={labels.language}
              labels={{ en: labels.langEn, id: labels.langId }}
            />
            <ThemeToggle
              ariaLabel={labels.theme}
              labels={{
                light: labels.themeLight,
                dark: labels.themeDark,
                system: labels.themeSystem,
              }}
            />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? labels.close : labels.menu}
              onClick={() => setOpen((value) => !value)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface-2/60 text-foreground transition hover:border-accent/40 lg:hidden"
            >
              <span aria-hidden className="block h-3.5 w-4 border-y-2 border-current" />
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          hidden={!open}
          className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
        >
          <nav aria-label="Mobile" className="shell py-4">
            <ul className="grid gap-1">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={close}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
