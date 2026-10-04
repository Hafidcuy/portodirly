"use server";

import {
  errorAction,
  invalidAction,
  okAction,
  readValues,
  type ActionState,
} from "@/lib/action-state";
import { dict, getLang } from "@/lib/i18n";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fieldErrors, makeContactSchema } from "@/lib/validation";

/**
 * Terima pesan dari form kontak publik dan simpan ke tabel `messages`.
 *
 * Field tebusan `website` (honeypot) harus kosong — bot yang mengisinya
 * dijawab dengan sukses palsu tanpa menyimpan apa pun.
 */
export async function submitContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = dict(await getLang());
  const values = readValues(formData);

  if (String(formData.get("website") ?? "").trim() !== "") {
    return okAction(t.contact.success);
  }

  const schema = makeContactSchema({
    nameRequired: t.contact.required,
    emailRequired: t.contact.required,
    subjectRequired: t.contact.required,
    invalidEmail: t.contact.invalidEmail,
    tooShort: t.contact.messageShort,
    tooLong: t.contact.messageLong,
  });

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return invalidAction(fieldErrors(parsed.error), values);
  }

  try {
    const { error } = await supabaseAdmin()
      .from("messages")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        body: parsed.data.body,
        is_read: false,
      });
    if (error) return errorAction(t.contact.errorGeneric, values);
  } catch {
    return errorAction(t.contact.errorGeneric, values);
  }

  return okAction(t.contact.success);
}
