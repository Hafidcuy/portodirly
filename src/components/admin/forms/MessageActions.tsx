"use client";

import { useActionState } from "react";

import { DeleteButton } from "@/components/ui/AdminForm";
import { ActionToast } from "@/components/ui/ActionToast";
import { Button } from "@/components/ui/Button";
import { deleteItem, toggleMessageRead } from "@/lib/actions/admin";
import { initialActionState } from "@/lib/action-state";
import { dict, type Lang } from "@/lib/i18n/dictionaries";
import type { MessageRow } from "@/lib/types";

type Props = {
  lang: Lang;
  message: MessageRow;
};

/**
 * Aksi per pesan: tandai dibaca/belum dan hapus dengan konfirmasi.
 *
 * Pesan tidak punya form "baru" — hanya dua aksi ini.
 */
export function MessageActions({ lang, message }: Props) {
  const t = dict(lang);
  const a = t.admin;
  const m = a.messages;

  const [readState, toggleFormAction, togglePending] = useActionState(
    toggleMessageRead,
    initialActionState,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleFormAction}>
        <input type="hidden" name="id" value={message.id} />
        <Button type="submit" variant="ghost" size="sm" loading={togglePending}>
          {message.is_read ? m.markUnread : m.markRead}
        </Button>
      </form>

      <a
        className="btn btn-ghost btn-sm"
        href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject)}`}
      >
        {m.reply}
      </a>

      <DeleteButton
        action={deleteItem}
        fields={{ table: "messages", id: message.id }}
        label={a.delete}
        title={m.deleteConfirm}
        body={a.confirmDeleteBody}
        confirmLabel={a.delete}
        cancelLabel={a.cancel}
        pendingLabel={a.deleting}
        errorFallback={a.error}
        className="text-danger"
      />

      <ActionToast state={readState} fallback={a.error} />
    </div>
  );
}
