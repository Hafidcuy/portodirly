"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { submitContact } from "@/lib/actions/contact";
import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  captureFormSnapshot,
  restoreFormSnapshot,
  type FormSnapshot,
} from "@/lib/form-snapshot";
import type { Dictionary } from "@/lib/i18n";

type ContactFormProps = {
  t: Dictionary;
};

/**
 * Formulir kontak publik.
 *
 * Memakai banner inline di atas form (bukan toast melayang) agar pesan
 * hasil kirim tetap terbaca oleh pembaca layar dan tetap ada bila
 * JavaScript gagal dimuat ulang. Field tebusan `website` dikirim tersembunyi
 * sebagai jebakan bot.
 */
export function ContactForm({ t }: ContactFormProps) {
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const snapshotRef = useRef<FormSnapshot>([]);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    (prev, formData) => {
      // Simpan isi form persis seperti yang dikirim user.
      snapshotRef.current = captureFormSnapshot(formData);
      return submitContact(prev, formData).then((next) => {
        // Sukses -> kosongkan form dengan me-remount (nilai awal kosong).
        // Dipanggil dari callback promise — bukan dari dalam effect — agar
        // bebas aturan `react-hooks/set-state-in-effect`.
        if (next.status === "success") setFormKey((key) => key + 1);
        return next;
      });
    },
    initialActionState,
  );

  // Gagal validasi -> tulis ulang isian user (React 19 mereset field
  // uncontrolled setelah aksi selesai).
  useEffect(() => {
    const form = formRef.current;
    if (!form || state.status !== "error") return;
    restoreFormSnapshot(form, snapshotRef.current);
  }, [state]);

  const errors = state.fieldErrors;
  const bannerText =
    state.status === "success"
      ? (state.message ?? t.contact.success)
      : state.status === "error"
        ? (state.message ?? t.contact.errorGeneric)
        : "";
  const bannerTone = state.status === "success" ? "success" : "error";

  return (
    <form key={formKey} ref={formRef} action={formAction} className="card p-6 sm:p-7" noValidate>
      {bannerText ? (
        <p
          role="status"
          className={
            bannerTone === "success"
              ? "mb-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
              : "mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
          }
        >
          {bannerText}
        </p>
      ) : null}

      {/* Jebakan bot: harus kosong. */}
      <input
        type="text"
        name="website"
        readOnly
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" label={t.contact.name} error={errors?.name?.[0]}>
          {(control) => <TextInput {...control} name="name" autoComplete="name" required />}
        </Field>

        <Field id="contact-email" label={t.contact.email} error={errors?.email?.[0]}>
          {(control) => (
            <TextInput {...control} type="email" name="email" autoComplete="email" required />
          )}
        </Field>
      </div>

      <div className="mt-4">
        <Field id="contact-subject" label={t.contact.subject} error={errors?.subject?.[0]}>
          {(control) => <TextInput {...control} name="subject" required />}
        </Field>
      </div>

      <div className="mt-4">
        <Field id="contact-body" label={t.contact.message} error={errors?.body?.[0]}>
          {(control) => <TextArea {...control} name="body" rows={6} required />}
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">{t.contact.responseTime}</p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t.contact.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}
