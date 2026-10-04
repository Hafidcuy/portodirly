"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, CheckField, TextField } from "@/components/ui/FormField";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveCertificate } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { CertificateRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk sertifikat baru. */
  certificate: CertificateRow | null;
};

/** Form sertifikat: nama, penerbit, tanggal, tautan kredensial, gambar. */
export function CertificateForm({ lang, certificate }: Props) {
  const t = dict(lang);
  const a = t.admin;
  const images = a.images;

  const uploadLabels = {
    upload: images.upload,
    uploading: images.uploading,
    remove: images.remove,
  };

  return (
    <LangTabProvider labels={a.tabs}>
      <AdminForm
        action={saveCertificate}
        submitLabel={certificate ? a.save : a.saveNew}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
        resetOnSuccess={!certificate}
      >
        {certificate ? <input type="hidden" name="id" value={certificate.id} /> : null}

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <BiField
              base="name"
              label={a.certificates.name}
              required
              values={
                certificate
                  ? { en: certificate.name_en, id: certificate.name_id }
                  : undefined
              }
            />
            <BiField
              base="issuer"
              label={a.certificates.issuer}
              required
              values={
                certificate
                  ? { en: certificate.issuer_en, id: certificate.issuer_id }
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="issued_date"
              label={a.certificates.issuedDate}
              type="date"
              required
              defaultValue={certificate?.issued_date ?? ""}
            />
            <TextField
              name="expires_date"
              label={a.certificates.expiresDate}
              hint={a.common.optional}
              type="date"
              defaultValue={certificate?.expires_date ?? ""}
            />
          </div>

          <TextField
            name="credential_url"
            label={a.certificates.credentialUrl}
            type="url"
            inputMode="url"
            placeholder="https://example.com/verify"
            defaultValue={certificate?.credential_url ?? ""}
          />

          <ImageUpload
            name="image_url"
            value={certificate?.image_url ?? null}
            folder="certificates"
            label={a.certificates.image}
            hint={images.dropHint}
            previewClassName="h-32 w-56"
            labels={uploadLabels}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="sort_order"
              label={a.common.sortOrder}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={certificate?.sort_order == null ? "" : String(certificate.sort_order)}
            />
            <div className="flex items-end pb-2">
              <CheckField
                name="is_visible"
                label={a.common.visible}
                defaultChecked={certificate ? certificate.is_visible : true}
              />
            </div>
          </div>
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
