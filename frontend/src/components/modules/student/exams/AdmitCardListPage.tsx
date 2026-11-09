"use client";

import Link from "next/link";
import { RefreshCw, Ticket, TriangleAlert } from "lucide-react";

import { useStudentExamData } from "@/hooks/useStudentExamData";
import { formatDate } from "@/lib/exam-format";
import { getAdmitCardState } from "@/lib/exam-types";

export default function AdmitCardListPage() {
  const { exams, forms, loading, error, reload } = useStudentExamData();
  const formsByExam = new Map(forms.map((f) => [f.examId, f]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">Admit Card</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your admit card is available once your exam form is approved, the fee is paid and the college releases it.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={reload} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {loading && <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />}

      {!loading && !error && exams.length === 0 && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          There are no exams for your semester yet.
        </div>
      )}

      {!loading &&
        exams.map((exam) => {
          const admit = getAdmitCardState(exam, formsByExam.get(exam.id) ?? null);

          return (
            <article
              key={exam.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Ticket className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold">{exam.name}</h2>
                  <p className="text-sm text-muted-foreground">Exam starts {formatDate(exam.examStartsAt)}</p>
                  {!admit.available && <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{admit.reason}</p>}
                </div>
              </div>

              {admit.available ? (
                <Link
                  href={`/student/admit-card/${exam.id}`}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  View admit card
                </Link>
              ) : (
                admit.action && (
                  <Link
                    href={`/student/exam-form/${exam.id}`}
                    className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
                  >
                    {admit.action === "PAY" ? "Pay fee" : "Open exam form"}
                  </Link>
                )
              )}
            </article>
          );
        })}
    </div>
  );
}