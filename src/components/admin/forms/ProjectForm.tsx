"use client";

import { AdminForm } from "@/components/ui/AdminForm";
import { BiField, CheckField, TextField } from "@/components/ui/FormField";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LangTabProvider } from "@/components/ui/LangTabs";
import { saveProject } from "@/lib/actions/admin";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { ProjectRow } from "@/lib/types";

type Props = {
  lang: Lang;
  /** Baris yang disunting, atau `null` untuk proyek baru. */
  project: ProjectRow | null;
};

/**
 * Form proyek: slug, judul/deskripsi bilingual, kategori, sampul, tag,
 * tautan, serta penanda unggulan dan visibilitas.
 *
 * Slug kosong diisi otomatis dari judul Inggris oleh `saveProject`.
 */
export function ProjectForm({ lang, project }: Props) {
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
        action={saveProject}
        submitLabel={project ? a.save : a.saveNew}
        pendingLabel={a.saving}
        errorFallback={a.validationError}
        resetOnSuccess={!project}
      >
        {project ? <input type="hidden" name="id" value={project.id} /> : null}

        <div className="grid gap-4">
          <BiField
            base="title"
            label={a.projects.fieldTitle}
            required
            values={project ? { en: project.title_en, id: project.title_id } : undefined}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="slug"
              label={a.projects.slug}
              hint={a.projects.slugHint}
              placeholder="my-project"
              defaultValue={project?.slug ?? ""}
            />
            <BiField
              base="category"
              label={a.projects.category}
              required
              values={project ? { en: project.category_en, id: project.category_id } : undefined}
            />
          </div>

          <BiField
            base="summary"
            label={a.projects.summary}
            control="textarea"
            rows={2}
            values={project ? { en: project.summary_en, id: project.summary_id } : undefined}
          />
          <BiField
            base="description"
            label={a.projects.description}
            control="textarea"
            rows={8}
            values={
              project
                ? { en: project.description_en, id: project.description_id }
                : undefined
            }
          />

          <ImageUpload
            name="cover_url"
            value={project?.cover_url ?? null}
            folder="projects"
            label={a.projects.cover}
            hint={images.dropHint}
            previewClassName="h-32 w-56"
            labels={uploadLabels}
          />

          <TextField
            name="tech_tags"
            label={a.projects.techTags}
            hint={a.projects.techTagsHint}
            defaultValue={project?.tech_tags.join(", ") ?? ""}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="live_url"
              label={a.projects.liveUrl}
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              defaultValue={project?.live_url ?? ""}
            />
            <TextField
              name="repo_url"
              label={a.projects.repoUrl}
              type="url"
              inputMode="url"
              placeholder="https://github.com/you/repo"
              defaultValue={project?.repo_url ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              name="sort_order"
              label={a.common.sortOrder}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={project?.sort_order == null ? "" : String(project.sort_order)}
            />
            <div className="flex items-end pb-2">
              <CheckField
                name="is_featured"
                label={a.projects.featured}
                defaultChecked={project ? project.is_featured : false}
              />
            </div>
            <div className="flex items-end pb-2">
              <CheckField
                name="is_visible"
                label={a.common.visible}
                defaultChecked={project ? project.is_visible : true}
              />
            </div>
          </div>
        </div>
      </AdminForm>
    </LangTabProvider>
  );
}
