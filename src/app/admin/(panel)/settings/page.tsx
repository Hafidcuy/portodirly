import Link from "next/link";

import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminCreateLink, AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { searchValue, type AdminSearch } from "@/components/admin/admin-params";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { SocialForm } from "@/components/admin/forms/SocialForm";
import { DeleteButton } from "@/components/ui/AdminForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteItem } from "@/lib/actions/admin";
import { adminSettings, adminSocials } from "@/lib/data";
import { dict, getLang } from "@/lib/i18n";
import type { SettingsRow, SocialLinkRow } from "@/lib/types";

export const metadata = { title: "Settings · Admin" };

const HREF = "/admin/settings";

/**
 * Pengaturan singleton (tema bawaan) plus daftar tautan sosial, yang
 * ditambah/disunting lewat `?new=1` / `?edit=<id>`.
 */
export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearch>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let settings: SettingsRow;
  let socials: SocialLinkRow[];

  try {
    [settings, socials] = await Promise.all([adminSettings(), adminSocials()]);
  } catch (error) {
    return <AdminLoadError t={t} error={error} retryHref={HREF} />;
  }

  const editId = searchValue(sp.edit);
  const editing = editId ? (socials.find((row) => row.id === editId) ?? null) : null;
  const creating = searchValue(sp.new) === "1" && !editing;
  const showForm = creating || editing !== null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        kicker={a.settingsLabel}
        title={a.settings.title}
        subtitle={a.settings.subtitle}
      />

      <FormPanel title={a.settings.defaultTheme}>
        <SettingsForm lang={lang} settings={settings} />
      </FormPanel>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{a.settings.socials}</h2>
            <p className="mt-1 text-sm text-muted">{a.settings.socialsHint}</p>
          </div>
          <AdminCreateLink href={`${HREF}?new=1`} label={a.settings.addSocial} />
        </div>

        {showForm ? (
          <FormPanel
            title={editing ? a.edit : a.settings.addSocial}
            closeHref={HREF}
            closeLabel={a.cancel}
          >
            <SocialForm lang={lang} social={editing} />
          </FormPanel>
        ) : null}

        {socials.length > 0 ? (
          <ul className="space-y-3">
            {socials.map((row) => (
              <li key={row.id} className="card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{row.label}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">{row.url}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{row.icon}</Badge>
                  <Badge tone={row.is_visible ? "success" : "default"}>
                    {row.is_visible ? a.common.visible : a.common.hidden}
                  </Badge>
                  <Link href={`${HREF}?edit=${row.id}`} className="btn btn-ghost btn-sm">
                    {a.edit}
                  </Link>
                  <DeleteButton
                    action={deleteItem}
                    fields={{ table: "social_links", id: row.id }}
                    label={a.delete}
                    title={a.confirmDeleteTitle}
                    body={a.confirmDeleteBody}
                    confirmLabel={a.delete}
                    cancelLabel={a.cancel}
                    pendingLabel={a.deleting}
                    errorFallback={a.error}
                    className="text-danger"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {socials.length === 0 && !showForm ? (
          <EmptyState
            title={a.settings.noSocials}
            action={<AdminCreateLink href={`${HREF}?new=1`} label={a.settings.addSocial} />}
          />
        ) : null}
      </section>
    </div>
  );
}
