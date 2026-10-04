/** Gabungkan class-name dengan aman (tanpa dependensi `clsx`). */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** Rentang Unicode combining marks (diakritik) yang muncul setelah NFKD. */
const COMBINING_MIN = 0x0300;
const COMBINING_MAX = 0x036f;

/** Tanda kutip lurus dan lengkung yang tidak boleh muncul di slug. */
function isQuote(code: number): boolean {
  return code === 0x27 || code === 0x2018 || code === 0x2019;
}

/**
 * Ubah judul menjadi slug URL yang bersih.
 * Menangani tanda baca umum dan karakter non-Latin secara best-effort.
 */
export function slugify(input: string): string {
  const normalized = input.normalize("NFKD");
  let slug = "";

  for (const character of normalized) {
    const code = character.codePointAt(0) ?? 0;
    if (code >= COMBINING_MIN && code <= COMBINING_MAX) continue;
    if (isQuote(code)) continue;
    const isAsciiAlphanumeric =
      (code >= 0x30 && code <= 0x39) ||
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a);
    slug += isAsciiAlphanumeric ? character : " ";
  }

  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** `"Next.js, TypeScript ,Tailwind"` → `["Next.js", "TypeScript", "Tailwind"]`. */
export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input.split(",")) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }
  return result;
}

/** Balik pemisah kumpulan tag untuk mengisi form. */
export function joinTags(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}

/** Ubah `YYYY-MM-DD` menjadi nilai input date tanpa risiko zona waktu. */
export function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/** Ambil `File` dari FormData; `undefined` bila tidak ada atau kosong. */
export function fileFromForm(formData: FormData, key: string): File | undefined {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return undefined;
}
