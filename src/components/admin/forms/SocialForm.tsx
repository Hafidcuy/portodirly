"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { CheckField, TextField } from "@/components/ui/FormField";
import { saveSocial } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { SocialLinkRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk tautan baru. */
  social: SocialLinkRow | null;
};

/** Form tautan sosial: label, URL, ikon, urutan, visibilitas. */
export function SocialForm({ lang, social }: Props) {
  const t = dict(lang);
  const a = t.admin;

  return (
    <AdminForm
      action={saveSocial}
      submitLabel={social ? a.save : a.settings.addSocial}
      pendingLabel={a.saving}
      errorFallback={a.validationError}
      resetOnSuccess={!social}
    >
      {social ? <input type="hidden" name="id" value={social.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="label"
          label={a.settings.label}
          required
          defaultValue={social?.label ?? ""}
        />
        <TextField
          name="url"
          label={a.settings.url}
          type="url"
          inputMode="url"
          required
          placeholder="https://github.com/you"
          defaultValue={social?.url ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          name="icon"
          label={a.settings.icon}
          hint={a.settings.iconHint}
          defaultValue={social?.icon ?? "link"}
        />
        <TextField
          name="sort_order"
          label={a.common.sortOrder}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={social?.sort_order == null ? "" : String(social.sort_order)}
        />
        <div className="flex items-end pb-2">
          <CheckField
            name="is_visible"
            label={a.common.visible}
            defaultChecked={social ? social.is_visible : true}
          />
        </div>
      </div>
    </AdminForm>
  );
}
