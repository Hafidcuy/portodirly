/**
 * Snapshot & pemulihan isi form di sisi klien.
 *
 * React 19 mereset seluruh field *uncontrolled* setelah aksi form selesai
 * (lihat react.dev → `form`). Bila aksi gagal validasi, isian user jadi
 * kosong padahal pesan error masih tampil — oleh karena itu isi form
 * di-capture sebelum aksi dan ditulis ulang setelah aksi bila tidak di-reset.
 *
 * Modul ini hanya dipakai dari Client Component (`"use client"`).
 */

/** Pasangan `[nama, nilai]` sesuai urutan isian user. */
export type FormSnapshot = Array<[name: string, value: string]>;

/** Ambil nilai teks dari `FormData` (file dilewati). */
export function captureFormSnapshot(formData: FormData): FormSnapshot {
  const snapshot: FormSnapshot = [];
  for (const [name, value] of formData.entries()) {
    if (typeof value === "string") snapshot.push([name, value]);
  }
  return snapshot;
}

function elementValues(name: string, snapshot: FormSnapshot): string[] {
  const values: string[] = [];
  for (const [key, value] of snapshot) if (key === name) values.push(value);
  return values;
}

/**
 * Tulis ulang isi snapshot ke input di dalam `form`.
 *
 * Aturan:
 * - checkbox/radio: dicentang bila nilai terkirim ada di snapshot;
 * - sisanya (text, textarea, hidden, select): ambil nilai pertama;
 * - input `file` dan tombol submit dilewati.
 *
 * Snapshot dipakai (bukan `state.values`) karena `readValues` bisa
 * mengabaikan nilai kosong, sedangkan FormData selalu lengkap.
 */
export function restoreFormSnapshot(form: HTMLFormElement, snapshot: FormSnapshot) {
  if (snapshot.length === 0) return;

  for (const element of Array.from(form.elements)) {
    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLTextAreaElement) &&
      !(element instanceof HTMLSelectElement)
    ) {
      continue;
    }

    const name = element.name;
    if (!name || (element instanceof HTMLInputElement && element.type === "file")) continue;

    const values = elementValues(name, snapshot);
    if (values.length === 0) continue;

    if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
      element.checked = values.includes(element.value);
      continue;
    }

    element.value = values[0] ?? "";
  }
}
