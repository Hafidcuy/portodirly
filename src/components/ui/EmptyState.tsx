import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
};

/** Pesan kosong yang tampil bila daftar belum berisi item. */
export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-2/40 px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
