"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dict, type Lang } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  /** Cocokkan persis (dashboard) atau awalan path. */
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

/**
 * Navigasi panel — sengaja client agar bisa menandai rute aktif.
 *
 * Dua varian: `sidebar` (berkelompok, layar sedang ke atas) dan `bar`
 * (datar tanpa judul kelompok, digulir horizontal di layar kecil).
 */
export function AdminNav({ lang, variant }: { lang: Lang; variant: "sidebar" | "bar" }) {
  const t = dict(lang);
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      title: t.admin.overview,
      items: [{ href: "/admin", label: t.admin.dashboard, exact: true }],
    },
    {
      title: t.admin.content,
      items: [
        { href: "/admin/profile", label: t.admin.profile.title },
        { href: "/admin/skills", label: t.admin.skills.title },
        { href: "/admin/projects", label: t.admin.projects.title },
        { href: "/admin/experience", label: t.admin.experience.title },
        { href: "/admin/education", label: t.admin.education.title },
        { href: "/admin/certificates", label: t.admin.certificates.title },
      ],
    },
    {
      title: t.admin.messagesLabel,
      items: [{ href: "/admin/messages", label: t.admin.messages.title }],
    },
    {
      title: t.admin.settingsLabel,
      items: [{ href: "/admin/settings", label: t.admin.settings.title }],
    },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const link = (item: NavItem) => {
    const active = isActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm font-medium transition",
          active
            ? "bg-accent-soft text-accent"
            : "text-muted hover:bg-surface-2 hover:text-foreground",
        )}
      >
        {item.label}
      </Link>
    );
  };

  if (variant === "bar") {
    return (
      <nav
        aria-label={t.admin.signInTitle}
        className="flex items-center gap-1 whitespace-nowrap"
      >
        {groups.flatMap((group) => group.items).map(link)}
      </nav>
    );
  }

  return (
    <nav aria-label={t.admin.signInTitle} className="space-y-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {group.title}
          </p>
          <ul className="space-y-0.5">{group.items.map((item) => <li key={item.href}>{link(item)}</li>)}</ul>
        </div>
      ))}
    </nav>
  );
}
