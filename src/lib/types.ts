import type { Bilingual } from "@/lib/i18n";

/** Baris tabel `profiles` (selalu satu baris, id = 1). */
export type ProfileRow = {
  id: number;
  full_name: string;
  status_label_en: string;
  status_label_id: string;
  kicker_en: string;
  kicker_id: string;
  headline_en: string;
  headline_id: string;
  tagline_en: string;
  tagline_id: string;
  cta_primary_label_en: string;
  cta_primary_label_id: string;
  cta_primary_href: string;
  cta_secondary_label_en: string;
  cta_secondary_label_id: string;
  cta_secondary_href: string;
  avatar_url: string | null;
  about_title_en: string;
  about_title_id: string;
  about_body_en: string;
  about_body_id: string;
  about_photo_url: string | null;
  email: string;
  phone: string;
  location_en: string;
  location_id: string;
  site_title_en: string;
  site_title_id: string;
  site_description_en: string;
  site_description_id: string;
  created_at: string;
  updated_at: string;
};

/** Tampilan publik profil: kolom `_en`/`_id` sudah dipadukan. */
export type Profile = {
  fullName: string;
  statusLabel: string;
  kicker: string;
  headline: string;
  tagline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  avatarUrl: string | null;
  about: { title: string; body: string; photoUrl: string | null };
  contact: { email: string; phone: string; location: string };
  seo: { title: string; description: string };
};

export type SettingsRow = {
  id: number;
  default_theme: "system" | "light" | "dark";
  updated_at: string;
};

export type SocialLinkRow = {
  id: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type SkillRow = {
  id: string;
  name_en: string;
  name_id: string;
  category_en: string;
  category_id: string;
  icon: string;
  level: number;
  sort_order: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title_en: string;
  title_id: string;
  summary_en: string;
  summary_id: string;
  description_en: string;
  description_id: string;
  category_en: string;
  category_id: string;
  cover_url: string | null;
  tech_tags: string[];
  live_url: string | null;
  repo_url: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceRow = {
  id: string;
  role_en: string;
  role_id: string;
  company: string;
  company_url: string | null;
  location_en: string;
  location_id: string;
  start_date: string;
  end_date: string | null;
  description_en: string;
  description_id: string;
  sort_order: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type EducationRow = {
  id: string;
  institution: string;
  degree_en: string;
  degree_id: string;
  field_en: string;
  field_id: string;
  location_en: string;
  location_id: string;
  start_date: string;
  end_date: string | null;
  description_en: string;
  description_id: string;
  sort_order: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type CertificateRow = {
  id: string;
  name_en: string;
  name_id: string;
  issuer_en: string;
  issuer_id: string;
  issued_date: string;
  expires_date: string | null;
  credential_url: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Tampilan publik (sudah memilih bahasa)
// ---------------------------------------------------------------------------

export type PublicSkill = {
  id: string;
  name: string;
  category: string;
  icon: string;
  level: number;
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  coverUrl: string | null;
  techTags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
};

export type PublicExperience = {
  id: string;
  role: string;
  company: string;
  companyUrl: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
};

export type PublicEducation = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
};

export type PublicCertificate = {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiresDate: string | null;
  credentialUrl: string | null;
  imageUrl: string | null;
};

export type PublicSocial = { id: string; label: string; url: string; icon: string };

export type PublicSite = {
  profile: Profile | null;
  defaultTheme: "system" | "light" | "dark";
  socials: PublicSocial[];
  skills: PublicSkill[];
  projects: PublicProject[];
  experiences: PublicExperience[];
  educations: PublicEducation[];
  certificates: PublicCertificate[];
};

export type { Bilingual };
