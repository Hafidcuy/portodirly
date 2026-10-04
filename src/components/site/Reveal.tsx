"use client";

import type { CSSProperties, ReactNode } from "react";

import { HIDDEN_CLASS, REVEALED_CLASS, useInView } from "@/components/site/useInView";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Jeda animasi dalam milidetik (untuk efek berurutan). */
  delay?: number;
  /** Ambang deteksi viewport — lebih kecil = animasi dimulai lebih awal. */
  threshold?: number;
  style?: CSSProperties;
};

/**
 * Bungkus konten yang ingin muncul sekali saat masuk viewport.
 *
 * Konten dirender utuh di server; kelas animasi hanya dipasang di browser
 * sehingga halaman tetap terbaca tanpa JavaScript dan tanpa kilatan.
 */
export function Reveal({ children, className, delay = 0, threshold, style }: RevealProps) {
  const { ref, state } = useInView<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      className={cn(
        state === "pending" && HIDDEN_CLASS,
        state === "in" && REVEALED_CLASS,
        className,
      )}
      style={delay ? { animationDelay: `${delay}ms`, ...style } : style}
    >
      {children}
    </div>
  );
}
