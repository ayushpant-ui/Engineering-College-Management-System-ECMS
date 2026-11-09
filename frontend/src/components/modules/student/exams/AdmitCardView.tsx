"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { getStudentInfo } from "@/hooks/useStudentExamData";
import { examApi } from "@/lib/exam-api";
import { getAdmitCardState, type AdmitCardState, type Exam, type ExamForm, type StudentInfo } from "@/lib/exam-types";
import AdmitCardSheet from "./AdmitCardSheet";

export default function AdmitCardView({ examId }: { examId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [form, setForm] = useState<ExamForm | null>(null);
  const [state, setState] = useState<AdmitCardState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const info = getStudentInfo();
    if (!info) {
      router.replace("/login"); // change if your login route is different
      return;
    }
    setStudent(info);

    let cancelled = false;
    Promise.all([examApi.getExam(examId), examApi.getMyForm(examId, info.id)])
      .then(([loadedExam, myForm]) => {
        if (cancelled) return;
        setExam(loadedExam);
        setForm(myForm);
        setState(getAdmitCardState(loadedExam, myForm));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the admit card."));

    return () => {
      cancelled = true;
    };
  }, [examId, router]);

  const back = (
    <Link href="/student/admit-card" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary print:hidden">
      <ArrowLeft className="h-4 w-4" />
      All admit cards
    </Link>
  );

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {back}
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  if (!exam || !state) {
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />;
  }

  if (!state.available || !form) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {back}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <p className="font-semibold">Your admit card isn&apos;t available yet</p>
          <p className="mt-1">{state.available ? "No exam form found." : state.reason}</p>
          <Link href={`/student/exam-form/${exam.id}`} className="mt-3 inline-block font-semibold underline">
            Go to the exam form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 print:hidden">
        {back}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <AdmitCardSheet exam={exam} form={form} photoUrl={student?.photoUrl} />

      <p className="mx-auto max-w-3xl text-center text-xs text-muted-foreground print:hidden">
        In the print window, choose &ldquo;Save as PDF&rdquo; to download a copy.
      </p>
    </div>
  );
}