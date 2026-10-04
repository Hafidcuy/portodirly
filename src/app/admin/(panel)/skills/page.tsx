import Link from "next/link";

import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminCreateLink, AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { searchValue, type AdminSearch } from "@/components/admin/admin-params";
import { SkillForm } from "@/components/admin/forms/SkillForm";
import { DeleteButton } from "@/components/ui/AdminForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteItem } from "@/lib/actions/admin";
import { adminSkills } from "@/lib/data";
import { dict, getLang, pick } from "@/lib/i18n";
import type { SkillRow } from "@/lib/types";

export const metadata = { title: "Skills · Admin" };

const HREF = "/admin/skills";

/** Daftar keahlian + form baru (`?new=1`) / sunting (`?edit=<id>`). */
export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearch>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let rows: SkillRow[];
  try {
    rows = await adminSkills();
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
        title={a.skills.title}
        subtitle={a.skills.subtitle}
        action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
      />

      {showForm ? (
        <FormPanel title={editing ? a.edit : a.create} closeHref={HREF} closeLabel={a.cancel}>
          <SkillForm lang={lang} skill={editing} />
        </FormPanel>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((skill) => (
            <li key={skill.id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {pick(lang, { en: skill.name_en, id: skill.name_id })}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {pick(lang, { en: skill.category_en, id: skill.category_id })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">
                  {a.skills.level} {skill.level}
                </Badge>
                <Badge tone={skill.is_visible ? "success" : "default"}>
                  {skill.is_visible ? a.common.visible : a.common.hidden}
                </Badge>
                <Link href={`${HREF}?edit=${skill.id}`} className="btn btn-ghost btn-sm">
                  {a.edit}
                </Link>
                <DeleteButton
                  action={deleteItem}
                  fields={{ table: "skills", id: skill.id }}
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
          title={a.skills.empty}
          action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
        />
      ) : null}
    </div>
  );
}
