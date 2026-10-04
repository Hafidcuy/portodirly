import { SocialLinks } from "@/components/site/SocialLinks";
import type { NavItem } from "@/components/site/Navbar";
import type { Dictionary, Lang } from "@/lib/i18n";
import type { PublicSocial } from "@/lib/types";

type SiteFooterProps = {
  t: Dictionary;
  lang: Lang;
  brand: string;
  socials: PublicSocial[];
  navItems: NavItem[];
};

/** Footer publik: identitas, tautan cepat, tautan sosial, dan kredit. */
export function SiteFooter({ t, lang, brand, socials, navItems }: SiteFooterProps) {
  const year = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="shell py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground">{brand}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {t.footer.builtWith}
            </p>
            <SocialLinks
              socials={socials}
              emptyLabel={t.empty.socials}
              compact
              className="mt-4"
            />
          </div>

          <nav aria-label={t.footer.quickLinks}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t.footer.quickLinks}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t.footer.elsewhere}
            </p>
            <SocialLinks socials={socials} emptyLabel={t.empty.socials} className="mt-4" />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {year} {brand}. {t.footer.rights}
          </p>
          <a href="#top" className="text-xs font-semibold text-accent hover:underline">
            ↑ {t.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
