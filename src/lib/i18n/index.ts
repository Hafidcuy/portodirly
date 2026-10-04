import { cookies } from "next/headers";

import {
  isLang,
  LANG_COOKIE,
  type Bilingual,
  type Lang,
} from "@/lib/i18n/dictionaries";

export * from "@/lib/i18n/dictionaries";

export const DEFAULT_LANG: Lang = "id";

/**
 * Bahasa aktif dibaca dari cookie `lang` yang di-set oleh Server Action
 * tombol toggle di navbar. Karena cookie dibaca di server, tidak ada
 * teks yang "berubah sendiri" tanpa re-render — anti-flicker by design.
 */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const raw = store.get(LANG_COOKIE)?.value;
  return isLang(raw) ? raw : DEFAULT_LANG;
}

/** Kode ISO yang ditulis ke atribut `lang` pada `<html>`. */
export function langAttribute(lang: Lang): "en" | "id" {
  return lang;
}

/** Bahasa lain — dipakai tombol toggle EN ↔ ID. */
export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "id" : "en";
}

/**
 * Ambil varian bahasa dari data bilingual di database.
 * Nilai kosong pada bahasa terpilih otomatis jatuh ke bahasa lain,
 * jadi admin tidak perlu mengisi dua kolom untuk konten yang sama.
 */
export function pick(lang: Lang, value: Partial<Bilingual> | null | undefined): string {
  if (!value) return "";
  const primary = value[lang];
  if (primary && primary.trim().length > 0) return primary;
  const fallback = lang === "en" ? value.id : value.en;
  return fallback ?? "";
}

/** Format tanggal `YYYY-MM-DD` (atau ISO lengkap) sesuai bahasa. */
export function formatDate(
  lang: Lang,
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" },
): string {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}

/** Format rentang tanggal: `Jan 2023 – Present`. */
export function formatDateRange(
  lang: Lang,
  start: string | null | undefined,
  end: string | null | undefined,
  presentLabel: string,
): string {
  const from = formatDate(lang, start);
  const to = end ? formatDate(lang, end) : presentLabel;
  if (!from) return to;
  if (!to) return from;
  return `${from} – ${to}`;
}
