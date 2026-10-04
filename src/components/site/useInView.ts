"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Kelas yang menyembunyikan konten sebelum animasi masuk.
 *
 * Dipakai `Reveal` (render) dan hook ini (kunci pra-paint) — satu sumber
 * kebenaran agar keduanya tidak pernah berbeda.
 */
export const HIDDEN_CLASS = "translate-y-6 opacity-0";

/** Kelas animasi masuk — dipakai `Reveal` dan hook ini. */
export const REVEALED_CLASS = "animate-reveal";

/**
 * Status elemen terhadap viewport.
 *
 * - `idle`   — kondisi awal (server / sebelum terukur). Konten TAMPIL,
 *              sehingga pengunjung tanpa JavaScript tetap melihat halaman.
 * - `pending`— sudah terdeteksi di luar viewport: disembunyikan sementara.
 * - `in`     — masuk viewport: jalankan animasi masuk.
 *
 * Pemindaian pertama dilakukan di `useLayoutEffect` (sebelum paint). Hasilnya
 * dikunci lewat kelas DOM langsung — bukan `setState` — sehingga tidak ada
 * kedipan "tampil → hilang → tampil" dan aturan
 * `react-hooks/set-state-in-effect` tetap terpenuhi.
 */
export type InViewState = "idle" | "pending" | "in";

/**
 * Pantau apakah elemen sudah masuk viewport.
 *
 * Nilai awal `idle` dipertahankan pada render server; transisi ke
 * `pending`/`in` hanya dipanggil dari callback `IntersectionObserver`.
 */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<InViewState>("idle");

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Tanpa IntersectionObserver (lingkungan sangat lama) konten tetap tampil
    // seperti kondisi `idle` — tanpa animasi, tetapi tanpa kilatan.
    if (typeof IntersectionObserver === "undefined") return;

    if (state === "idle") {
      // Kunci tampilan SEBELUM paint lewat DOM: menyetel state dari dalam
      // effect dilarang linter, dan menundanya lewat timer akan memicu kilatan.
      const rect = element.getBoundingClientRect();
      const visibleNow = rect.top < window.innerHeight && rect.bottom > 0;
      if (visibleNow) element.classList.add(REVEALED_CLASS);
      else element.classList.add(...HIDDEN_CLASS.split(" "));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("in");
            observer.disconnect();
          } else if (state === "idle") {
            // Mulai di luar viewport: serahkan kepemilikan kelas ke React.
            setState("pending");
          }
        }
      },
      { threshold, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, state]);

  return { ref, state };
}
