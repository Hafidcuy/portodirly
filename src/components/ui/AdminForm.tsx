"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

import { ActionFeedbackProvider } from "@/components/ui/ActionFeedback";
import { ActionToast } from "@/components/ui/ActionToast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  captureFormSnapshot,
  restoreFormSnapshot,
  type FormSnapshot,
} from "@/lib/form-snapshot";

type AdminFormProps = {
  /** Server action dengan kontrak `(prev, formData) => ActionState`. */
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  /** Pesan bila aksi gagal validasi tanpa pesan umum. */
  errorFallback?: string;
  /**
   * Kosongkan form setelah sukses. Pakai HANYA untuk form "bar baru" —
   * form suntingan tidak perlu direset karena isian sudah sama dengan DB.
   */
  resetOnSuccess?: boolean;
  /** Tombol sekunder di kiri tombol simpan (mis. "Batal"). */
  secondary?: ReactNode;
  className?: string;
};

/**
 * Pembungkus form admin: `useActionState` + tombol submit + toast hasil.
 *
 * Form di-remount (isi kembali default) bila `resetOnSuccess` dan aksi sukses;
 * selain itu isi form dipulihkan dari snapshot FormData agar tidak ikut
 * ter-reset oleh React 19 saat validasi gagal.
 */
export function AdminForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  errorFallback,
  resetOnSuccess = false,
  secondary,
  className,
}: AdminFormProps) {
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const snapshotRef = useRef<FormSnapshot>([]);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    (prev, formData) => {
      // Simpan isi form persis seperti yang dikirim user.
      snapshotRef.current = captureFormSnapshot(formData);
      return action(prev, formData).then((next) => {
        // Remount (form kembali default) setelah sukses. Dilakukan dari
        // callback promise — bukan dari dalam effect — agar bebas aturan
        // `react-hooks/set-state-in-effect`.
        if (resetOnSuccess && next.status === "success") setFormKey((key) => key + 1);
        return next;
      });
    },
    initialActionState,
  );

  // React mereset semua field uncontrolled setelah aksi selesai; tulis ulang
  // isian user agar tidak hilang saat validasi gagal (dan pada form suntingan).
  useEffect(() => {
    const form = formRef.current;
    if (!form || state.status === "idle") return;
    if (resetOnSuccess && state.status === "success") return;
    restoreFormSnapshot(form, snapshotRef.current);
  }, [state, resetOnSuccess]);

  return (
    <>
      <form key={formKey} ref={formRef} action={formAction} className={className} noValidate>
        <ActionFeedbackProvider errors={state.fieldErrors}>{children}</ActionFeedbackProvider>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          {secondary}
          <Button type="submit" loading={pending}>
            {pending && pendingLabel ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>

      <ActionToast state={state} fallback={errorFallback} />
    </>
  );
}

type DeleteButtonProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Input tersembunyi yang dikirim — biasanya `{ table, id }`. */
  fields: Record<string, string>;
  label: string;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  pendingLabel?: string;
  errorFallback?: string;
  className?: string;
};

/**
 * Tombol hapus dengan konfirmasi. Mengirim form tersembunyi ke server action
 * setelah user menekan tombol konfirmasi.
 */
export function DeleteButton({
  action,
  fields,
  label,
  title,
  body,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  errorFallback,
  className,
}: DeleteButtonProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const confirm = () => {
    setOpen(false);
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" tabIndex={-1} aria-hidden>
          {label}
        </button>
      </form>

      <Button
        variant="ghost"
        size="sm"
        className={className}
        loading={pending}
        onClick={() => setOpen(true)}
      >
        {pending && pendingLabel ? pendingLabel : label}
      </Button>

      <ConfirmDialog
        open={open}
        title={title}
        body={body}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        busy={pending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />

      <ActionToast state={state} fallback={errorFallback} />
    </>
  );
}
