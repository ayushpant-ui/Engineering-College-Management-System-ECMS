"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { getStudentInfo } from "@/hooks/useStudentExamData";
import { examApi } from "@/lib/exam-api";
import { formatDate, formatMoney } from "@/lib/exam-format";
import {
  getFormWindow,
  type BackPaper,
  type Exam,
  type ExamForm,
  type StudentInfo,
} from "@/lib/exam-types";
import { WindowBadge } from "@/components/modules/exams/ExamBadges";
import ExamFormEditor from "./ExamFormEditor";
import SubmittedFormView from "./SubmittedFormView";
import EsewaPayment from "@/components/modules/student/exams/EsewaPayment";

export default function ExamFormPage({ examId }: { examId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [form, setForm] = useState<ExamForm | null>(null);
  const [options, setOptions] = useState<BackPaperList>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    const info = getStudentInfo();
    if (!info) {
      router.replace("/login"); // change if your login route is different
      return;
    }
    setStudent(info);

    let cancelled = false;
    (async () => {
      try {
        const loadedExam = await examApi.getExam(examId);
        const [myForm, backPapers] = await Promise.all([
          examApi.getMyForm(examId, info.id),
          examApi.getBackPaperOptions(loadedExam),
        ]);
        if (cancelled) return;
        setExam(loadedExam);
        setForm(myForm);
        setOptions(backPapers);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load this exam.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examId, router]);

  const back = (
    <Link
      href="/student/exam-form"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      All exams
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <div className="h-6 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !exam || !student) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {back}
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error || "Exam not found."}
        </p>
      </div>
    );
  }

  const window = getFormWindow(exam);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {back}

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">
            {exam.name}
          </h1>
          {!form && <WindowBadge window={window} />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Semester {exam.semester} · Exam starts {formatDate(exam.examStartsAt)}{" "}
          · Fee {formatMoney(exam.fee)}
        </p>
      </div>

      {justSubmitted && form && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Your exam form has been submitted. Pay the fee below to complete it.
        </div>
      )}

      {form ? (
        <div className="space-y-6">
          <SubmittedFormView exam={exam} form={form} onChanged={setForm} />

          {form.status === "APPROVED" && form.paymentStatus === "UNPAID" && (
            <EsewaPayment applicationId={form.id} amount={exam.fee} />
          )}
        </div>
      ) : window === "OPEN" ? (
        <ExamFormEditor
          exam={exam}
          student={student}
          backPaperOptions={options}
          onSubmitted={(submitted) => {
            setForm(submitted);
            setJustSubmitted(true);
            globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
          }}
        />
      ) : (
        <div className="rounded-2xl border border-dashed py-14 text-center text-muted-foreground">
          {window === "UPCOMING"
            ? `The form opens on ${formatDate(exam.formOpensAt)}.`
            : `The form closed on ${formatDate(exam.formClosesAt)}. Please contact the exam section if you missed it.`}
        </div>
      )}
    </div>
  );
}

type BackPaperList = BackPaper[];
