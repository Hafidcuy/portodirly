"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/actions/guard";
import {
  errorAction,
  invalidAction,
  okAction,
  readValues,
  type ActionState,
} from "@/lib/action-state";
import { dict, getLang } from "@/lib/i18n";
import { supabaseAdmin } from "@/lib/supabase/server";
import { removeFile } from "@/lib/storage";
import { parseTags, slugify } from "@/lib/utils";
import {
  certificateSchema,
  educationSchema,
  experienceSchema,
  fieldErrors,
  profileSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
  socialSchema,
} from "@/lib/validation";

/** Tabel yang boleh disentuh aksi admin — penghalang ekstra di atas RLS. */
const WRITABLE = new Set([
  "profiles",
  "settings",
  "social_links",
  "skills",
  "projects",
  "experiences",
  "educations",
  "certificates",
  "messages",
]);

/** Kolom gambar per tabel: dibersihkan dari Storage bila diganti/dihapus. */
const ASSET_FIELDS: Record<string, string[]> = {
  profiles: ["avatar_url", "about_photo_url"],
  projects: ["cover_url"],
  certificates: ["image_url"],
};

type Payload = Record<string, unknown>;

/** Buang entri `undefined` agar Supabase memakai nilai DEFAULT-nya. */
function payloadFrom(data: Payload): Payload {
  const out: Payload = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Segarkan seluruh RSC yang membaca konten portofolio. */
function refreshAll() {
  revalidatePath("/", "layout");
}

/**
 * Simpan satu baris (insert bila `id` kosong, update bila ada).
 *
 * Sebelum update, baris lama dibaca dulu supaya berkas gambar yang terganti
 * atau dihapus bisa dibersihkan dari Storage.
 */
async function persist(options: {
  table: string;
  id?: string | number | null;
  payload: Payload;
  values: Record<string, string>;
}): Promise<ActionState> {
  const { table, id, payload, values } = options;
  const t = dict(await getLang());
  const db = supabaseAdmin();

  const assetFields = ASSET_FIELDS[table];
  let previous: Payload | null = null;
  if (id && assetFields?.length) {
    const { data } = await db
      .from(table)
      .select(assetFields.join(","))
      .eq("id", id)
      .maybeSingle();
    previous = (data as Payload | null) ?? null;
  }

  const { error } = id
    ? await db.from(table).update(payload).eq("id", id)
    : await db.from(table).insert(payload);

  if (error) {
    if (error.code === "23505") {
      return invalidAction({ slug: [t.admin.duplicateSlug] }, values);
    }
    return errorAction(`${t.admin.error} (${error.message})`, values);
  }

  if (previous && assetFields) {
    for (const field of assetFields) {
      const before = previous[field];
      const after = payload[field];
      if (typeof before === "string" && before && before !== after) {
        await removeFile(before);
      }
    }
  }

  refreshAll();
  return okAction(t.admin.saved);
}

// ---------------------------------------------------------------------------
// Profil & pengaturan (satu baris)
// ---------------------------------------------------------------------------

export async function saveProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  return persist({
    table: "profiles",
    id: 1,
    payload: payloadFrom(parsed.data),
    values,
  });
}

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  return persist({
    table: "settings",
    id: 1,
    payload: payloadFrom(parsed.data),
    values,
  });
}

// ---------------------------------------------------------------------------
// Tautan sosial
// ---------------------------------------------------------------------------

export async function saveSocial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = socialSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, ...rest } = parsed.data;
  return persist({
    table: "social_links",
    id: id?.trim() || null,
    payload: payloadFrom(rest),
    values,
  });
}

// ---------------------------------------------------------------------------
// Keahlian
// ---------------------------------------------------------------------------

export async function saveSkill(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = skillSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, ...rest } = parsed.data;
  return persist({
    table: "skills",
    id: id?.trim() || null,
    payload: payloadFrom(rest),
    values,
  });
}

// ---------------------------------------------------------------------------
// Proyek
// ---------------------------------------------------------------------------

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);

  // Slug kosong diisi otomatis dari judul Inggris.
  if (!values.slug?.trim()) {
    values.slug = slugify(values.title_en ?? "");
  }

  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, tech_tags, ...rest } = parsed.data;
  return persist({
    table: "projects",
    id: id?.trim() || null,
    payload: payloadFrom({ ...rest, tech_tags: parseTags(tech_tags) }),
    values,
  });
}

// ---------------------------------------------------------------------------
// Pengalaman
// ---------------------------------------------------------------------------

export async function saveExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = experienceSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, ...rest } = parsed.data;
  return persist({
    table: "experiences",
    id: id?.trim() || null,
    payload: payloadFrom(rest),
    values,
  });
}

// ---------------------------------------------------------------------------
// Pendidikan
// ---------------------------------------------------------------------------

export async function saveEducation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = educationSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, ...rest } = parsed.data;
  return persist({
    table: "educations",
    id: id?.trim() || null,
    payload: payloadFrom(rest),
    values,
  });
}

// ---------------------------------------------------------------------------
// Sertifikat
// ---------------------------------------------------------------------------

export async function saveCertificate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = certificateSchema.safeParse(values);
  if (!parsed.success) return invalidAction(fieldErrors(parsed.error), values);

  const { id, ...rest } = parsed.data;
  return persist({
    table: "certificates",
    id: id?.trim() || null,
    payload: payloadFrom(rest),
    values,
  });
}

// ---------------------------------------------------------------------------
// Pesan masuk
// ---------------------------------------------------------------------------

export async function toggleMessageRead(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return errorAction(dict(await getLang()).admin.error);

  const db = supabaseAdmin();
  const { data } = await db
    .from("messages")
    .select("is_read")
    .eq("id", id)
    .maybeSingle();
  if (!data) return errorAction(dict(await getLang()).admin.error);

  const { error } = await db
    .from("messages")
    .update({ is_read: !data.is_read })
    .eq("id", id);
  if (error) return errorAction(dict(await getLang()).admin.error);

  refreshAll();
  return okAction(dict(await getLang()).admin.saved);
}

// ---------------------------------------------------------------------------
// Hapus baris
// ---------------------------------------------------------------------------

/**
 * Hapus satu baris dari tabel mana pun dalam daftar `WRITABLE`.
 *
 * Form memakai input tersembunyi `table` + `id`; berkas gambar yang menempel
 * pada baris tersebut ikut dihapus dari Storage.
 */
export async function deleteItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const t = dict(await getLang());
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "").trim();

  if (!WRITABLE.has(table) || !id) return errorAction(t.admin.error);
  if (table === "profiles" || table === "settings") {
    // Baris singleton tidak boleh dihapus.
    return errorAction(t.admin.error);
  }

  const db = supabaseAdmin();
  const assetFields = ASSET_FIELDS[table];
  let previous: Payload | null = null;
  if (assetFields?.length) {
    const { data } = await db
      .from(table)
      .select(assetFields.join(","))
      .eq("id", id)
      .maybeSingle();
    previous = (data as Payload | null) ?? null;
  }

  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return errorAction(`${t.admin.error} (${error.message})`);

  if (previous && assetFields) {
    for (const field of assetFields) {
      const value = previous[field];
      if (typeof value === "string" && value) await removeFile(value);
    }
  }

  refreshAll();
  return okAction(t.admin.deleted);
}
