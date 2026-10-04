"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { SelectField } from "@/components/ui/FormField";
import { saveSettings } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { SettingsRow } from "@/lib/types";

type Props = {
  lang: Lang;
  settings: SettingsRow;
};

/**
 * Form pengaturan singleton (id = 1): tema bawaan untuk pengunjung baru.
 *
 * Tautan sosial dikelola terpisah lewat `SocialForm` di halaman yang sama.
 */
export function SettingsForm({ lang, settings }: Props) {
  const t = dict(lang);
  const a = t.admin;

  return (
    <AdminForm
      action={saveSettings}
      submitLabel={a.save}
      pendingLabel={a.saving}
      errorFallback={a.validationError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="default_theme"
          label={a.settings.defaultTheme}
          hint={a.settings.defaultThemeHint}
          defaultValue={settings.default_theme}
          options={[
            { value: "system", label: t.nav.system },
            { value: "light", label: t.nav.light },
            { value: "dark", label: t.nav.dark },
          ]}
        />
      </div>
    </AdminForm>
  );
}
