/** Bentuk state yang dikembalikan setiap Server Action form. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Pesan validasi per-field: `{ "title_en\": [\"Required\"] }`. */
  fieldErrors?: Record<string, string[]>;
  /** Nilai form yang dikirim user, dikembalikan agar input tidak kosong. */
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { status: "idle" };

/** Status sukses disertai pesan terjemahan. */
export function okAction(message: string, values?: Record<string, string>): ActionState {
  return { status: "success", message, values };
}

/** Status gagal umum. */
export function errorAction(message: string, values?: Record<string, string>): ActionState {
  return { status: "error", message, values };
}

/** Status gagal validasi: pesan per-field plus nilai form. */
export function invalidAction(
  fieldErrors: Record<string, string[]>,
  values?: Record<string, string>,
): ActionState {
  return { status: "error", fieldErrors, values };
}

/**
 * Ambil semua nilai string dari FormData untuk mengisi ulang form.
 *
 * Checkbox sering dikirim berpasangan (`hidden=false` + `checkbox=on`).
 * Bila ada beberapa nilai untuk satu kunci, pilih `"on"`/`"true"` agar
 * centangan yang aktif tetap tergambar saat form dirender ulang.
 */
export function readValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of new Set(formData.keys())) {
    const raw = formData.get(key);
    if (typeof raw !== "string") continue;
    if (raw === "" && key === "sort_order") continue;

    let chosen = raw;
    if (raw !== "on" && raw !== "true") {
      for (const alt of formData.getAll(key)) {
        if (typeof alt === "string" && (alt === "on" || alt === "true")) {
          chosen = alt;
          break;
        }
      }
    }
    values[key] = chosen;
  }
  return values;
}
