"use client";

import { useActionState, useState } from "react";

import { Field } from "@/components/ui/Field";
import { login } from "@/lib/actions/session";
import { dict, type Lang } from "@/lib/i18n/dictionaries";

/**
 * Form masuk panel. `lang` datang dari server sehingga kamus tidak perlu
 * diimpor dari modul yang menyentuh `next/headers`.
 */
export function LoginForm({ lang, next }: { lang: Lang; next?: string }) {
  const t = dict(lang);
  const [state, formAction, pending] = useActionState(login, {
    status: "idle" as const,
  });
  const [show, setShow] = useState(false);

  const error =
    state.status === "error"
      ? (state.message ?? t.admin.invalidPassword)
      : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field id="password" label={t.admin.password} error={error}>
        {(control) => (
          <div className="flex gap-2">
            <input
              {...control}
              type={show ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              autoFocus
              className="input min-w-0 flex-1"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="btn btn-ghost btn-sm shrink-0"
              aria-pressed={show}
            >
              {show ? t.admin.hidePassword : t.admin.showPassword}
            </button>
          </div>
        )}
      </Field>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? t.admin.signingIn : t.admin.signIn}
      </button>
    </form>
  );
}
