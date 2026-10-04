import Link from "next/link";

import { AdminNotice } from "@/components/admin/AdminNotice";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { missingSupabaseEnv } from "@/lib/env";
import { adminMessages, adminStats, type DashboardStats } from "@/lib/data";
import { dict, formatDate, getLang } from "@/lib/i18n";
import type { MessageRow } from "@/lib/types";

export const metadata = { title: "Dashboard · Admin" };

type Stat = {
  key: keyof DashboardStats;
  label: string;
  href: string;
  tone?: "accent" | "danger";
};

/**
 * Dashboard admin: ringkasan jumlah konten, aksi cepat, dan pesan terbaru.
 * Tanpa Server Action — halaman ini murni baca.
 */
export default async function AdminDashboardPage() {
  const lang = await getLang();
  const t = dict(lang);

  let stats: DashboardStats;
  let recent: MessageRow[];

  try {
    [stats, recent] = await Promise.all([adminStats(), adminMessages()]);
  } catch (error) {
    return (
      <AdminNotice
        reason={missingSupabaseEnv().length > 0 ? "not-configured" : "failed"}
        missing={missingSupabaseEnv()}
        detail={error instanceof Error ? error.message : undefined}
        retryHref="/admin"
        t={t}
      />
    );
  }

  const cards: Stat[] = [
    { key: "projects", label: t.admin.stats.projects, href: "/admin/projects" },
    { key: "skills", label: t.admin.stats.skills, href: "/admin/skills" },
    { key: "certificates", label: t.admin.stats.certificates, href: "/admin/certificates" },
    { key: "messages", label: t.admin.stats.messages, href: "/admin/messages" },
    {
      key: "unread",
      label: t.admin.stats.unread,
      href: "/admin/messages",
      tone: stats.unread > 0 ? "danger" : undefined,
    },
  ];

  const quickActions = [
    { href: "/admin/profile", label: t.admin.profile.title },
    { href: "/admin/skills?new=1", label: `${t.admin.create} · ${t.admin.skills.title}` },
    { href: "/admin/projects?new=1", label: `${t.admin.create} · ${t.admin.projects.title}` },
    {
      href: "/admin/experience?new=1",
      label: `${t.admin.create} · ${t.admin.experience.title}`,
    },
    { href: "/admin/education?new=1", label: `${t.admin.create} · ${t.admin.education.title}` },
    {
      href: "/admin/certificates?new=1",
      label: `${t.admin.create} · ${t.admin.certificates.title}`,
    },
    { href: "/admin/settings", label: t.admin.settings.title },
  ];

  const inbox = recent.slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <p className="section-kicker">{t.admin.overview}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {t.admin.dashboard}
        </h1>
      </header>

      {/* Statistik */}
      <section aria-label={t.admin.overview}>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {cards.map((card) => {
            const value = stats[card.key];
            return (
              <li key={card.key}>
                <Link
                  href={card.href}
                  className="card block p-4 transition hover:border-accent/40"
                >
                  <span className="block text-2xl font-bold tabular-nums text-foreground">
                    {value}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                    {card.label}
                    {card.tone === "danger" ? (
                      <Badge tone="danger">{t.admin.messages.unread}</Badge>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Aksi cepat */}
        <section aria-labelledby="quick-actions" className="card p-5">
          <h2 id="quick-actions" className="text-base font-semibold">
            {t.admin.quickActions}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link href={action.href} className="btn btn-ghost btn-sm">
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pesan terbaru */}
        <section aria-labelledby="recent-messages" className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-messages" className="text-base font-semibold">
              {t.admin.recentMessages}
            </h2>
            <Link href="/admin/messages" className="text-sm font-medium text-accent">
              {t.admin.viewAll} →
            </Link>
          </div>

          {inbox.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={t.admin.noMessages} />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {inbox.map((message) => (
                <li key={message.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {message.name}
                    </span>
                    {!message.is_read ? (
                      <Badge tone="accent">{t.admin.messages.unread}</Badge>
                    ) : null}
                    <span className="ml-auto text-xs text-muted">
                      {formatDate(lang, message.created_at, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {message.subject ? (
                    <p className="mt-1 truncate text-sm text-foreground">{message.subject}</p>
                  ) : null}
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
