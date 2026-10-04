"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, CheckField, TextField } from "@/components/ui/FormField";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveEducation } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { EducationRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk pendidikan baru. */
  education: EducationRow | null;
};

/** Form pendidikan: institusi, gelar, bidang studi, lokasi, tanggal, uraian. */
export function EducationForm({ lang, education }: Props) {
  const t = dict(lang);
  const a = t.admin;

  return (
    <LangTabProvider labels={a.tabs}>
      <AdminForm
        action={saveEducation}
        submitLabel={education ? a.save : a.saveNew}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
        resetOnSuccess={!education}
      >
        {education ? <input type="hidden" name="id" value={education.id} /> : null}

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="institution"
              label={a.education.institution}
              required
              defaultValue={education?.institution ?? ""}
            />
            <BiField
              base="degree"
              label={a.education.degree}
              values={
                education ? { en: education.degree_en, id: education.degree_id } : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BiField
              base="field"
              label={a.education.field}
              values={
                education ? { en: education.field_en, id: education.field_id } : undefined
              }
            />
            <BiField
              base="location"
              label={a.education.location}
              values={
                education
                  ? { en: education.location_en, id: education.location_id }
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="start_date"
              label={a.education.startDate}
              type="date"
              required
              defaultValue={education?.start_date ?? ""}
            />
            <TextField
              name="end_date"
              label={a.education.endDate}
              hint={a.experience.endDateHint}
              type="date"
              defaultValue={education?.end_date ?? ""}
            />
          </div>

          <BiField
            base="description"
            label={a.education.description}
            control="textarea"
            rows={5}
            values={
              education
                ? { en: education.description_en, id: education.description_id }
                : undefined
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="sort_order"
              label={a.common.sortOrder}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={education?.sort_order == null ? "" : String(education.sort_order)}
            />
            <div className="flex items-end pb-2">
              <CheckField
                name="is_visible"
                label={a.common.visible}
                defaultChecked={education ? education.is_visible : true}
              />
            </div>
          </div>
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
