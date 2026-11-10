"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/modules/admin/Modal";
import { resultApi } from "@/lib/result-api";
import type { AuditEntry, ResultAction } from "@/lib/result-types";

const styles: Record<ResultAction, string> = {
  CREATE: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PUBLISH: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  UNPUBLISH: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  RECOGNIZE: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

export default function ResultHistoryModal({
  examId,
  subjectId,
  subjectLabel,
  onClose,
}: {
  examId: number;
  subjectId: number | null;
  subjectLabel: string | null;
  onClose: () => void;
}) {
  const [scope, setScope] = useState<"subject" | "exam">(subjectId ? "subject" : "exam");
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError("");
    resultApi
      .listAudit(examId, scope === "subject" && subjectId ? subjectId : undefined)
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setError("Could not load the history."));
    return () => {
      cancelled = true;
    };
  }, [examId, subjectId, scope]);

  return (
    <Modal title="Change history" onClose={onClose} wide>
      {subjectId && (
        <div className="mb-4 flex gap-2">
          {(["subject", "exam"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setScope(value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                scope === value ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
              }`}
            >
              {value === "subject" ? subjectLabel ?? "This subject" : "Whole exam"}
            </button>
          ))}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {!error && entries === null && <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
      {entries && entries.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No changes recorded yet.</p>}

      {entries && entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">When</th>
                <th className="py-2 pr-3 font-semibold">Action</th>
                <th className="py-2 pr-3 font-semibold">Student / subject</th>
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
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[e.action]}`}>
                      {e.action.charAt(0) + e.action.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    {e.student ? (
                      <>
                        <span className="font-medium">{e.student.registrationNumber}</span>
                        <span className="block text-xs text-muted-foreground">
                          {e.subject?.code} {e.componentType && `· ${e.componentType.toLowerCase()}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Whole exam</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3">
                    {e.student ? `${e.oldMarks ?? "—"} → ${e.newMarks ?? "—"}` : "—"}
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