"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FormLang = "en" | "id";

type LangTabState = {
  active: FormLang;
  setActive: (lang: FormLang) => void;
};

const LangTabContext = createContext<LangTabState>({
  active: "en",
  setActive: () => undefined,
});

type ProviderProps = {
  children: ReactNode;
  labels: Record<FormLang, string>;
  initial?: FormLang;
};

/**
 * Konteks tab bahasa untuk form admin bilingual (EN | ID).
 *
 * Kedua kolom `_en` dan `_id` SELALU ikut terkirim ke server — tab hanya
 * mengubah tampilan. Karena itu beralih tab tidak pernah menghapus isian
 * bahasa lain.
 */
export function LangTabProvider({ children, labels, initial = "en" }: ProviderProps) {
  const [active, setActive] = useState<FormLang>(initial);

  return (
    <LangTabContext.Provider value={{ active, setActive }}>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1">
        {(["en", "id"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActive(lang)}
            aria-pressed={active === lang}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              active === lang
                ? "bg-surface text-accent shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {labels[lang]}
          </button>
        ))}
      </div>
      {children}
    </LangTabContext.Provider>
  );
}

/** Tampilkan isian hanya untuk bahasa yang sedang aktif. */
export function LangPane({ lang, children }: { lang: FormLang; children: ReactNode }) {
  const { active } = useContext(LangTabContext);
  const visible = active === lang;

  return (
    <div hidden={!visible} className={visible ? undefined : "hidden"}>
      {children}
    </div>
  );
}
