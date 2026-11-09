"use client";

import { useState } from "react";
import Link from "next/link";
import { Circle, CheckCircle2, Clock, Loader2, TriangleAlert } from "lucide-react";

import { examApi } from "@/lib/exam-api";
import { formatDate, formatMoney } from "@/lib/exam-format";
import { getAdmitCardState, type Exam, type ExamForm } from "@/lib/exam-types";
import { FormStatusBadge, PaymentBadge } from "@/components/modules/exams/ExamBadges";

// The payment button below only simulates a payment. Set to false once eSewa is connected.
const PAYMENT_IS_DEMO = true;

const card = "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60";

type Step = { label: string; detail: string; state: "done" | "current" | "pending" | "problem" };

function buildSteps(exam: Exam, form: ExamForm): Step[] {
  const admit = getAdmitCardState(exam, form);
  return [
    { label: "Form submitted", detail: formatDate(form.submittedAt), state: "done" },
    {
      label: "Review by the exam section",
      detail:
        form.status === "APPROVED" ? "Approved" : form.status === "REJECTED" ? "Rejected" : "Waiting for approval",
      state: form.status === "APPROVED" ? "done" : form.status === "REJECTED" ? "problem" : "current",
    },
    {
      label: "Exam fee",
      detail: form.paymentStatus === "PAID" ? `${formatMoney(form.fee)} paid` : `${formatMoney(form.fee)} due`,
      state: form.paymentStatus === "PAID" ? "done" : form.status === "REJECTED" ? "pending" : "current",
    },
    {
      label: "Admit card",
      detail: admit.available ? "Ready to print" : exam.admitCardsReleased ? "Not available yet" : "Not released yet",
      state: admit.available ? "done" : "pending",
    },
  ];
}

const stepIcon = {
  done: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  current: <Clock className="h-5 w-5 text-amber-500" />,
  pending: <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />,
  problem: <TriangleAlert className="h-5 w-5 text-red-500" />,
};

export default function SubmittedFormView({
  exam,
  form,
  onChanged,
}: {
  exam: Exam;
  form: ExamForm;
  onChanged: (form: ExamForm) => void;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const admit = getAdmitCardState(exam, form);
  const canPay = form.paymentStatus === "UNPAID" && form.status !== "REJECTED";

  async function pay() {
    setPaying(true);
    setError("");
    try {
      onChanged(await examApi.payForm(form.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  const details = [
    { label: "Full name", value: form.studentName },
    { label: "Registration number", value: form.registrationNumber },
    { label: "Department", value: form.department },
    { label: "Semester", value: String(form.semester) },
    { label: "Mobile number", value: form.phone },
    { label: "Symbol number", value: form.symbolNumber ?? "Assigned after approval" },
  ];

  return (
    <div className="space-y-6">
      <section className={card}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-lg font-bold">Your form</h2>
          <FormStatusBadge status={form.status} />
          <PaymentBadge status={form.paymentStatus} />
        </div>

        {form.status === "REJECTED" && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            Your form was rejected{form.remark ? `: ${form.remark}` : "."} Please contact the exam section.
          </p>
        )}

        <ol className="mt-5 space-y-4">
          {buildSteps(exam, form).map((step) => (
            <li key={step.label} className="flex items-start gap-3">
              <span className="mt-0.5">{stepIcon[step.state]}</span>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canPay && (
            <button
              onClick={pay}
              disabled={paying}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {paying && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay {formatMoney(form.fee)}
            </button>
          )}
          {admit.available && (
            <Link
              href={`/student/admit-card/${exam.id}`}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              View admit card
            </Link>
          )}
        </div>
        {canPay && PAYMENT_IS_DEMO && (
          <p className="mt-3 text-xs text-muted-foreground">
            Demo mode: online payment isn&apos;t connected yet, so this button only records the fee as paid.
          </p>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      <section className={card}>
        <h2 className="font-serif text-lg font-bold">Form details</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 text-sm font-semibold">Subjects</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {exam.subjects.map((s) => (
            <li key={s.id}>
              {s.code} — {s.name}
            </li>
          ))}
          {form.backPapers.map((b) => (
            <li key={b.code}>
              {b.code} — {b.name} <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Back paper</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}