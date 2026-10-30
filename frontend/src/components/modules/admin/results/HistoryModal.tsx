"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/modules/admin/Modal";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import type { AuditEntry } from "@/lib/admin-results";

const actionStyles: Record<AuditEntry["action"], string> = {
  CREATE: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PUBLISH: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  UNPUBLISH: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function HistoryModal({
  subjectId,
  subjectLabel,
  onClose,
}: {
  subjectId: number;
  subjectLabel: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminFetch<AuditEntry[]>(`/admin/results/audit?subjectId=${subjectId}&limit=100`)
      .then((data) => !cancelled && setEntries(data))
      .catch((err) => !cancelled && setError(err instanceof AdminApiError ? err.message : "Could not load history."));
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  return (
    <Modal title={`History — ${subjectLabel}`} onClose={onClose} wide>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {!error && entries === null && <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
      {entries && entries.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No changes recorded yet.</p>
      )}

      {entries && entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">When</th>
                <th className="py-2 pr-3 font-semibold">Action</th>
                <th className="py-2 pr-3 font-semibold">Student</th>
                <th className="py-2 pr-3 font-semibold">Marks</th>
                <th className="py-2 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionStyles[e.action]}`}>
                      {e.action.charAt(0) + e.action.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    {e.student ? (
                      <>
                        <span className="font-medium">{e.student.registrationNumber}</span>
                        <span className="block text-xs text-muted-foreground">{e.student.fullName}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3">
                    {e.oldMarks ?? "—"} → {e.newMarks ?? "—"}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{e.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}