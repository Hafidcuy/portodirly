import type { PublicSocial } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Glyph SVG ringan per kunci ikon. Sengaja dibuat sederhana (bentuk dasar)
 * agar tidak bergantung pada pustaka ikon eksternal; label selalu ikut
 * ditampilkan sehingga tautan tetap jelas walau glyph-nya generik.
 */
function Glyph({ name }: { name: string }) {
  const key = name.trim().toLowerCase();

  if (key === "x" || key === "twitter") {
    return <path d="M5 5l14 14M19 5L5 19" />;
  }

  if (key === "github") {
    return (
      <path d="M12 3a9 9 0 0 0-2.84 17.53c.45.08.62-.2.62-.43v-1.7c-2.5.54-3.03-1.07-3.03-1.07-.41-1.04-.99-1.32-.99-1.32-.81-.56.06-.55.06-.55.9.07 1.37.93 1.37.93.8 1.37 2.09.97 2.6.74.08-.58.31-.97.57-1.19-2-.23-4.1-.99-4.1-4.43 0-.98.35-1.78.92-2.4-.09-.23-.4-1.15.09-2.4 0 0 .76-.24 2.48.92a8.6 8.6 0 0 1 4.5 0c1.72-1.16 2.48-.92 2.48-.92.49 1.25.18 2.17.09 2.4.57.62.92 1.42.92 2.4 0 3.45-2.11 4.2-4.11 4.42.32.28.61.82.61 1.66v2.45c0 .24.16.52.62.43A9 9 0 0 0 12 3z" />
    );
  }

  if (key === "linkedin") {
    return (
      <path d="M5 9h3v10.5H5V9zm1.5-4.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10 9h2.9v1.42c.42-.76 1.44-1.65 2.97-1.65 3.17 0 3.75 2.05 3.75 4.72v6.01h-3v-5.33c0-1.27-.02-2.91-1.83-2.91-1.84 0-2.12 1.38-2.12 2.81v5.43H10V9z" />
    );
  }

  if (key === "youtube") {
    return (
      <>
        <rect x="3.5" y="6.5" width="17" height="11" rx="3.5" />
        <path d="M10.8 10.2l3.7 1.9-3.7 1.9v-3.8z" />
      </>
    );
  }

  if (key === "instagram") {
    return (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
      </>
    );
  }

  if (key === "dribbble") {
    return (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M5.2 8.6c4.4 1.4 9.6 1.1 13.1-1M4.2 14.2c4.9-1.9 10.1-1 13.6 2.7M9.2 4.1c3.4 4.1 5.3 9.4 5.7 15" />
      </>
    );
  }

  if (key === "gitlab") {
    return (
      <path d="M12 20.5L8.6 10h6.8L12 20.5zM4.4 10L6.1 4.8c.1-.3.5-.3.6 0l1.9 5.2H4.4zm15.2 0h-4.2l1.9-5.2c.1-.3.5-.3.6 0L19.6 10zM4.4 10l1.5 4.6L12 20.5 4.4 10zm15.2 0l-1.5 4.6L12 20.5l7.6-10.5z" />
    );
  }

  // Globe / generik / kunci tak dikenal.
  return (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.6 12h16.8M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5z" />
    </>
  );
}

type SocialLinksProps = {
  socials: PublicSocial[];
  emptyLabel: string;
  className?: string;
  /** Sembunyikan label teks — glyph saja (dipakai di hero/kontak). */
  compact?: boolean;
};

/** Deretan tautan sosial dengan glyph dan label yang bisa diakses pembaca layar. */
export function SocialLinks({ socials, emptyLabel, className, compact }: SocialLinksProps) {
  if (socials.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {socials.map((social) => (
        <li key={social.id}>
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition",
              "hover:border-accent/40 hover:text-foreground",
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
            >
              <Glyph name={social.icon || social.label} />
            </svg>
            <span className={compact ? "sr-only" : undefined}>{social.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
