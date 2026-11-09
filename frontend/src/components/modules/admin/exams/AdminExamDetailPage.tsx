"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import { FormStatusBadge, PaymentBadge, WindowBadge } from "@/components/modules/exams/ExamBadges";
import { examApi } from "@/lib/exam-api";
import { formatDate, formatMoney } from "@/lib/exam-format";
import { getFormWindow, type Exam, type ExamForm, type ExamFormStatus, type PaymentStatus } from "@/lib/exam-types";

type Dialog =
  | { type: "none" }
  | { type: "reject"; form: ExamForm }
  | { type: "markPaid"; form: ExamForm }
  | { type: "release" }
  | { type: "revoke" };

const message = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Please try again.");

export default function AdminExamDetailPage({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [forms, setForms] = useState<ExamForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ExamFormStatus>("");
  const [paymentFilter, setPaymentFilter] = useState<"" | PaymentStatus>("");
  const [selected, setSelected] = useState<string[]>([]);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
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
    Promise.all([examApi.getExam(examId), examApi.listExamForms(examId)])
      .then(([loadedExam, loadedForms]) => {
        if (cancelled) return;
        setExam(loadedExam);
        setForms(loadedForms);
        setSelected([]);
      })
      .catch((err) => !cancelled && setError(message(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examId, attempt]);

  const refresh = () => setAttempt((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  const stats = useMemo(
    () => ({
      total: forms.length,
      pending: forms.filter((f) => f.status === "SUBMITTED").length,
      approved: forms.filter((f) => f.status === "APPROVED").length,
      paid: forms.filter((f) => f.paymentStatus === "PAID").length,
      ready: forms.filter((f) => f.status === "APPROVED" && f.paymentStatus === "PAID").length,
    }),
    [forms]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return forms.filter(
      (f) =>
        (!statusFilter || f.status === statusFilter) &&
        (!paymentFilter || f.paymentStatus === paymentFilter) &&
        (!q || f.studentName.toLowerCase().includes(q) || f.registrationNumber.toLowerCase().includes(q))
    );
  }, [forms, search, statusFilter, paymentFilter]);

  const selectable = visible.filter((f) => f.status === "SUBMITTED");
  const allSelected = selectable.length > 0 && selectable.every((f) => selected.includes(f.id));

  function toggleAll() {
    setSelected(allSelected ? [] : selectable.map((f) => f.id));
  }
  function toggleOne(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function approve(form: ExamForm) {
    setBusyId(form.id);
    try {
      await examApi.reviewForm(form.id, "APPROVED");
      refresh();
      showToast(`${form.studentName}'s form approved.`);
    } catch (err) {
      setError(message(err));
    } finally {
      setBusyId(null);
    }
  }

  async function approveSelected() {
    setBulkBusy(true);
    try {
      const count = await examApi.approveMany(selected);
      refresh();
      showToast(`${count} form${count === 1 ? "" : "s"} approved.`);
    } catch (err) {
      setError(message(err));
    } finally {
      setBulkBusy(false);
    }
  }

  if (loading && !exam) {
    return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />;
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Link href="/admin/exams" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          All exams
        </Link>
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error || "Exam not found."}
        </p>
      </div>
    );
  }

  const cards = [
    { label: "Forms submitted", value: stats.total },
    { label: "Pending review", value: stats.pending },
    { label: "Approved", value: stats.approved },
    { label: "Fee paid", value: stats.paid },
    { label: "Admit card ready", value: stats.ready },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/admin/exams" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        All exams
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">{exam.name}</h1>
            <WindowBadge window={getFormWindow(exam)} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Semester {exam.semester} · Form {formatDate(exam.formOpensAt)} – {formatDate(exam.formClosesAt)} · Exam starts{" "}
            {formatDate(exam.examStartsAt)} · {formatMoney(exam.fee)}
          </p>
        </div>

        {exam.admitCardsReleased ? (
          <button
            onClick={() => setDialog({ type: "revoke" })}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:border-red-400 hover:text-red-600"
          >
            Hide admit cards
          </button>
        ) : (
          <button
            onClick={() => setDialog({ type: "release" })}
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Release admit cards
          </button>
        )}
      </div>

      {exam.admitCardsReleased && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          Admit cards are released. {stats.ready} student{stats.ready === 1 ? "" : "s"} (approved and paid) can view and print theirs.
        </p>
      )}

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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or registration no..."
            aria-label="Search forms"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | ExamFormStatus)} aria-label="Filter by review status" className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
          <option value="">All review statuses</option>
          <option value="SUBMITTED">Pending review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as "" | PaymentStatus)} aria-label="Filter by payment" className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
          <option value="">All payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>

        {selected.length > 0 && (
          <button
            onClick={approveSelected}
            disabled={bulkBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve selected ({selected.length})
          </button>
        )}
      </div>

      {/* Forms table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={selectable.length === 0} aria-label="Select all pending forms" />
              </th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Back papers</th>
              <th className="px-4 py-3 font-semibold">Fee</th>
              <th className="px-4 py-3 font-semibold">Review</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Symbol no.</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-slate-400">
                  {forms.length === 0 ? "No forms have been submitted yet." : "No forms match your filters."}
                </td>
              </tr>
            )}

            {visible.map((form) => (
              <tr key={form.id} className="text-slate-700 dark:text-slate-200">
                <td className="px-4 py-3">
                  {form.status === "SUBMITTED" && (
                    <input type="checkbox" checked={selected.includes(form.id)} onChange={() => toggleOne(form.id)} aria-label={`Select ${form.studentName}`} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{form.studentName}</p>
                  <p className="text-xs text-slate-400">{form.registrationNumber}</p>
                </td>
                <td className="px-4 py-3" title={form.backPapers.map((b) => `${b.code} ${b.name}`).join(", ")}>
                  {form.backPapers.length === 0 ? "—" : form.backPapers.map((b) => b.code).join(", ")}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatMoney(form.fee)}</td>
                <td className="px-4 py-3">
                  <FormStatusBadge status={form.status} />
                  {form.status === "REJECTED" && form.remark && (
                    <p className="mt-1 max-w-[220px] text-xs text-slate-400">{form.remark}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <PaymentBadge status={form.paymentStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{form.symbolNumber ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {form.status !== "APPROVED" && (
                      <button
                        onClick={() => approve(form)}
                        disabled={busyId === form.id}
                        title="Approve"
                        aria-label={`Approve ${form.studentName}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:hover:bg-green-500/10"
                      >
                        {busyId === form.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                    )}
                    {form.status !== "REJECTED" && (
                      <button
                        onClick={() => setDialog({ type: "reject", form })}
                        title="Reject"
                        aria-label={`Reject ${form.studentName}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {form.paymentStatus === "UNPAID" && form.status !== "REJECTED" && (
                      <button
                        onClick={() => setDialog({ type: "markPaid", form })}
                        title="Record a cash / bank payment"
                        aria-label={`Record payment for ${form.studentName}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10"
                      >
                        <Banknote className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      {dialog.type === "reject" && (
        <ConfirmReasonModal
          title="Reject this form?"
          description={`${dialog.form.studentName} will see your remark and won't be able to get an admit card until it's sorted out.`}
          confirmLabel="Reject form"
          requireReason
          danger
          onClose={close}
          onConfirm={async (remark) => {
            await examApi.reviewForm(dialog.form.id, "REJECTED", remark);
            close();
            refresh();
            showToast("Form rejected.");
          }}
        />
      )}

      {dialog.type === "markPaid" && (
        <ConfirmReasonModal
          title="Record a payment?"
          description={`Mark ${dialog.form.studentName}'s fee of ${formatMoney(dialog.form.fee)} as paid. Use this for cash or bank payments, and note the receipt number.`}
          confirmLabel="Mark as paid"
          requireReason
          onClose={close}
          onConfirm={async (note) => {
            await examApi.markPaid(dialog.form.id, note);
            close();
            refresh();
            showToast("Payment recorded.");
          }}
        />
      )}

      {dialog.type === "release" && (
        <ConfirmReasonModal
          title="Release admit cards?"
          description={`${stats.ready} student${stats.ready === 1 ? " is" : "s are"} approved and paid, and will be able to view and print their admit card immediately.`}
          confirmLabel="Release"
          onClose={close}
          onConfirm={async () => {
            await examApi.setAdmitCardsReleased(exam.id, true);
            close();
            refresh();
            showToast("Admit cards released.");
          }}
        />
      )}

      {dialog.type === "revoke" && (
        <ConfirmReasonModal
          title="Hide admit cards?"
          description="Students will no longer be able to open their admit card until you release them again."
          confirmLabel="Hide admit cards"
          danger
          onClose={close}
          onConfirm={async () => {
            await examApi.setAdmitCardsReleased(exam.id, false);
            close();
            refresh();
            showToast("Admit cards hidden.");
          }}
        />
      )}
    </div>
  );
}