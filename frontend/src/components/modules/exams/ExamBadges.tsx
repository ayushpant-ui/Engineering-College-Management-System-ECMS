import type { ExamFormStatus, FormWindow, PaymentStatus } from "@/lib/exam-types";

const base = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium";

export function FormStatusBadge({ status }: { status: ExamFormStatus }) {
  const styles: Record<ExamFormStatus, string> = {
    SUBMITTED: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    APPROVED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    REJECTED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };
  const labels: Record<ExamFormStatus, string> = {
    SUBMITTED: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return <span className={`${base} ${styles[status]}`}>{labels[status]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`${base} ${
        status === "PAID"
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {status === "PAID" ? "Paid" : "Unpaid"}
    </span>
  );
}

export function WindowBadge({ window }: { window: FormWindow }) {
  const styles: Record<FormWindow, string> = {
    UPCOMING: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    OPEN: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    CLOSED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  const labels: Record<FormWindow, string> = { UPCOMING: "Opens soon", OPEN: "Form open", CLOSED: "Form closed" };
  return <span className={`${base} ${styles[window]}`}>{labels[window]}</span>;
}