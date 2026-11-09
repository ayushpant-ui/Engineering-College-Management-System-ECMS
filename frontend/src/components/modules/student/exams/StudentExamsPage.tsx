"use client";

import Link from "next/link";
import { CalendarDays, RefreshCw, Wallet, TriangleAlert } from "lucide-react";

import { useStudentExamData } from "@/hooks/useStudentExamData";
import { formatDate, formatMoney } from "@/lib/exam-format";
import { getAdmitCardState, getFormWindow } from "@/lib/exam-types";
import { FormStatusBadge, PaymentBadge, WindowBadge } from "@/components/modules/exams/ExamBadges";

export default function StudentExamsPage() {
  const { exams, forms, loading, error, reload } = useStudentExamData();
  const formsByExam = new Map(forms.map((f) => [f.examId, f]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">Exam Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill your exam form, pay the fee and track its approval. Once approved and paid, your admit card appears
          here when it is released.
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

      {loading && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!loading && !error && exams.length === 0 && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          No exams are open for your semester right now.
        </div>
      )}

      {!loading &&
        exams.map((exam) => {
          const form = formsByExam.get(exam.id) ?? null;
          const window = getFormWindow(exam);
          const admit = getAdmitCardState(exam, form);

          return (
            <article
              key={exam.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-lg font-bold">{exam.name}</h2>
                    {form ? (
                      <>
                        <FormStatusBadge status={form.status} />
                        <PaymentBadge status={form.paymentStatus} />
                      </>
                    ) : (
                      <WindowBadge window={window} />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Semester {exam.semester}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form ? (
                    <>
                      <Link
                        href={`/student/exam-form/${exam.id}`}
                        className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
                      >
                        {form.status === "APPROVED" && form.paymentStatus === "UNPAID" ? "Pay fee" : "View form"}
                      </Link>
                      {admit.available && (
                        <Link
                          href={`/student/admit-card/${exam.id}`}
                          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                        >
                          Admit card
                        </Link>
                      )}
                    </>
                  ) : window === "OPEN" ? (
                    <Link
                      href={`/student/exam-form/${exam.id}`}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                      Fill exam form
                    </Link>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {window === "UPCOMING" ? `Opens ${formatDate(exam.formOpensAt)}` : "Form closed"}
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Form period</dt>
                    <dd className="text-foreground">
                      {formatDate(exam.formOpensAt)} – {formatDate(exam.formClosesAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Exam starts</dt>
                    <dd className="text-foreground">{formatDate(exam.examStartsAt)}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4 shrink-0" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Exam fee</dt>
                    <dd className="text-foreground">
                      {formatMoney(exam.fee)} <span className="text-muted-foreground">+ {formatMoney(exam.backPaperFee)} per back paper</span>
                    </dd>
                  </div>
                </div>
              </dl>
            </article>
          );
        })}
    </div>
  );
}