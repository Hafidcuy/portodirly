"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";

import { uploadAsset } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  /** Nama input tersembunyi yang membawa URL hasil unggah ke form induk. */
  name: string;
  /** URL awal (dari baris yang sedang disunting). */
  value?: string | null;
  /** Folder di dalam bucket — mis. `projects`, `certificates`. */
  folder: string;
  /** `image` = hanya gambar; `any` = gambar + PDF (mis. sertifikat). */
  kind?: "image" | "any";
  label: string;
  hint?: string;
  /** Tambahkan pratinjau rasio tertentu (mis. `aspect-video`). */
  previewClassName?: string;
  error?: string | null;
  /** Teks tombol/pesan — ambil dari kamus (`t.admin.images`). */
  labels: { upload: string; uploading: string; remove: string };
};

const ACCEPT = {
  image: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
  any: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf",
} as const;

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(url);
}

/**
 * Pilih berkas → unggah ke Supabase Storage lewat `uploadAsset` →
 * URL publiknya dikirim ke form induk sebagai input tersembunyi.
 *
 * Unggahan berjalan di `startTransition` tersendiri sehingga berkas tidak
 * ikut membengkakkan body form utama.
 */
export function ImageUpload({
  name,
  value,
  folder,
  kind = "image",
  label,
  hint,
  previewClassName,
  error,
  labels,
}: ImageUploadProps) {
  const [url, setUrl] = useState(value ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const send = (file?: File | null) => {
    if (!file) return;

    const data = new FormData();
    data.set("file", file);
    data.set("folder", folder);
    data.set("kind", kind);

    setMessage(null);
    startTransition(async () => {
      const result = await uploadAsset(data);
      if (result.ok) {
        setUrl(result.url);
      } else {
        setMessage(result.message);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    send(event.dataTransfer.files?.[0]);
  };

  const feedback = message ?? (error ?? null);

  return (
    <div>
      <span className="field-label">{label}</span>

      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border border-dashed border-border bg-surface-2/50 p-3 transition",
          dragging && "border-accent bg-accent-soft",
          feedback && "border-danger",
        )}
      >
        {url ? (
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface",
                previewClassName,
              )}
            >
              {isImage(url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-center text-[10px] font-semibold text-muted">PDF</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
              >
                {pending ? labels.uploading : labels.upload}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pending}
                onClick={() => {
                  setUrl("");
                  setMessage(null);
                }}
              >
                {labels.remove}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full flex-col items-center gap-1 py-4 text-center disabled:opacity-60"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-sm font-semibold text-foreground">
              {pending ? labels.uploading : labels.upload}
            </span>
            <span className="text-xs text-muted">{hint}</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[kind]}
          className="sr-only"
          disabled={pending}
          onChange={(event) => send(event.target.files?.[0])}
        />
      </div>

      {feedback ? (
        <span className="field-error" role="alert">
          {feedback}
        </span>
      ) : null}
    </div>
  );
}
