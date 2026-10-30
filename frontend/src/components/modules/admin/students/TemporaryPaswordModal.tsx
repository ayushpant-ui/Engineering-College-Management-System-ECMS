"use client";

import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";

export default function TemporaryPasswordModal({
  title,
  studentName,
  registrationNumber,
  password,
  onClose,
}: {
  title: string;
  studentName: string;
  registrationNumber: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the password is still visible to copy by hand
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-muted-foreground">
        Give these login details to <span className="font-medium text-foreground">{studentName}</span>. The student
        will be asked to choose a new password at first login.
      </p>

      <dl className="mt-4 space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Registration number</dt>
          <dd className="font-medium">{registrationNumber}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Temporary password</dt>
          <dd className="flex items-center gap-2">
            <code className="rounded-md bg-background px-2.5 py-1 font-mono text-base font-semibold tracking-wider">
              {password}
            </code>
            <button
              onClick={copy}
              aria-label="Copy password"
              className="rounded-lg border p-2 transition hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        This password is shown only once and can&apos;t be viewed again. If it&apos;s lost, reset the password to
        create a new one.
      </p>

      <div className="mt-5 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}