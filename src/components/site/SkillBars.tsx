import { Reveal } from "@/components/site/Reveal";
import type { PublicSkill } from "@/lib/types";

type SkillGroup = { category: string; items: PublicSkill[] };

/**
 * Kelompokkan keahlian berdasarkan kategori, mempertahankan urutan
 * dari database (sort_order) dan munculnya kategori pertama kali.
 */
export function groupSkills(skills: PublicSkill[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  const index = new Map<string, SkillGroup>();

  for (const skill of skills) {
    const key = skill.category.trim();
    let group = index.get(key);
    if (!group) {
      group = { category: key, items: [] };
      index.set(key, group);
      groups.push(group);
    }
    group.items.push(skill);
  }

  return groups;
}

type SkillBarsProps = {
  skills: PublicSkill[];
};

/**
 * Daftar keahlian dengan bar kemajuan per kategori.
 *
 * Lebar bar memakai nilai `level` (0–100) sehingga admin bisa menyetel
 * tingkat penguasaan tanpa menyentuh kode.
 */
export function SkillBars({ skills }: SkillBarsProps) {
  const groups = groupSkills(skills);

  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2">
      {groups.map((group, groupIndex) => (
        <Reveal key={group.category} delay={groupIndex * 60}>
          <div className="card h-full">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              {group.category}
            </h3>

            <ul className="mt-5 space-y-4">
              {group.items.map((skill) => (
                <li key={skill.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <span className="text-xs tabular-nums text-muted">{skill.level}%</span>
                  </div>

                  <div
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                    role="progressbar"
                    aria-valuenow={skill.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={skill.name}
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
