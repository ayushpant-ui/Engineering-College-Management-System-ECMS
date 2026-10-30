"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";

export default function ConfirmReasonModal({
  title,
  description,
  confirmLabel,
  requireReason = false,
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  requireReason?: boolean;
  danger?: boolean;
  onConfirm: (reason: string) => Promise<void>; // throw to show an error; resolve to finish
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reasonTooShort = requireReason && reason.trim().length < 3;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p className="text-sm text-muted-foreground">{description}</p>

      {requireReason && (
        <div className="mt-4">
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium">
            Reason <span className="text-muted-foreground">(saved in the audit log)</span>
          </label>
          <textarea
            id="reason"
            rows={3}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Re-evaluation result approved by the examination board"
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={busy}
          className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy || reasonTooShort}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}