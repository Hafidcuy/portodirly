import "server-only";

import { cache } from "react";

import { NotConfiguredError, supabaseConfigured } from "@/lib/env";
import { pick, type Lang } from "@/lib/i18n";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  CertificateRow,
  EducationRow,
  ExperienceRow,
  MessageRow,
  Profile,
  ProfileRow,
  ProjectRow,
  PublicCertificate,
  PublicEducation,
  PublicExperience,
  PublicProject,
  PublicSite,
  PublicSkill,
  SettingsRow,
  SkillRow,
  SocialLinkRow,
} from "@/lib/types";

export type LoadFailure = "not-configured" | "failed";

export type LoadResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: LoadFailure };

/** Data minimal yang dibutuhkan root layout (metadata + anti-flash tema). */
export type SiteShell = {
  seo: { title: string; description: string };
  defaultTheme: "system" | "light" | "dark";
};

function failure(): LoadFailure {
  return supabaseConfigured() ? "failed" : "not-configured";
}

// ---------------------------------------------------------------------------
// Publik
// ---------------------------------------------------------------------------

function toProfile(row: ProfileRow | null, lang: Lang): Profile | null {
  if (!row) return null;
  return {
    fullName: row.full_name,
    statusLabel: pick(lang, { en: row.status_label_en, id: row.status_label_id }),
    kicker: pick(lang, { en: row.kicker_en, id: row.kicker_id }),
    headline: pick(lang, { en: row.headline_en, id: row.headline_id }),
    tagline: pick(lang, { en: row.tagline_en, id: row.tagline_id }),
    ctaPrimary: {
      label: pick(lang, { en: row.cta_primary_label_en, id: row.cta_primary_label_id }),
      href: row.cta_primary_href || "#projects",
    },
    ctaSecondary: {
      label: pick(lang, { en: row.cta_secondary_label_en, id: row.cta_secondary_label_id }),
      href: row.cta_secondary_href || "#contact",
    },
    avatarUrl: row.avatar_url,
    about: {
      title: pick(lang, { en: row.about_title_en, id: row.about_title_id }),
      body: pick(lang, { en: row.about_body_en, id: row.about_body_id }),
      photoUrl: row.about_photo_url,
    },
    contact: {
      email: row.email,
      phone: row.phone,
      location: pick(lang, { en: row.location_en, id: row.location_id }),
    },
    seo: {
      title: pick(lang, { en: row.site_title_en, id: row.site_title_id }),
      description: pick(lang, { en: row.site_description_en, id: row.site_description_id }),
    },
  };
}

/**
 * Muat data ringkas untuk root layout: judul/deskripsi SEO dan tema default.
 * Dibungkus `cache()` React supaya `generateMetadata` dan layout berbagi
 * satu panggilan dalam request yang sama.
 */
export const loadShell = cache(
  async (lang: Lang): Promise<LoadResult<SiteShell>> => {
    if (!supabaseConfigured()) return { ok: false, reason: "not-configured" };

    try {
      const db = supabaseAdmin();
      const [profile, settings] = await Promise.all([
        db.from("profiles").select("*").eq("id", 1).maybeSingle(),
        db.from("settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      if (profile.error ?? settings.error) return { ok: false, reason: failure() };

      const row = (profile.data ?? null) as ProfileRow | null;
      return {
        ok: true,
        data: {
          seo: {
            title: row
              ? pick(lang, { en: row.site_title_en, id: row.site_title_id })
              : "Portfolio",
            description: row
              ? pick(lang, { en: row.site_description_en, id: row.site_description_id })
              : "",
          },
          defaultTheme:
            ((settings.data ?? null) as SettingsRow | null)?.default_theme ?? "system",
        },
      };
    } catch (error) {
      if (error instanceof NotConfiguredError) return { ok: false, reason: "not-configured" };
      return { ok: false, reason: failure() };
    }
  },
);

/**
 * Muat seluruh konten publik dalam satu panggilan paralel.
 * Data tidak di-cache di level framework — `revalidatePath` dipakai setelah
 * admin menyimpan perubahan.
 */
export async function loadPublicSite(lang: Lang): Promise<LoadResult<PublicSite>> {
  if (!supabaseConfigured()) return { ok: false, reason: "not-configured" };

  try {
    const db = supabaseAdmin();

    const [profile, settings, socials, skills, projects, experiences, educations, certificates] =
      await Promise.all([
        db.from("profiles").select("*").eq("id", 1).maybeSingle(),
        db.from("settings").select("*").eq("id", 1).maybeSingle(),
        db.from("social_links").select("*").eq("is_visible", true).order("sort_order"),
        db.from("skills").select("*").eq("is_visible", true).order("sort_order"),
        db.from("projects").select("*").eq("is_visible", true).order("sort_order"),
        db.from("experiences").select("*").eq("is_visible", true).order("start_date", { ascending: false }),
        db.from("educations").select("*").eq("is_visible", true).order("start_date", { ascending: false }),
        db.from("certificates").select("*").eq("is_visible", true).order("issued_date", { ascending: false }),
      ]);

    const firstError =
      profile.error ?? settings.error ?? socials.error ?? skills.error ??
      projects.error ?? experiences.error ?? educations.error ?? certificates.error;
    if (firstError) return { ok: false, reason: failure() };

    const skillRows = (skills.data ?? []) as SkillRow[];
    const projectRows = (projects.data ?? []) as ProjectRow[];
    const experienceRows = (experiences.data ?? []) as ExperienceRow[];
    const educationRows = (educations.data ?? []) as EducationRow[];
    const certificateRows = (certificates.data ?? []) as CertificateRow[];
    const socialRows = (socials.data ?? []) as SocialLinkRow[];

    const site: PublicSite = {
      profile: toProfile((profile.data ?? null) as ProfileRow | null, lang),
      defaultTheme: ((settings.data ?? null) as SettingsRow | null)?.default_theme ?? "system",
      socials: socialRows.map((row) => ({
        id: row.id,
        label: row.label,
        url: row.url,
        icon: row.icon,
      })),
      skills: skillRows.map((row): PublicSkill => ({
        id: row.id,
        name: pick(lang, { en: row.name_en, id: row.name_id }),
        category: pick(lang, { en: row.category_en, id: row.category_id }),
        icon: row.icon,
        level: row.level,
      })),
      projects: projectRows.map((row): PublicProject => ({
        id: row.id,
        slug: row.slug,
        title: pick(lang, { en: row.title_en, id: row.title_id }),
        summary: pick(lang, { en: row.summary_en, id: row.summary_id }),
        description: pick(lang, { en: row.description_en, id: row.description_id }),
        category: pick(lang, { en: row.category_en, id: row.category_id }),
        coverUrl: row.cover_url,
        techTags: row.tech_tags ?? [],
        liveUrl: row.live_url,
        repoUrl: row.repo_url,
        isFeatured: row.is_featured,
        createdAt: row.created_at,
      })),
      experiences: experienceRows.map((row): PublicExperience => ({
        id: row.id,
        role: pick(lang, { en: row.role_en, id: row.role_id }),
        company: row.company,
        companyUrl: row.company_url,
        location: pick(lang, { en: row.location_en, id: row.location_id }),
        startDate: row.start_date,
        endDate: row.end_date,
        description: pick(lang, { en: row.description_en, id: row.description_id }),
      })),
      educations: educationRows.map((row): PublicEducation => ({
        id: row.id,
        institution: row.institution,
        degree: pick(lang, { en: row.degree_en, id: row.degree_id }),
        field: pick(lang, { en: row.field_en, id: row.field_id }),
        location: pick(lang, { en: row.location_en, id: row.location_id }),
        startDate: row.start_date,
        endDate: row.end_date,
        description: pick(lang, { en: row.description_en, id: row.description_id }),
      })),
      certificates: certificateRows.map((row): PublicCertificate => ({
        id: row.id,
        name: pick(lang, { en: row.name_en, id: row.name_id }),
        issuer: pick(lang, { en: row.issuer_en, id: row.issuer_id }),
        issuedDate: row.issued_date,
        expiresDate: row.expires_date,
        credentialUrl: row.credential_url,
        imageUrl: row.image_url,
      })),
    };

    return { ok: true, data: site };
  } catch (error) {
    if (error instanceof NotConfiguredError) return { ok: false, reason: "not-configured" };
    return { ok: false, reason: failure() };
  }
}

/** Detail satu proyek berdasarkan slug (untuk `/projects/[slug]`). */
export async function loadProject(
  slug: string,
  lang: Lang,
): Promise<LoadResult<PublicProject | null>> {
  if (!supabaseConfigured()) return { ok: false, reason: "not-configured" };

  try {
    const { data, error } = await supabaseAdmin()
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();

    if (error) return { ok: false, reason: failure() };
    const row = data as ProjectRow | null;
    if (!row) return { ok: true, data: null };

    return {
      ok: true,
      data: {
        id: row.id,
        slug: row.slug,
        title: pick(lang, { en: row.title_en, id: row.title_id }),
        summary: pick(lang, { en: row.summary_en, id: row.summary_id }),
        description: pick(lang, { en: row.description_en, id: row.description_id }),
        category: pick(lang, { en: row.category_en, id: row.category_id }),
        coverUrl: row.cover_url,
        techTags: row.tech_tags ?? [],
        liveUrl: row.live_url,
        repoUrl: row.repo_url,
        isFeatured: row.is_featured,
        createdAt: row.created_at,
      },
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) return { ok: false, reason: "not-configured" };
    return { ok: false, reason: failure() };
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function adminProfile(): Promise<ProfileRow> {
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as ProfileRow;
  throw new Error("Baris profil belum ada. Jalankan supabase/schema.sql.");
}

export async function adminSettings(): Promise<SettingsRow> {
  const { data, error } = await supabaseAdmin()
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as SettingsRow;
  throw new Error("Baris pengaturan belum ada. Jalankan supabase/schema.sql.");
}

export async function adminSocials(): Promise<SocialLinkRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("social_links")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as SocialLinkRow[];
}

export async function adminSkills(): Promise<SkillRow[]> {
  const { data, error } = await supabaseAdmin().from("skills").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as SkillRow[];
}

export async function adminProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabaseAdmin().from("projects").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as ProjectRow[];
}

export async function adminExperiences(): Promise<ExperienceRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("experiences")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ExperienceRow[];
}

export async function adminEducations(): Promise<EducationRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("educations")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EducationRow[];
}

export async function adminCertificates(): Promise<CertificateRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("certificates")
    .select("*")
    .order("issued_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CertificateRow[];
}

export async function adminMessages(): Promise<MessageRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as MessageRow[];
}

export type DashboardStats = {
  projects: number;
  skills: number;
  certificates: number;
  messages: number;
  unread: number;
};

export async function adminStats(): Promise<DashboardStats> {
  const db = supabaseAdmin();
  const [projects, skills, certificates, messages, unread] = await Promise.all([
    db.from("projects").select("id", { count: "exact", head: true }),
    db.from("skills").select("id", { count: "exact", head: true }),
    db.from("certificates").select("id", { count: "exact", head: true }),
    db.from("messages").select("id", { count: "exact", head: true }),
    db.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  const first = projects.error ?? skills.error ?? certificates.error ?? messages.error ?? unread.error;
  if (first) throw new Error(first.message);

  return {
    projects: projects.count ?? 0,
    skills: skills.count ?? 0,
    certificates: certificates.count ?? 0,
    messages: messages.count ?? 0,
    unread: unread.count ?? 0,
  };
}
