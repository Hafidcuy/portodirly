"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PublicProject } from "@/lib/types";

export type ProjectFilterLabels = {
  all: string;
  featured: string;
  viewDetails: string;
  empty: string;
};

type ProjectFilterProps = {
  projects: PublicProject[];
  labels: ProjectFilterLabels;
};

/**
 * Grid proyek dengan filter kategori dan "Unggulan".
 *
 * Komponen client karena state filter-nya lokal; tautan detail tetap
 * navigasi normal ke `/projects/[slug]` sehingga tetap berfungsi tanpa JS
 * (tanpa filter, semua kartu tampil).
 */
export function ProjectFilter({ projects, labels }: ProjectFilterProps) {
  const [active, setActive] = useState<string>("all");

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const project of projects) {
      const value = project.category.trim();
      if (value) seen.add(value);
    }
    return [...seen];
  }, [projects]);

  const visible = useMemo(() => {
    if (active === "all") return projects;
    if (active === "__featured__") return projects.filter((project) => project.isFeatured);
    return projects.filter((project) => project.category === active);
  }, [active, projects]);

  if (projects.length === 0) {
    return <p className="mt-8 text-sm text-muted">{labels.empty}</p>;
  }

  const filters: Array<{ value: string; label: string }> = [
    { value: "all", label: labels.all },
    ...(projects.some((project) => project.isFeatured)
      ? [{ value: "__featured__", label: labels.featured }]
      : []),
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  return (
    <div className="mt-8">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={labels.all}
      >
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActive(filter.value)}
            aria-pressed={active === filter.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              active === filter.value
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <li key={project.id} className="flex">
            <article className="card flex w-full flex-col overflow-hidden p-0">
              <div className="relative h-44 w-full overflow-hidden bg-surface-2">
                {project.coverUrl ? (
                  <Image
                    src={project.coverUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-2"
                  >
                    <span className="text-3xl font-bold text-accent/50">
                      {project.title.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                )}
                {project.isFeatured ? (
                  <span className="absolute left-3 top-3">
                    <Badge tone="accent">{labels.featured}</Badge>
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{project.category}</Badge>
                  {project.techTags.slice(0, 3).map((tag) => (
                    <Badge key={tag} className="border-transparent bg-surface-2/70">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
                  {project.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {project.summary}
                </p>

                <Link
                  href={`/projects/${project.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  {labels.viewDetails}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
