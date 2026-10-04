/**
 * Tipe `searchParams` untuk halaman admin (Next 16: selalu `Promise`).
 *
 * Sengaja memakai bentuk index-signature bawaan Next agar tipe halaman
 * kompatibel dengan generator tipe bawaan framework.
 */
export type AdminSearch = { [key: string]: string | string[] | undefined };

/** Ambil nilai pertama — Next mengirim array bila query diulang (`?edit=a&edit=b`). */
export function searchValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
