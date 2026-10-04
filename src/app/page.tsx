import Image from "next/image";

import { ContactForm } from "@/components/site/ContactForm";
import { Navbar, type NavItem } from "@/components/site/Navbar";
import { ProjectFilter } from "@/components/site/ProjectFilter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SetupNotice } from "@/components/site/SetupNotice";
import { SkillBars } from "@/components/site/SkillBars";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SocialLinks } from "@/components/site/SocialLinks";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { missingSupabaseEnv } from "@/lib/env";
import { formatDate, formatDateRange, dict, getLang } from "@/lib/i18n";
import { loadPublicSite } from "@/lib/data";

/**
 * Halaman publik: satu halaman, sembilan section, seluruh datanya dari
 * Supabase dan seluruh labelnya dari kamus sesuai cookie `lang`.
 */
export default async function HomePage() {
  const lang = await getLang();
  const t = dict(lang);
  const result = await loadPublicSite(lang);

  if (!result.ok) {
    return <SetupNotice reason={result.reason} missing={missingSupabaseEnv()} t={t} />;
  }

  const site = result.data;
  const profile = site.profile;
  const brand = profile?.fullName?.trim() || "Portfolio";

  const navItems: NavItem[] = [
    { id: "about", label: t.nav.about },
    { id: "skills", label: t.nav.skills },
    { id: "projects", label: t.nav.projects },
    { id: "experience", label: t.nav.experience },
    { id: "education", label: t.nav.education },
    { id: "certificates", label: t.nav.certificates },
    { id: "contact", label: t.nav.contact },
  ];

  const headline = profile?.headline?.trim() || brand;
  const tagline = profile?.tagline?.trim() || t.empty.about;

  return (
    <>
      <Navbar
        brand={brand}
        items={navItems}
        lang={lang}
        labels={{
          menu: t.nav.menu,
          close: t.nav.close,
          skipToContent: t.nav.skipToContent,
          language: t.nav.language,
          theme: t.nav.theme,
          themeLight: t.nav.light,
          themeDark: t.nav.dark,
          themeSystem: t.nav.system,
          langEn: "English",
          langId: "Bahasa Indonesia",
        }}
      />

      <main id="main">
        {/* 1 — Hero ----------------------------------------------------- */}
        <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(59_130_246/0.18),transparent_70%)]"
          />

          <div className="shell relative">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <Reveal>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {profile?.statusLabel?.trim() || t.hero.available}
                    </Badge>
                    {profile?.kicker?.trim() ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {profile.kicker}
                      </span>
                    ) : null}
                  </div>
                </Reveal>

                <Reveal delay={80}>
                  <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    {headline}
                  </h1>
                </Reveal>

                <Reveal delay={160}>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                    {tagline}
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href={profile?.ctaPrimary?.href || "#projects"} className="btn btn-primary">
                      {profile?.ctaPrimary?.label?.trim() || t.nav.projects}
                    </a>
                    <a
                      href={profile?.ctaSecondary?.href || "#contact"}
                      className="btn btn-ghost"
                    >
                      {profile?.ctaSecondary?.label?.trim() || t.nav.contact}
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={320}>
                  <dl className="mt-10 grid max-w-lg gap-3 text-sm sm:grid-cols-3">
                    {profile?.contact.email ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.emailLabel}
                        </dt>
                        <dd className="mt-1 truncate font-medium text-foreground">
                          <a href={`mailto:${profile.contact.email}`} className="hover:text-accent">
                            {profile.contact.email}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {profile?.contact.phone ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.phoneLabel}
                        </dt>
                        <dd className="mt-1 font-medium text-foreground">
                          <a href={`tel:${profile.contact.phone}`} className="hover:text-accent">
                            {profile.contact.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {profile?.contact.location ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.locationLabel}
                        </dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {profile.contact.location}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <SocialLinks
                    socials={site.socials}
                    emptyLabel={t.empty.socials}
                    className="mt-6"
                  />
                </Reveal>
              </div>

              <Reveal delay={120} className="mx-auto w-full max-w-sm lg:max-w-none">
                <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-full border border-border bg-surface-2 shadow-md lg:max-w-md">
                  {profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={brand}
                      fill
                      sizes="(max-width: 1024px) 320px, 448px"
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-2 text-5xl font-bold text-accent/60"
                    >
                      {brand.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={400} className="mt-14">
              <a
                href="#about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
              >
                <span aria-hidden="true">↓</span> {t.hero.scroll}
              </a>
            </Reveal>
          </div>
        </section>

        {/* 2 — Tentang --------------------------------------------------- */}
        <section id="about" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`01 — ${t.sections.about}`}
              title={profile?.about.title?.trim() || t.sections.about}
            />

            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <Reveal>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
                  {profile?.about.photoUrl ? (
                    <Image
                      src={profile.about.photoUrl}
                      alt={profile.about.title || brand}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-2 text-4xl font-bold text-accent/50"
                    >
                      {brand.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </Reveal>

              <Reveal delay={100}>
                {profile?.about.body?.trim() ? (
                  <div className="space-y-4">
                    {profile.about.body
                      .split(/\n{2,}/)
                      .map((paragraph, index) => (
                        <p key={index} className="leading-relaxed text-muted">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                ) : (
                  <EmptyState title={t.empty.about} />
                )}

                <SocialLinks
                  socials={site.socials}
                  emptyLabel={t.empty.socials}
                  className="mt-6"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3 — Keahlian -------------------------------------------------- */}
        <section id="skills" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`02 — ${t.sections.skills}`}
              title={t.sections.skills}
              lead={t.admin.skills.subtitle}
            />
            {site.skills.length > 0 ? (
              <SkillBars skills={site.skills} />
            ) : (
              <div className="mt-8">
                <EmptyState title={t.empty.skills} />
              </div>
            )}
          </div>
        </section>

        {/* 4 — Proyek ---------------------------------------------------- */}
        <section id="projects" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`03 — ${t.sections.projects}`}
              title={t.sections.projects}
              lead={t.admin.projects.subtitle}
            />
            <ProjectFilter
              projects={site.projects}
              labels={{
                all: t.projects.all,
                featured: t.projects.featured,
                viewDetails: t.projects.viewDetails,
                empty: t.empty.projects,
              }}
            />
          </div>
        </section>

        {/* 5 — Pengalaman ------------------------------------------------ */}
        <section id="experience" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`04 — ${t.sections.experience}`}
              title={t.sections.experience}
              lead={t.admin.experience.subtitle}
            />

            {site.experiences.length > 0 ? (
              <ol className="mt-10 space-y-5">
                {site.experiences.map((item, index) => (
                  <Reveal key={item.id} delay={index * 60}>
                    <li className="card p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{item.role}</h3>
                          <p className="mt-1 text-sm text-muted">
                            {item.companyUrl ? (
                              <a
                                href={item.companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-accent hover:underline"
                              >
                                {item.company}
                              </a>
                            ) : (
                              <span className="font-medium text-foreground">{item.company}</span>
                            )}
                            {item.location ? ` · ${item.location}` : null}
                          </p>
                        </div>
                        <Badge>
                          {formatDateRange(lang, item.startDate, item.endDate, t.experience.present)}
                        </Badge>
                      </div>

                      {item.description ? (
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          {item.description
                            .split(/\n{2,}/)
                            .map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex} className="text-sm leading-relaxed text-muted">
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      ) : null}
                    </li>
                  </Reveal>
                ))}
              </ol>
            ) : (
              <div className="mt-8">
                <EmptyState title={t.empty.experience} />
              </div>
            )}
          </div>
        </section>

        {/* 6 — Pendidikan ------------------------------------------------ */}
        <section id="education" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`05 — ${t.sections.education}`}
              title={t.sections.education}
              lead={t.admin.education.subtitle}
            />

            {site.educations.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {site.educations.map((item, index) => (
                  <Reveal key={item.id} delay={index * 60} className="flex">
                    <article className="card h-full w-full p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            {item.institution}
                          </h3>
                          <p className="mt-1 text-sm text-accent">{item.degree}</p>
                        </div>
                        <Badge>
                          {formatDateRange(lang, item.startDate, item.endDate, t.experience.present)}
                        </Badge>
                      </div>

                      <dl className="mt-3 space-y-1 text-sm text-muted">
                        {item.field ? (
                          <div className="flex gap-2">
                            <dt className="text-muted/70">{t.admin.education.field}:</dt>
                            <dd>{item.field}</dd>
                          </div>
                        ) : null}
                        {item.location ? (
                          <div className="flex gap-2">
                            <dt className="text-muted/70">{t.contact.locationLabel}:</dt>
                            <dd>{item.location}</dd>
                          </div>
                        ) : null}
                      </dl>

                      {item.description ? (
                        <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
                          {item.description}
                        </p>
                      ) : null}
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState title={t.empty.education} />
              </div>
            )}
          </div>
        </section>

        {/* 7 — Sertifikat ------------------------------------------------ */}
        <section id="certificates" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`06 — ${t.sections.certificates}`}
              title={t.sections.certificates}
              lead={t.admin.certificates.subtitle}
            />

            {site.certificates.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {site.certificates.map((item, index) => (
                  <Reveal key={item.id} delay={index * 60} className="flex">
                    <article className="card h-full w-full overflow-hidden p-0">
                      <div className="relative h-36 w-full overflow-hidden bg-surface-2">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-2 text-2xl font-bold text-accent/50"
                          >
                            ★
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-sm font-semibold leading-snug text-foreground">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted">{item.issuer}</p>

                        <dl className="mt-3 space-y-1 text-xs text-muted">
                          <div className="flex gap-2">
                            <dt className="text-muted/70">{t.certificates.issued}:</dt>
                            <dd>{formatDate(lang, item.issuedDate, { dateStyle: "medium" })}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-muted/70">{t.certificates.expires}:</dt>
                            <dd>
                              {item.expiresDate
                                ? formatDate(lang, item.expiresDate, { dateStyle: "medium" })
                                : t.certificates.noExpiry}
                            </dd>
                          </div>
                        </dl>

                        {item.credentialUrl ? (
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                          >
                            {t.certificates.verify} <span aria-hidden="true">↗</span>
                          </a>
                        ) : null}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState title={t.empty.certificates} />
              </div>
            )}
          </div>
        </section>

        {/* 8 — Kontak ---------------------------------------------------- */}
        <section id="contact" className="section border-t border-border">
          <div className="shell">
            <SectionHeading
              kicker={`07 — ${t.sections.contact}`}
              title={t.contact.title}
              lead={t.contact.body}
            />

            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal className="space-y-5">
                <div className="card">
                  <dl className="space-y-4 text-sm">
                    {profile?.contact.email ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.emailLabel}
                        </dt>
                        <dd className="mt-1">
                          <a
                            href={`mailto:${profile.contact.email}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {profile.contact.email}
                          </a>
                        </dd>
                      </div>
                    ) : null}

                    {profile?.contact.phone ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.phoneLabel}
                        </dt>
                        <dd className="mt-1">
                          <a
                            href={`tel:${profile.contact.phone}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {profile.contact.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}

                    {profile?.contact.location ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                          {t.contact.locationLabel}
                        </dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {profile.contact.location}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <p className="mt-5 border-t border-border pt-4 text-xs text-muted">
                    {t.contact.responseTime}
                  </p>
                </div>

                <SocialLinks socials={site.socials} emptyLabel={t.empty.socials} />
              </Reveal>

              <Reveal delay={100}>
                <ContactForm t={t} />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* 9 — Footer ------------------------------------------------------ */}
      <SiteFooter
        t={t}
        lang={lang}
        brand={brand}
        socials={site.socials}
        navItems={navItems}
      />
    </>
  );
}
