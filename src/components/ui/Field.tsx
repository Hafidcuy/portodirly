import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/** Props yang diberikan `Field` ke kontrol input-nya. */
export type FieldControlProps = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldProps = {
  id: string;
  label: ReactNode;
  /** Petunjuk opsional di bawah kontrol. */
  hint?: string;
  /** Pesan validasi; bila ada, kontrol diberi `aria-invalid`. */
  error?: string | null | undefined;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Label + kontrol + petunjuk + pesan error, lengkap dengan atribut
 * aksesibilitas (`htmlFor`, `aria-invalid`, `aria-describedby`).
 *
 * Kontrol dirender lewat fungsi sehingga `id` dan deskriptor tidak mungkin
 * salah pasang.
 */
export function Field({ id, label, hint, error, children }: FieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

/** Input teks/baris tunggal dengan styling `.input` bawaan. */
export function TextInput({ className, ...rest }: TextInputProps) {
  return <input className={cn("input", className)} {...rest} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

/** Area teks multi-baris. */
export function TextArea({ className, rows = 5, ...rest }: TextAreaProps) {
  return <textarea rows={rows} className={cn("input resize-y", className)} {...rest} />;
}

type SelectOption = { value: string; label: string };

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  /** Opsi kosong yang ditampilkan paling atas (mis. "Pilih…"). */
  placeholder?: string;
  className?: string;
};

/** Dropdown dengan daftar opsi dari array. */
export function SelectInput({
  options,
  placeholder,
  className,
  ...rest
}: SelectInputProps) {
  return (
    <select className={cn("input", className)} {...rest}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  label: ReactNode;
};

/**
 * Centang dengan label menyatu.
 *
 * Menyertakan input tersembunyi `false` sebelum checkbox agar form selalu
 * mengirim nilai bila centangnya dilepas (skema Zod memakai default `true`
 * hanya saat kunci benar-benar tidak ada).
 */
export function Checkbox({ label, name, ...rest }: CheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input type="hidden" name={name} value="false" />
      <input
        type="checkbox"
        name={name}
        value="true"
        className="h-4 w-4 rounded border-border-strong text-accent accent-accent"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
