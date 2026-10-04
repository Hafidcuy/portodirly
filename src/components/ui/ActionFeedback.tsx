"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Pemetaan `nama kolom -> pesan[]` hasil validasi Zod di server. */
export type FieldErrors = Record<string, string[]> | undefined;

const ActionFeedbackContext = createContext<FieldErrors>(undefined);

/**
 * Menyebarkan `state.fieldErrors` dari `AdminForm` ke seluruh field di dalamnya.
 *
 * Tanpa provider, `useActionFieldErrors()` mengembalikan `undefined` sehingga
 * field tetap bisa dipakai mandiri (mis. dengan prop `errors` eksplisit).
 */
export function ActionFeedbackProvider({
  errors,
  children,
}: {
  errors: FieldErrors;
  children: ReactNode;
}) {
  return (
    <ActionFeedbackContext.Provider value={errors}>{children}</ActionFeedbackContext.Provider>
  );
}

/** Ambil error per-field milik form terdekat. Aman dipanggil tanpa provider. */
export function useActionFieldErrors(): FieldErrors {
  return useContext(ActionFeedbackContext);
}
