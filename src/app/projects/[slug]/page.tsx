import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/site/Reveal";
import { SetupNotice } from "@/components/site/SetupNotice";
import { ThemeToggle, LangToggle } from "@/components/site/Toggles";
import { Badge } from "@/components/ui/Badge";
import { missingSupabaseEnv } from "@/lib/env";
import { formatDate, dict, getLang } from "@/lib/i18n";
import { loadProject, loadShell } from "@/lib/data";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

/** Detail proyek: `/projects/[slug]` — seluruh teks mengikuti cookie `lang`. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const lang = await getLang();
  const t = dict(lang);
  const result = await loadProject(slug, lang);

  if (!result.ok) {
    return <SetupNotice reason={result.reason} missing={missingSupabaseEnv()} t={t} />;
  }

  const project = result.data;
  if (!project) notFound();

  const paragraphs = project.description
    ? project.description.split(/\n{2,}/).filter((value) => value.trim().length > 0)
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="shell flex h-14 items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-accent"
          >
            <span aria-hidden="true">←</span> {t.projects.backToHome}
          </Link>

          <div className="flex items-center gap-2">
            <LangToggle
              lang={lang}
              ariaLabel={t.nav.language}
              labels={{ en: "EN", id: "ID" }}
            />
            <ThemeToggle
              ariaLabel={t.nav.theme}
              labels={{ light: t.nav.light, dark: t.nav.dark, system: t.nav.system }}
            />
          </div>
        </div>
      </header>

      <main id="main" className="pb-20">
        <section className="pt-10 sm:pt-14">
          <div className="shell">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{project.category}</Badge>
                {project.isFeatured ? <Badge>{t.projects.featured}</Badge> : null}
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>

              {project.summary ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                  {project.summary}
                </p>
              ) : null}

              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">
                {t.projects.publishedOn}{" "}
                <time dateTime={project.createdAt}>
                  {formatDate(lang, project.createdAt, { dateStyle: "medium" })}
                </time>
              </p>
            </Reveal>

            <Reveal delay={100} className="mt-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
                {project.coverUrl ? (
                  <Image
                    src={project.coverUrl}
                    alt={project.title}
                    fill
                    priority
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-2 text-4xl font-bold text-accent/50"
                  >
                    {project.title.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="shell grid items-start gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <Reveal>
              <h2 className="text-xl font-semibold text-foreground">{t.projects.detailTitle}</h2>

              {paragraphs.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">{t.projects.empty}</p>
              )}
            </Reveal>

            <Reveal delay={80} className="space-y-5">
              {project.techTags.length > 0 ? (
                <div className="card">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {t.projects.techStack}
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.techTags.map((tag) => (
                      <li key={tag}>
                        <Badge>{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.liveUrl || project.repoUrl ? (
                <div className="card flex flex-col gap-3">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full justify-center"
                    >
                      {t.projects.liveDemo} <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost w-full justify-center"
                    >
                      {t.projects.sourceCode} <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              ) : null}

              <Link href="/#projects" className="btn btn-ghost w-full justify-center">
                <span aria-hidden="true">←</span> {t.projects.viewAll}
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}

type MetadataProps = { params: Promise<{ slug: string }> };

/** Judul tab mengikuti judul proyek (bahasa aktif). */
export async function generateMetadata({ params }: MetadataProps) {
  const { slug } = await params;
  const lang = await getLang();
  const shell = await loadShell(lang);
  const fallbackTitle = shell.ok ? shell.data.seo.title : "Portfolio";
  const fallbackDescription = shell.ok ? shell.data.seo.description : "";
  const result = await loadProject(slug, lang);

  if (!result.ok || !result.data) {
    return { title: `${fallbackTitle} · ${dict(lang).projects.notFoundTitle}` };
  }

  return {
    title: `${result.data.title} · ${fallbackTitle}`,
    description: result.data.summary || fallbackDescription,
  };
}
