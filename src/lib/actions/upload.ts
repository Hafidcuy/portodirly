"use server";

import { requireAdmin } from "@/lib/actions/guard";
import { dict, getLang } from "@/lib/i18n";
import { uploadFile, type UploadKind } from "@/lib/storage";

export type UploadState =
  | { ok: true; url: string }
  | { ok: false; message: string };

/**
 * Unggah satu berkas ke bucket Supabase `portfolio-assets`.
 *
 * Dipanggil lewat `startTransition` dari komponen `ImageUpload`, sehingga
 * berkas TIDAK ikut dikirim bersama form induk (hemat body dan batas 6 MB).
 */
export async function uploadAsset(formData: FormData): Promise<UploadState> {
  await requireAdmin();

  const t = dict(await getLang());
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "uploads");
  const kind = String(formData.get("kind") ?? "image") === "any" ? "any" : "image";

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: t.admin.images.failed };
  }

  const result = await uploadFile(file, folder, kind as UploadKind);
  if (result.ok) return { ok: true, url: result.url };

  switch (result.reason) {
    case "too-large":
      return { ok: false, message: t.admin.images.tooLarge };
    case "wrong-type":
      return {
        ok: false,
        message: kind === "any" ? t.admin.images.wrongTypeAny : t.admin.images.wrongType,
      };
    default:
      return { ok: false, message: t.admin.images.failed };
  }
}
