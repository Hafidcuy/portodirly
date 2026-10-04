import Link from "next/link";
import Image from "next/image";

import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminCreateLink, AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { searchValue, type AdminSearch } from "@/components/admin/admin-params";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";
import { DeleteButton } from "@/components/ui/AdminForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteItem } from "@/lib/actions/admin";
import { adminProjects } from "@/lib/data";
import { dict, getLang, pick } from "@/lib/i18n";
import type { ProjectRow } from "@/lib/types";

export const metadata = { title: "Projects · Admin" };

const HREF = "/admin/projects";

/** Daftar proyek + form baru (`?new=1`) / sunting (`?edit=<id>`). */
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearch>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let rows: ProjectRow[];
  try {
    rows = await adminProjects();
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
        title={a.projects.title}
        subtitle={a.projects.subtitle}
        action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
      />

      {showForm ? (
        <FormPanel title={editing ? a.edit : a.create} closeHref={HREF} closeLabel={a.cancel}>
          <ProjectForm lang={lang} project={editing} />
        </FormPanel>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((project) => (
            <li key={project.id} className="card flex flex-wrap items-center gap-4 p-4">
              {project.cover_url ? (
                <Image
                  src={project.cover_url}
                  alt=""
                  width={72}
                  height={48}
                  className="h-12 w-18 shrink-0 rounded-md border border-border object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {pick(lang, { en: project.title_en, id: project.title_id })}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted">
                  /projects/{project.slug}
                  {project.category_en || project.category_id
                    ? ` · ${pick(lang, { en: project.category_en, id: project.category_id })}`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {project.is_featured ? <Badge tone="accent">{a.projects.featured}</Badge> : null}
                <Badge tone={project.is_visible ? "success" : "default"}>
                  {project.is_visible ? a.common.visible : a.common.hidden}
                </Badge>
                <Link
                  href={`/projects/${project.slug}`}
                  className="btn btn-ghost btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  {a.projects.view}
                </Link>
                <Link href={`${HREF}?edit=${project.id}`} className="btn btn-ghost btn-sm">
                  {a.edit}
                </Link>
                <DeleteButton
                  action={deleteItem}
                  fields={{ table: "projects", id: project.id }}
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
          title={a.projects.empty}
          action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
        />
      ) : null}
    </div>
  );
}
