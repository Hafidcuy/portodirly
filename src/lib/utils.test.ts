import { describe, expect, it } from "vitest";

import { cn, joinTags, parseTags, slugify, toDateInput } from "@/lib/utils";

describe("cn", () => {
  it("menggabungkan kelas yang truthy saja", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
    expect(cn()).toBe("");
  });
});

describe("slugify", () => {
  it("menurunkan judul menjadi slug URL", () => {
    expect(slugify("Halo Dunia!")).toBe("halo-dunia");
    expect(slugify("  Next.js & React  ")).toBe("next-js-react");
  });

  it("membuang tanda kutip, tanda baca ganda, dan memotong di 80 karakter", () => {
    expect(slugify("It's a \"Portofolio\"")).toBe("its-a-portofolio");
    expect(slugify("a".repeat(100))).toHaveLength(80);
  });

  it("menangani input kosong tanpa melempar", () => {
    expect(slugify("")).toBe("");
    expect(slugify("!!!")).toBe("");
  });
});

describe("parseTags / joinTags", () => {
  it("memisah koma, memangkas spasi, dan menghilangkan duplikat berdasarkan huruf kecil", () => {
    expect(parseTags("Next.js, TypeScript ,Tailwind, next.js")).toEqual([
      "Next.js",
      "TypeScript",
      "Tailwind",
    ]);
  });

  it("abaikan entri kosong dan bolak-balik dengan joinTags", () => {
    expect(parseTags(" , , ")).toEqual([]);
    expect(joinTags(["A", "B"])).toBe("A, B");
    expect(joinTags(null)).toBe("");
    expect(joinTags(undefined)).toBe("");
  });
});

describe("toDateInput", () => {
  it("memotong timestamp menjadi YYYY-MM-DD tanpa geser zona waktu", () => {
    expect(toDateInput("2024-05-09T12:00:00Z")).toBe("2024-05-09");
    expect(toDateInput("2024-05-09")).toBe("2024-05-09");
    expect(toDateInput(null)).toBe("");
    expect(toDateInput(undefined)).toBe("");
  });
});
