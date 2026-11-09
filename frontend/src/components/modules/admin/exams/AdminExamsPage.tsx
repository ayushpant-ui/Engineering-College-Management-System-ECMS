"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Pencil, Plus, RefreshCw, Trash2, TriangleAlert } from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import { WindowBadge } from "@/components/modules/exams/ExamBadges";
import { examApi } from "@/lib/exam-api";
import { formatDate, formatMoney } from "@/lib/exam-format";
import { getFormWindow, type Exam } from "@/lib/exam-types";
import ExamEditorModal from "./ExamEditorModal";

type Dialog = { type: "none" } | { type: "editor"; exam: Exam | null } | { type: "delete"; exam: Exam };

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState<Dialog>({ type: "none" });
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    examApi
      .listExams()
      .then((data) => !cancelled && setExams(data))
      .catch(() => !cancelled && setError("Could not load exams."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const refresh = () => setAttempt((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create exams, set the form period and fees, then review forms and release admit cards.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "editor", exam: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Exam
        </button>
      </div>

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={refresh} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Exam</th>
              <th className="px-4 py-3 font-semibold">Semester</th>
              <th className="px-4 py-3 font-semibold">Form period</th>
              <th className="px-4 py-3 font-semibold">Fee</th>
              <th className="px-4 py-3 font-semibold">Admit cards</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && exams.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-slate-400">
                  No exams yet. Create the first one.
                </td>
              </tr>
            )}

            {!loading &&
              exams.map((exam) => (
                <tr key={exam.id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3">
                    <Link href={`/admin/exams/${exam.id}`} className="font-medium hover:text-primary hover:underline">
                      {exam.name}
                    </Link>
                    <p className="text-xs text-slate-400">Exam starts {formatDate(exam.examStartsAt)}</p>
                  </td>
                  <td className="px-4 py-3">{exam.semester}</td>
                  <td className="px-4 py-3">
                    <WindowBadge window={getFormWindow(exam)} />
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(exam.formOpensAt)} – {formatDate(exam.formClosesAt)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatMoney(exam.fee)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        exam.admitCardsReleased
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {exam.admitCardsReleased ? "Released" : "Not released"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => setDialog({ type: "editor", exam })}
                        aria-label={`Edit ${exam.name}`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDialog({ type: "delete", exam })}
                        aria-label={`Delete ${exam.name}`}
                        title="Delete"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {dialog.type === "editor" && (
        <ExamEditorModal
          exam={dialog.exam}
          onClose={close}
          onSaved={(_, isEdit) => {
            close();
            refresh();
            showToast(isEdit ? "Exam updated." : "Exam created.");
          }}
        />
      )}

      {dialog.type === "delete" && (
        <ConfirmReasonModal
          title="Delete this exam?"
          description={`"${dialog.exam.name}" will be removed. Exams that already have submitted forms can't be deleted.`}
          confirmLabel="Delete"
          danger
          onClose={close}
          onConfirm={async () => {
            await examApi.deleteExam(dialog.exam.id);
            close();
            refresh();
            showToast("Exam deleted.");
          }}
        />
      )}
    </div>
  );
}