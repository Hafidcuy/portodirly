import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Elemen dasar — gunakan "section" bila kartu adalah landmark halaman. */
  as?: "div" | "section" | "article" | "li";
};

/** Kartu permukaan standar (border + radius + shadow halus). */
export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return <Tag className={cn("card", className)}>{children}</Tag>;
}

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Judul + deskripsi + aksi di sisi kanan atas kartu. */
export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
