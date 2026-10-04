"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, CheckField, TextField } from "@/components/ui/FormField";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveSkill } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { SkillRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk item baru. */
  skill: SkillRow | null;
};

/** Form keahlian: nama + kategori bilingual, level, urutan, visibilitas. */
export function SkillForm({ lang, skill }: Props) {
  const t = dict(lang);
  const a = t.admin;

  return (
    <LangTabProvider labels={a.tabs}>
      <AdminForm
        action={saveSkill}
        submitLabel={skill ? a.save : a.saveNew}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
        resetOnSuccess={!skill}
      >
        {skill ? <input type="hidden" name="id" value={skill.id} /> : null}

        <div className="grid gap-4">
          <BiField
            base="name"
            label={a.skills.name}
            required
            values={skill ? { en: skill.name_en, id: skill.name_id } : undefined}
          />
          <BiField
            base="category"
            label={a.skills.category}
            required
            values={skill ? { en: skill.category_en, id: skill.category_id } : undefined}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              name="icon"
              label={a.skills.icon}
              placeholder="code"
              defaultValue={skill?.icon ?? "code"}
            />
            <TextField
              name="level"
              label={a.skills.level}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              defaultValue={String(skill?.level ?? 80)}
            />
            <TextField
              name="sort_order"
              label={a.common.sortOrder}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={skill?.sort_order == null ? "" : String(skill.sort_order)}
            />
          </div>

          <CheckField
            name="is_visible"
            label={a.common.visible}
            defaultChecked={skill ? skill.is_visible : true}
          />
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
