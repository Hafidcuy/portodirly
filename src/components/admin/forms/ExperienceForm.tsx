"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, CheckField, TextField } from "@/components/ui/FormField";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveExperience } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { ExperienceRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk pengalaman baru. */
  experience: ExperienceRow | null;
};

/** Form pengalaman kerja: peran, perusahaan, lokasi, tanggal, uraian. */
export function ExperienceForm({ lang, experience }: Props) {
  const t = dict(lang);
  const a = t.admin;

  return (
    <LangTabProvider labels={a.tabs}>
      <AdminForm
        action={saveExperience}
        submitLabel={experience ? a.save : a.saveNew}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
        resetOnSuccess={!experience}
      >
        {experience ? <input type="hidden" name="id" value={experience.id} /> : null}

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <BiField
              base="role"
              label={a.experience.role}
              required
              values={
                experience ? { en: experience.role_en, id: experience.role_id } : undefined
              }
            />
            <TextField
              name="company"
              label={a.experience.company}
              required
              defaultValue={experience?.company ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="company_url"
              label={a.experience.companyUrl}
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              defaultValue={experience?.company_url ?? ""}
            />
            <BiField
              base="location"
              label={a.experience.location}
              values={
                experience
                  ? { en: experience.location_en, id: experience.location_id }
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="start_date"
              label={a.experience.startDate}
              type="date"
              required
              defaultValue={experience?.start_date ?? ""}
            />
            <TextField
              name="end_date"
              label={a.experience.endDate}
              hint={a.experience.endDateHint}
              type="date"
              defaultValue={experience?.end_date ?? ""}
            />
          </div>

          <BiField
            base="description"
            label={a.experience.description}
            control="textarea"
            rows={5}
            values={
              experience
                ? { en: experience.description_en, id: experience.description_id }
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
              defaultValue={experience?.sort_order == null ? "" : String(experience.sort_order)}
            />
            <div className="flex items-end pb-2">
              <CheckField
                name="is_visible"
                label={a.common.visible}
                defaultChecked={experience ? experience.is_visible : true}
              />
            </div>
          </div>
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
