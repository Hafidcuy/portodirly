import type { ReactNode } from "react";

import { Reveal } from "@/components/site/Reveal";

type SectionHeadingProps = {
  /** Baris kecil di atas judul (mis. "02 — Skills"). */
  kicker: string;
  title: string;
  lead?: ReactNode;
  /** Elemen yang dibungkus — default `<h2>`. */
  as?: "h2" | "h3";
  className?: string;
  align?: "start" | "center";
};

/**
 * Kepala standar setiap section: kicker, judul, dan lead.
 *
 * Sengaja dikemas dalam satu komponen agar jarak dan tipografi antar
 * section konsisten tanpa mengulang markup di `page.tsx`.
 */
export function SectionHeading({
  kicker,
  title,
  lead,
  as: Heading = "h2",
  className = "",
  align = "start",
}: SectionHeadingProps) {
  return (
    <Reveal className={className}>
      <header className={align === "center" ? "mx-auto max-w-2xl text-center" : undefined}>
        <p className="section-kicker">{kicker}</p>
        <Heading className="section-title">{title}</Heading>
        {lead ? <p className="section-lead">{lead}</p> : null}
      </header>
    </Reveal>
  );
}
