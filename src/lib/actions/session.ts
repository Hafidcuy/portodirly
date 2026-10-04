"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  ATTEMPTS_COOKIE,
  SESSION_COOKIE,
  blockedForSeconds,
  createSessionToken,
  recordFailedAttempt,
  serializeAttempts,
  verifyPassword,
} from "@/lib/auth";
import { dict, getLang, type Dictionary } from "@/lib/i18n";

/**
 * Masa berlaku sesi admin: 7 hari.
 *
 * Sengaja TIDAK diekspor — file `"use server"` hanya boleh mengekspor
 * fungsi async (lihat nextjs.org/docs/messages/invalid-use-server-value).
 */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secureCookie() {
  return process.env.NODE_ENV === "production";
}

/**
 * Pesan kunci login sesuai bahasa.
 *
 * Kamus menyimpan teks template (`{seconds}`) alih-alih fungsi, supaya seluruh
 * dictionary serializable dan boleh dikirim sebagai prop ke Client Component
 * (Next.js/React melarang fungsi melewati batas server → client).
 */
function blockedMessage(t: Dictionary, seconds: number): string {
  return t.admin.blocked.replace("{seconds}", String(seconds));
}

/**
 * Login admin: verifikasi `ADMIN_PASSWORD` lalu tulis cookie sesi bertanda HMAC.
 *
 * Percobaan gagal dicatat lewat cookie `admin_attempts` — lima kegagalan
 * dalam 15 menit mengunci form sementara.
 */
export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = dict(await getLang());
  const store = await cookies();

  const attemptsRaw = store.get(ATTEMPTS_COOKIE)?.value;
  const lockSeconds = blockedForSeconds(attemptsRaw);
  if (lockSeconds > 0) {
    return { ...initialActionState, status: "error", message: blockedMessage(t, lockSeconds) };
  }

  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");

  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch {
    return {
      ...initialActionState,
      status: "error",
      message: t.admin.notConfigured,
    };
  }

  if (!ok) {
    const { attempts, blocked } = recordFailedAttempt(attemptsRaw);
    const serialized = serializeAttempts(attempts);
    store.set(ATTEMPTS_COOKIE, serialized, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie(),
      path: "/",
      maxAge: 60 * 60,
    });
    return {
      ...initialActionState,
      status: "error",
      message: blocked
        ? blockedMessage(t, blockedForSeconds(serialized))
        : t.admin.invalidPassword,
    };
  }

  let token: string;
  try {
    token = createSessionToken();
  } catch {
    return {
      ...initialActionState,
      status: "error",
      message: t.admin.notConfigured,
    };
  }

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  store.delete(ATTEMPTS_COOKIE);

  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/admin";
  redirect(safeNext);
}

/** Keluar dari panel admin. */
export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/**
 * Ganti bahasa tampilan (EN/ID) lewat cookie `lang`.
 * Nilai di luar `en`/`id` diabaikan.
 */
export async function setLang(lang: string): Promise<void> {
  if (lang !== "en" && lang !== "id") return;
  const store = await cookies();
  store.set("lang", lang, {
    httpOnly: false,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Paksa render ulang seluruh pohon RSC supaya teks (dan atribut `lang`
  // pada <html>) ikut berganti pada request yang sama.
  revalidatePath("/", "layout");
}
