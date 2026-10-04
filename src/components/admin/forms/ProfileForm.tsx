"use client";

import { FormSectionTitle } from "@/components/admin/AdminPage";
import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, TextField } from "@/components/ui/FormField";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveProfile } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { ProfileRow } from "@/lib/types";

type Props = {
  lang: Lang;
  profile: ProfileRow;
};

/**
 * Form profil singleton (id = 1): identitas, hero, tentang, kontak, dan SEO.
 * Semua isian teks memakai pasangan `_en`/`_id` lewat `BiField`.
 */
export function ProfileForm({ lang, profile }: Props) {
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
        action={saveProfile}
        submitLabel={a.save}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
      >
        <FormSectionTitle>{a.profile.identity}</FormSectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="full_name"
            label={a.profile.fullName}
            defaultValue={profile.full_name}
            autoComplete="name"
            required
          />
          <ImageUpload
            name="avatar_url"
            value={profile.avatar_url}
            folder="profiles"
            label={a.profile.avatar}
            hint={images.dropHint}
            labels={uploadLabels}
          />
        </div>

        <FormSectionTitle>{a.profile.hero}</FormSectionTitle>

        <div className="grid gap-4">
          <BiField
            base="status_label"
            label={a.profile.statusLabel}
            values={{ en: profile.status_label_en, id: profile.status_label_id }}
          />
          <BiField
            base="kicker"
            label={a.profile.kicker}
            values={{ en: profile.kicker_en, id: profile.kicker_id }}
          />
          <BiField
            base="headline"
            label={a.profile.headline}
            values={{ en: profile.headline_en, id: profile.headline_id }}
          />
          <BiField
            base="tagline"
            label={a.profile.tagline}
            control="textarea"
            rows={3}
            values={{ en: profile.tagline_en, id: profile.tagline_id }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <BiField
              base="cta_primary_label"
              label={a.profile.ctaPrimaryLabel}
              values={{ en: profile.cta_primary_label_en, id: profile.cta_primary_label_id }}
            />
            <TextField
              name="cta_primary_href"
              label={a.profile.ctaPrimaryHref}
              defaultValue={profile.cta_primary_href}
            />
            <BiField
              base="cta_secondary_label"
              label={a.profile.ctaSecondaryLabel}
              values={{
                en: profile.cta_secondary_label_en,
                id: profile.cta_secondary_label_id,
              }}
            />
            <TextField
              name="cta_secondary_href"
              label={a.profile.ctaSecondaryHref}
              defaultValue={profile.cta_secondary_href}
            />
          </div>
        </div>

        <FormSectionTitle>{a.profile.about}</FormSectionTitle>

        <div className="grid gap-4">
          <BiField
            base="about_title"
            label={a.profile.aboutTitle}
            values={{ en: profile.about_title_en, id: profile.about_title_id }}
          />
          <BiField
            base="about_body"
            label={a.profile.aboutBody}
            control="textarea"
            rows={7}
            values={{ en: profile.about_body_en, id: profile.about_body_id }}
          />
          <ImageUpload
            name="about_photo_url"
            value={profile.about_photo_url}
            folder="profiles"
            label={a.profile.aboutPhoto}
            hint={images.dropHint}
            previewClassName="h-28 w-40"
            labels={uploadLabels}
          />
        </div>

        <FormSectionTitle>{a.profile.contact}</FormSectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="email"
            label={a.profile.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={profile.email}
          />
          <TextField
            name="phone"
            label={a.profile.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={profile.phone}
          />
          <BiField
            base="location"
            label={a.profile.location}
            values={{ en: profile.location_en, id: profile.location_id }}
          />
        </div>

        <FormSectionTitle>{a.profile.seo}</FormSectionTitle>

        <div className="grid gap-4">
          <BiField
            base="site_title"
            label={a.profile.siteTitle}
            values={{ en: profile.site_title_en, id: profile.site_title_id }}
          />
          <BiField
            base="site_description"
            label={a.profile.siteDescription}
            control="textarea"
            rows={3}
            values={{ en: profile.site_description_en, id: profile.site_description_id }}
          />
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
