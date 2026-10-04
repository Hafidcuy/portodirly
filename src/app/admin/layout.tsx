import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Pembungkus area admin. Proteksi login ada di `src/proxy.ts` (semua rute
 * `/admin/*` kecuali `/admin/login`) dan guard sesi di `(panel)/layout.tsx`.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
