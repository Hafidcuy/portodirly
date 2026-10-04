import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { MessageActions } from "@/components/admin/forms/MessageActions";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { adminMessages } from "@/lib/data";
import { dict, formatDate, getLang } from "@/lib/i18n";
import type { MessageRow } from "@/lib/types";

export const metadata = { title: "Messages · Admin" };

const HREF = "/admin/messages";

/** Pesan dari formulir kontak — tanpa form buat/hapus, hanya baca + aksi. */
export default async function AdminMessagesPage() {
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let rows: MessageRow[];
  try {
    rows = await adminMessages();
  } catch (error) {
    return <AdminLoadError t={t} error={error} retryHref={HREF} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker={a.messagesLabel}
        title={a.messages.title}
        subtitle={a.messages.subtitle}
      />

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="card flex flex-wrap items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{row.subject}</p>
                  <Badge tone={row.is_read ? "default" : "accent"}>
                    {row.is_read ? a.messages.read : a.messages.unread}
                  </Badge>
                </div>

                <p className="mt-1 text-sm text-muted">
                  {a.messages.from}: {row.name} &lt;{row.email}&gt;
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {a.messages.received}: {formatDate(lang, row.created_at, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {row.body}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <MessageActions lang={lang} message={row} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={a.messages.empty} />
      )}
    </div>
  );
}
