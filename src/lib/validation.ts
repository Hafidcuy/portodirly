import { z } from "zod";

/** Ubah `zod` error menjadi pemetaan `field -> pesan[]` untuk form. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const output: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (output[key] ??= []).push(issue.message);
  }
  return output;
}

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value))
  .nullable();

const requiredText = (label: string, max = 500) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
  .or(z.literal(""));

const nullableDate = dateField.transform((value) => (value === "" ? null : value));

const boolFromForm = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "on" || value === "true");

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  full_name: requiredText("Full name", 120),
  status_label_en: z.string().trim().max(80).default(""),
  status_label_id: z.string().trim().max(80).default(""),
  kicker_en: z.string().trim().max(160).default(""),
  kicker_id: z.string().trim().max(160).default(""),
  headline_en: z.string().trim().max(200).default(""),
  headline_id: z.string().trim().max(200).default(""),
  tagline_en: z.string().trim().max(400).default(""),
  tagline_id: z.string().trim().max(400).default(""),
  cta_primary_label_en: z.string().trim().max(60).default(""),
  cta_primary_label_id: z.string().trim().max(60).default(""),
  cta_primary_href: z.string().trim().max(300).default("#projects"),
  cta_secondary_label_en: z.string().trim().max(60).default(""),
  cta_secondary_label_id: z.string().trim().max(60).default(""),
  cta_secondary_href: z.string().trim().max(300).default("#contact"),
  avatar_url: optionalUrl,
  about_title_en: z.string().trim().max(200).default(""),
  about_title_id: z.string().trim().max(200).default(""),
  about_body_en: z.string().trim().max(6000).default(""),
  about_body_id: z.string().trim().max(6000).default(""),
  about_photo_url: optionalUrl,
  email: z.string().trim().email("Must be a valid email").or(z.literal("")),
  phone: z.string().trim().max(60).default(""),
  location_en: z.string().trim().max(120).default(""),
  location_id: z.string().trim().max(120).default(""),
  site_title_en: z.string().trim().max(160).default(""),
  site_title_id: z.string().trim().max(160).default(""),
  site_description_en: z.string().trim().max(320).default(""),
  site_description_id: z.string().trim().max(320).default(""),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Keahlian
// ---------------------------------------------------------------------------

export const skillSchema = z.object({
  id: z.string().optional(),
  name_en: requiredText("Name", 80),
  name_id: z.string().trim().max(80).default(""),
  category_en: requiredText("Category", 80),
  category_id: z.string().trim().max(80).default(""),
  icon: z.string().trim().max(40).default("code"),
  level: z.coerce
    .number()
    .int("Must be a whole number")
    .min(0, "Minimum is 0")
    .max(100, "Maximum is 100")
    .default(80),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_visible: boolFromForm.default(true),
});

export type SkillInput = z.infer<typeof skillSchema>;

// ---------------------------------------------------------------------------
// Proyek
// ---------------------------------------------------------------------------

export const projectSchema = z
  .object({
    id: z.string().optional(),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers and hyphens"),
    title_en: requiredText("Title", 140),
    title_id: z.string().trim().max(140).default(""),
    summary_en: z.string().trim().max(300).default(""),
    summary_id: z.string().trim().max(300).default(""),
    description_en: z.string().trim().max(8000).default(""),
    description_id: z.string().trim().max(8000).default(""),
    category_en: requiredText("Category", 80),
    category_id: z.string().trim().max(80).default(""),
    cover_url: optionalUrl,
    tech_tags: z.string().trim().max(600).default(""),
    live_url: optionalUrl,
    repo_url: optionalUrl,
    is_featured: boolFromForm.default(false),
    is_visible: boolFromForm.default(true),
    sort_order: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.live_url || value.repo_url) return;
    ctx.addIssue({
      code: "custom",
      path: ["live_url"],
      message: "Add at least one link (live URL or repository URL)",
    });
  });

export type ProjectInput = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Pengalaman
// ---------------------------------------------------------------------------

export const experienceSchema = z
  .object({
    id: z.string().optional(),
    role_en: requiredText("Role", 120),
    role_id: z.string().trim().max(120).default(""),
    company: requiredText("Company", 120),
    company_url: optionalUrl,
    location_en: z.string().trim().max(120).default(""),
    location_id: z.string().trim().max(120).default(""),
    start_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
    end_date: nullableDate,
    description_en: z.string().trim().max(4000).default(""),
    description_id: z.string().trim().max(4000).default(""),
    sort_order: z.coerce.number().int().min(0).optional(),
    is_visible: boolFromForm.default(true),
  })
  .refine(
    (value) => !value.end_date || value.end_date >= value.start_date,
    { message: "End date must be after the start date", path: ["end_date"] },
  );

export type ExperienceInput = z.infer<typeof experienceSchema>;

// ---------------------------------------------------------------------------
// Pendidikan
// ---------------------------------------------------------------------------

export const educationSchema = z
  .object({
    id: z.string().optional(),
    institution: requiredText("Institution", 140),
    degree_en: z.string().trim().max(140).default(""),
    degree_id: z.string().trim().max(140).default(""),
    field_en: z.string().trim().max(140).default(""),
    field_id: z.string().trim().max(140).default(""),
    location_en: z.string().trim().max(120).default(""),
    location_id: z.string().trim().max(120).default(""),
    start_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
    end_date: nullableDate,
    description_en: z.string().trim().max(4000).default(""),
    description_id: z.string().trim().max(4000).default(""),
    sort_order: z.coerce.number().int().min(0).optional(),
    is_visible: boolFromForm.default(true),
  })
  .refine(
    (value) => !value.end_date || value.end_date >= value.start_date,
    { message: "End date must be after the start date", path: ["end_date"] },
  );

export type EducationInput = z.infer<typeof educationSchema>;

// ---------------------------------------------------------------------------
// Sertifikat
// ---------------------------------------------------------------------------

export const certificateSchema = z
  .object({
    id: z.string().optional(),
    name_en: requiredText("Name", 160),
    name_id: z.string().trim().max(160).default(""),
    issuer_en: requiredText("Issuer", 120),
    issuer_id: z.string().trim().max(120).default(""),
    issued_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Issued date is required"),
    expires_date: nullableDate,
    credential_url: optionalUrl,
    image_url: optionalUrl,
    sort_order: z.coerce.number().int().min(0).optional(),
    is_visible: boolFromForm.default(true),
  })
  .refine(
    (value) => !value.expires_date || value.expires_date >= value.issued_date,
    { message: "Expiry must be after the issue date", path: ["expires_date"] },
  );

export type CertificateInput = z.infer<typeof certificateSchema>;

// ---------------------------------------------------------------------------
// Tautan sosial & pengaturan
// ---------------------------------------------------------------------------

export const socialSchema = z.object({
  id: z.string().optional(),
  label: requiredText("Label", 60),
  url: z.string().trim().url("Must be a valid URL"),
  icon: z.string().trim().max(40).default("link"),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_visible: boolFromForm.default(true),
});

export type SocialInput = z.infer<typeof socialSchema>;

export const settingsSchema = z.object({
  default_theme: z.enum(["system", "light", "dark"]),
});

// ---------------------------------------------------------------------------
// Form kontak publik
// ---------------------------------------------------------------------------

export type ContactMessages = {
  nameRequired: string;
  emailRequired: string;
  subjectRequired: string;
  invalidEmail: string;
  tooShort: string;
  tooLong: string;
};

const defaultContactMessages: ContactMessages = {
  nameRequired: "Name is required",
  emailRequired: "Email is required",
  subjectRequired: "Subject is required",
  invalidEmail: "Enter a valid email",
  tooShort: "Message must be at least 10 characters",
  tooLong: "Message is too long",
};

const trimmedText = (max: number) => z.string().trim().max(max);

/**
 * Buat skema kontak dengan pesan validasi sesuai bahasa tampilan.
 * Skema default memakai pesan Inggris untuk pengujian unit.
 */
export function makeContactSchema(m: ContactMessages = defaultContactMessages) {
  return z.object({
    name: trimmedText(120).min(1, m.nameRequired),
    email: trimmedText(320).min(1, m.emailRequired).email(m.invalidEmail),
    subject: trimmedText(160).min(1, m.subjectRequired),
    body: z
      .string()
      .trim()
      .min(10, m.tooShort)
      .max(5000, m.tooLong),
  });
}

export const contactSchema = makeContactSchema();

export type ContactInput = z.infer<typeof contactSchema>;
