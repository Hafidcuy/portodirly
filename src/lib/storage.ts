import "server-only";

import {
  bucketName,
  publicObjectUrl,
  storagePathFromUrl,
  supabaseAdmin,
} from "@/lib/supabase/server";

/** Batas ukuran file unggahan: 5 MB. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const ALLOWED_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);

export type UploadKind = "image" | "any";

export type UploadFailure = "too-large" | "wrong-type" | "failed";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; reason: UploadFailure };

function extensionFor(file: File): string {
  const fromName = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  if (fromName && fromName.length <= 5) return fromName;

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

/**
 * Unggah file ke bucket Supabase dan kembalikan URL publiknya.
 *
 * Berkas disimpan di subfolder sesuai konteks (`projects/`, `certificates/`, …)
 * dengan prefix waktu agar penggantian gambar tidak bentrok di cache CDN.
 */
export async function uploadFile(
  file: File,
  folder: string,
  kind: UploadKind = "image",
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too-large" };

  const allowed = kind === "image" ? IMAGE_TYPES : ALLOWED_TYPES;
  const typeOk = allowed.has(file.type) || file.type === "";
  if (!typeOk) return { ok: false, reason: "wrong-type" };

  const bucket = bucketName();
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "uploads";
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const path = `${safeFolder}/${stamp}-${random}.${extensionFor(file)}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin()
      .storage.from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false, cacheControl: "31536000" });

    if (error) return { ok: false, reason: "failed" };

    return { ok: true, url: publicObjectUrl(path), path };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * Hapus aset lama bila URL-nya menunjuk ke bucket kita.
 * Aman dipanggil berkali-kali: URL eksternal atau `null` langsung diabaikan.
 */
export async function removeFile(url: string | null | undefined): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;

  try {
    await supabaseAdmin().storage.from(bucketName()).remove([path]);
  } catch {
    // Kegagalan penghapusan aset lama tidak boleh menggagalkan operasi utama.
  }
}
