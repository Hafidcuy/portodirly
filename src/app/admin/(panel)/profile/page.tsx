import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader, FormPanel } from "@/components/admin/AdminPage";
import { ProfileForm } from "@/components/admin/forms/ProfileForm";
import { adminProfile } from "@/lib/data";
import { dict, getLang } from "@/lib/i18n";
import type { ProfileRow } from "@/lib/types";

export const metadata = { title: "Profile · Admin" };

const HREF = "/admin/profile";

/**
 * Halaman profil: satu baris singleton (id = 1), jadi selalu menampilkan form
 * tanpa daftar dan tanpa parameter `?new` / `?edit`.
 */
export default async function AdminProfilePage() {
  const lang = await getLang();
  const t = dict(lang);
  const a = t.admin;

  let profile: ProfileRow;
  try {
    profile = await adminProfile();
  } catch (error) {
    return <AdminLoadError t={t} error={error} retryHref={HREF} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker={a.content}
        title={a.profile.title}
        subtitle={a.profile.subtitle}
      />

      <FormPanel title={a.profile.title}>
        <ProfileForm lang={lang} profile={profile} />
      </FormPanel>
    </div>
  );
}
