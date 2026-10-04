import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { loadShell } from "@/lib/data";
import { getLang, langAttribute } from "@/lib/i18n";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Script anti-flash tema. Berjalan sinkron saat HTML diparse — sebelum paint
 * pertama — sehingga tidak ada kilatan terang saat pengunjung gelap.
 *
 * Urutan sumber kebenaran: pilihan tersimpan di localStorage → tema default
 * dari pengaturan admin (attr `data-default-theme`) → preferensi sistem.
 */
const THEME_BOOT = `(function(){try{var h=document.documentElement;var d=h.getAttribute("data-default-theme")||"system";var s=null;try{s=localStorage.getItem("theme")}catch(e){}var t=s||d;if(t==="dark"||(t!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)){h.classList.add("dark")}}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const shell = await loadShell(lang);

  const seo = shell.ok ? shell.data.seo : { title: "Portfolio", description: "" };

  return {
    metadataBase: new URL("https://localhost"),
    title: {
      default: seo.title,
      template: "%s · Portfolio",
    },
    description: seo.description,
    applicationName: seo.title,
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      siteName: seo.title,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const shell = await loadShell(lang);
  const defaultTheme = shell.ok ? shell.data.defaultTheme : "system";

  return (
    <html
      lang={langAttribute(lang)}
      data-default-theme={defaultTheme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
