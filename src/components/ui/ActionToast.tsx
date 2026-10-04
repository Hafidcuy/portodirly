"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

type Tone = "success" | "error";

/**
 * Toast bawaan untuk hasil Server Action.
 *
 * Menampilkan `state.message` setiap kali aksi selesai dan menyembunyikannya
 * sendiri beberapa detik kemudian.
 */
export function ActionToast({
  state,
  fallback,
  duration = 4000,
}: {
  state: ActionState;
  /** Pesan cadangan bila aksi gagal validasi tanpa pesan umum. */
  fallback?: string;
  duration?: number;
}) {
  // Toast yang sama tidak muncul ulang: `expired` menandai hasil aksi
  // yang sudah ditutup (manual) atau yang waktunya sudah habis.
  const [expired, setExpired] = useState<ActionState | null>(null);

  const message = state.message ?? (state.status === "error" ? fallback : undefined);
  const tone: Tone = state.status === "success" ? "success" : "error";
  const visible = state.status !== "idle" && Boolean(message) && expired !== state;

  // Sembunyikan otomatis — `setState` hanya dipanggil di dalam callback timer.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setExpired(state), duration);
    return () => clearTimeout(timer);
  }, [state, visible, duration]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg",
          tone === "success"
            ? "border-success/40 bg-surface text-foreground"
            : "border-danger/40 bg-surface text-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-0.5 h-2 w-2 shrink-0 rounded-full",
            tone === "success" ? "bg-success" : "bg-danger",
          )}
        />
        <span>{message}</span>
        <button
          type="button"
          onClick={() => setExpired(state)}
          className="-mr-1 -mt-1 rounded-md px-1.5 py-0.5 text-muted hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
