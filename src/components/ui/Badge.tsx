import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "danger";
  className?: string;
};

const TONE_CLASS: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "",
  accent: "badge-accent",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

/** Label kecil berbentuk pil untuk status, kategori, dan tech tag. */
export function Badge({ children, tone = "default", className }: BadgeProps) {
  return <span className={cn("badge", TONE_CLASS[tone], className)}>{children}</span>;
}
