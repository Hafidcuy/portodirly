"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import {
  Checkbox,
  Field,
  SelectInput,
  TextArea,
  TextInput,
  type FieldControlProps,
} from "@/components/ui/Field";
import { LangPane, type FormLang } from "@/components/ui/LangTabs";
import { useActionFieldErrors } from "@/components/ui/ActionFeedback";

/** Pemetaan `nama kolom -> pesan[]` hasil Zod. */
export type Errors = Record<string, string[]> | undefined;

function firstError(errors: Errors, name: string): string | undefined {
  return errors?.[name]?.[0];
}

/**
 * Error milik form (dari `AdminForm`) dipadukan dengan prop `errors` eksplisit;
 * prop selalu menang per-kunci.
 */
function useMergedErrors(errors: Errors): Errors {
  const fromForm = useActionFieldErrors();
  if (!fromForm && !errors) return undefined;
  return { ...fromForm, ...errors };
}

type Shared = {
  name: string;
  label: ReactNode;
  hint?: string;
  errors?: Errors;
  defaultValue?: string;
};

/** Input teks satu bahasa (kolom tanpa pasangan `_en`/`_id`). */
export function TextField({
  name,
  id,
  label,
  hint,
  errors,
  defaultValue,
  ...rest
}: Shared & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue" | "id"> & {
  id?: string;
}) {
  const fieldId = id ?? name;
  const merged = useMergedErrors(errors);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={firstError(merged, name)}
    >
      {(control) => (
        <TextInput {...control} name={name} defaultValue={defaultValue} {...rest} />
      )}
    </Field>
  );
}

/** Area teks satu bahasa. */
export function TextAreaField({
  name,
  id,
  label,
  hint,
  errors,
  defaultValue,
  ...rest
}: Shared &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "defaultValue" | "id"> & {
    id?: string;
  }) {
  const fieldId = id ?? name;
  const merged = useMergedErrors(errors);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={firstError(merged, name)}
    >
      {(control) => (
        <TextArea {...control} name={name} defaultValue={defaultValue} {...rest} />
      )}
    </Field>
  );
}

/** Dropdown satu bahasa. */
export function SelectField({
  name,
  id,
  label,
  hint,
  errors,
  defaultValue,
  options,
  placeholder,
  ...rest
}: Shared &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "defaultValue" | "id"> & {
    id?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  const fieldId = id ?? name;
  const merged = useMergedErrors(errors);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={firstError(merged, name)}
    >
      {(control) => (
        <SelectInput
          {...control}
          name={name}
          defaultValue={defaultValue ?? ""}
          options={options}
          placeholder={placeholder}
          {...rest}
        />
      )}
    </Field>
  );
}

/** Centang satu bahasa, lengkap dengan input tersembunyi `false`. */
export function CheckField({
  name,
  label,
  hint,
  errors,
  defaultChecked,
}: Shared & { defaultChecked?: boolean; label: ReactNode }) {
  const merged = useMergedErrors(errors);
  const error = firstError(merged, name);
  return (
    <div>
      <Checkbox name={name} label={label} defaultChecked={defaultChecked} />
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type BiControl = {
  label: ReactNode;
  hint?: string;
  /** Dasar nama kolom: `title` menghasilkan `title_en` dan `title_id`. */
  base: string;
  errors?: Errors;
  control?: "input" | "textarea";
  rows?: number;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  values?: { en?: string; id?: string };
};

/**
 * Isian bilingual: dua input (`base_en` dan `base_id`) dengan label sama,
 * masing-masing dibungkus `LangPane` sehingga hanya yang aktif terlihat —
 * tetapi keduanya tetap terkirim saat form disubmit.
 */
export function BiField({
  label,
  hint,
  base,
  errors,
  control = "input",
  rows,
  type = "text",
  inputMode,
  placeholder,
  autoComplete,
  required,
  values,
}: BiControl) {
  const common = { label, hint };

  const renderInput = (lang: FormLang) =>
    control === "textarea" ? (
      <TextAreaField
        {...common}
        id={`${base}_${lang}`}
        name={`${base}_${lang}`}
        rows={rows}
        placeholder={placeholder}
        required={required}
        errors={errors}
        defaultValue={values?.[lang]}
      />
    ) : (
      <TextField
        {...common}
        id={`${base}_${lang}`}
        name={`${base}_${lang}`}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        errors={errors}
        defaultValue={values?.[lang]}
      />
    );

  return (
    <>
      <LangPane lang="en">{renderInput("en")}</LangPane>
      <LangPane lang="id">{renderInput("id")}</LangPane>
    </>
  );
}

export type { FieldControlProps };
