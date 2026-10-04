import type { NextConfig } from "next";

/**
 * Host gambar Supabase yang diizinkan `next/image`.
 *
 * Selalu menyertakan wildcard `*.supabase.co` plus host persis dari
 * `SUPABASE_URL` bila env tersebut sudah terbaca saat config dievaluasi.
 */
function allowedImageHosts(): string[] {
  const hosts = new Set<string>(["*.supabase.co"]);
  try {
    const raw = process.env.SUPABASE_URL;
    if (raw) hosts.add(new URL(raw).hostname);
  } catch {
    // URL tidak valid — biarkan wildcard saja.
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHosts().map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
  experimental: {
    serverActions: {
      // Unggahan gambar diizinkan sampai 5 MB; sisanya untuk overhead multipart.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
