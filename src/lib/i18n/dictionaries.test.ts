import { describe, expect, it } from "vitest";

import { dict, isLang, LANGS, LANG_COOKIE } from "@/lib/i18n/dictionaries";

describe("dict", () => {
  it("mengembalikan kamus sesuai bahasa", () => {
    expect(dict("en").nav.home).toBe("Home");
    expect(dict("id").nav.home).toBe("Beranda");
    expect(dict("en").hero.available).toBe("Available for work");
    expect(dict("id").hero.available).toBe("Terbuka untuk kerja");
  });

  it("EN dan ID punya struktur kunci yang sama", () => {
    const flatten = (value: unknown, prefix = ""): string[] => {
      if (typeof value !== "object" || value === null) return [prefix];
      return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        flatten(child, prefix ? `${prefix}.${key}` : key),
      );
    };

    expect(flatten(dict("id"))).toEqual(flatten(dict("en")));
  });
});

describe("isLang / LANGS", () => {
  it("hanya menerima 'en' dan 'id'", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("id")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it("LANGS dan cookie konsisten", () => {
    expect([...LANGS]).toEqual(["en", "id"]);
    expect(LANG_COOKIE).toBe("lang");
  });
});
