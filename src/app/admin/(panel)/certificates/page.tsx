import Image from "next/image";
import Link from "next/link";

import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminCreateLink, AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { searchValue, type AdminSearch } from "@/components/admin/admin-params";
import { CertificateForm } from "@/components/admin/forms/CertificateForm";
import { DeleteButton } from "@/components/ui/AdminForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteItem } from "@/lib/actions/admin";
import { adminCertificates } from "@/lib/data";
import { dict, formatDate, getLang, pick } from "@/lib/i18n";
import type { CertificateRow } from "@/lib/types";

export const metadata = { title: "Certificates · Admin" };

const HREF = "/admin/certificates";

/** Daftar sertifikat + form baru (`?new=1`) / sunting (`?edit=<id>`). */
export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearch>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let rows: CertificateRow[];
  try {
    rows = await adminCertificates();
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
        title={a.certificates.title}
        subtitle={a.certificates.subtitle}
        action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
      />

      {showForm ? (
        <FormPanel title={editing ? a.edit : a.create} closeHref={HREF} closeLabel={a.cancel}>
          <CertificateForm lang={lang} certificate={editing} />
        </FormPanel>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="card flex flex-wrap items-center gap-4 p-4">
              {row.image_url ? (
                <Image
                  src={row.image_url}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {pick(lang, { en: row.name_en, id: row.name_id })}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {pick(lang, { en: row.issuer_en, id: row.issuer_id })}
                  {" · "}
                  {formatDate(lang, row.issued_date, { month: "short", year: "numeric" })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={row.is_visible ? "success" : "default"}>
                  {row.is_visible ? a.common.visible : a.common.hidden}
                </Badge>
                {row.credential_url ? (
                  <a
                    href={row.credential_url}
                    className="btn btn-ghost btn-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.certificates.credentialUrl}
                  </a>
                ) : null}
                <Link href={`${HREF}?edit=${row.id}`} className="btn btn-ghost btn-sm">
                  {a.edit}
                </Link>
                <DeleteButton
                  action={deleteItem}
                  fields={{ table: "certificates", id: row.id }}
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
          title={a.certificates.empty}
          action={<AdminCreateLink href={`${HREF}?new=1`} label={a.create} />}
        />
      ) : null}
    </div>
  );
}
