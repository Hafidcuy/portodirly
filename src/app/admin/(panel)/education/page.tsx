import Link from "next/link";

import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminCreateLink, AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { searchValue, type AdminSearch } from "@/components/admin/admin-params";
import { EducationForm } from "@/components/admin/forms/EducationForm";
import { DeleteButton } from "@/components/ui/AdminForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteItem } from "@/lib/actions/admin";
import { adminEducations } from "@/lib/data";
import { dict, formatDate, getLang, pick } from "@/lib/i18n";
import type { EducationRow } from "@/lib/types";

export const metadata = { title: "Education · Admin" };

const HREF = "/admin/education";

/** Daftar pendidikan + form baru (`?new=1`) / sunting (`?edit=<id>`). */
export default async function AdminEducationPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearch>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let rows: EducationRow[];
  try {
    rows = await adminEducations();
  } catch (error) {
    return <AdminLoadError t={t} error={error} retryHref={HREF} />;
  }

  const editId = searchValue(sp.edit);
  const editing = editId ? (rows.find((row) => row.id === editId) ?? null) : null;
  const creating = searchValue(sp.new) === "1" && !editing;
  const showForm = creating || editing !== null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker={a.content}
        title={a.education.title}
        subtitle={a.education.subtitle}
        action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
      />

      {showForm ? (
        <FormPanel title={editing ? a.edit : a.create} closeHref={HREF} closeLabel={a.cancel}>
          <EducationForm lang={lang} education={editing} />
        </FormPanel>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{row.institution}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {pick(lang, { en: row.degree_en, id: row.degree_id })}
                  {row.field_en || row.field_id
                    ? ` · ${pick(lang, { en: row.field_en, id: row.field_id })}`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">
                  {formatDate(lang, row.start_date)} –{" "}
                  {row.end_date ? formatDate(lang, row.end_date) : a.common.none}
                </Badge>
                <Badge tone={row.is_visible ? "success" : "default"}>
                  {row.is_visible ? a.common.visible : a.common.hidden}
                </Badge>
                <Link href={`${HREF}?edit=${row.id}`} className="btn btn-ghost btn-sm">
                  {a.edit}
                </Link>
                <DeleteButton
                  action={deleteItem}
                  fields={{ table: "educations", id: row.id }}
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

      {rows.length === 0 && !showForm ? (
        <EmptyState
          title={a.education.empty}
          action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
        />
      ) : null}
    </div>
  );
}
