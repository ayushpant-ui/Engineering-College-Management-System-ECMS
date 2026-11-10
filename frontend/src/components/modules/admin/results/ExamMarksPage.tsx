"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, History, Loader2, RefreshCw, Save, Send, TriangleAlert, Undo2 } from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal"; // from the earlier results work
import { resultApi } from "@/lib/result-api";
import { buildEditView } from "@/lib/result-grading";
import type { ExamOverview, GradeBand, SubjectSheet } from "@/lib/result-types";
import MarksGrid from "./MarksGrid";
import ResultHistoryModal from "./ResultHistoryModal";
import { ExamTypeBadge, PublicationBadge } from "./ResultBadges";

type Dialog = { type: "none" } | { type: "save" } | { type: "publish" } | { type: "unpublish" } | { type: "history" };

const message = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Please try again.");

export default function ExamMarksPage({ examId }: { examId: number }) {
  const [overview, setOverview] = useState<ExamOverview | null>(null);
  const [scale, setScale] = useState<GradeBand[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SubjectSheet | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<Dialog>({ type: "none" });
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  // Exam summary + subject progress + grade scale
  useEffect(() => {
    if (!Number.isInteger(examId)) {
      setError("Exam not found.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([resultApi.getOverview(examId), resultApi.getGradeScale()])
      .then(([data, gradeScale]) => {
        if (cancelled) return;
        setOverview(data);
        setScale(gradeScale);
        setSubjectId((current) => current ?? data.subjects[0]?.id ?? null);
      })
      .catch((err) => !cancelled && setError(message(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examId, reloadKey]);

  // Marks sheet of the chosen subject
  useEffect(() => {
    if (subjectId === null) return;
    let cancelled = false;
    setSheetLoading(true);
    resultApi
      .getSubjectSheet(examId, subjectId)
      .then((data) => {
        if (cancelled) return;
        setSheet(data);
        setEdits({});
      })
      .catch((err) => !cancelled && setError(message(err)))
      .finally(() => !cancelled && setSheetLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examId, subjectId, reloadKey]);

  const view = useMemo(() => (sheet ? buildEditView(sheet, edits, scale) : null), [sheet, edits, scale]);
  const dirty = !!view && (view.changed.length > 0 || view.invalidCount > 0);

  // Warn before leaving the page with unsaved marks
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const exam = overview?.exam;
  const published = exam?.status === "PUBLISHED";
  const incompleteSubjects = overview ? overview.subjects.filter((s) => s.enteredCount < s.totalCount).length : 0;
  const anyMarks = overview ? overview.subjects.some((s) => s.enteredCount > 0) || exam?.status === "DRAFT" : false;

  function selectSubject(id: number) {
    if (id === subjectId) return;
    if (dirty && !window.confirm("You have unsaved marks. Discard them?")) return;
    setSheet(null);
    setEdits({});
    setSubjectId(id);
  }

  const close = () => setDialog({ type: "none" });
  const refresh = () => setReloadKey((n) => n + 1);

  async function persist(reason?: string) {
    if (!sheet || !view) return;
    await resultApi.saveMarks(examId, sheet.subject.id, view.changed, reason);
    refresh();
    showToast(`${view.changed.length} mark${view.changed.length === 1 ? "" : "s"} saved.`);
  }

  async function saveClick() {
    if (published) {
      setDialog({ type: "save" }); // changing published results needs a reason
      return;
    }
    setSaving(true);
    try {
      await persist();
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  const back = (
    <Link href="/admin/results" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-4 w-4" />
      All exams
    </Link>
  );

  if (loading) return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />;

  if (!exam || !overview) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        {back}
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error || "Exam not found."}
        </p>
      </div>
    );
  }

  const currentSubject = overview.subjects.find((s) => s.id === subjectId) ?? null;
  const btn = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {back}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">{exam.name}</h1>
            <ExamTypeBadge type={exam.examType} />
            <PublicationBadge status={exam.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {exam.examPeriod.name} · Semester {exam.semester} · {exam.enrolledCount} student{exam.enrolledCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDialog({ type: "history" })} className={`${btn} border hover:bg-muted`}>
            <History className="h-4 w-4" />
            History
          </button>
          {published ? (
            <button onClick={() => setDialog({ type: "unpublish" })} disabled={dirty} className={`${btn} border hover:border-red-400 hover:text-red-600`}>
              <Undo2 className="h-4 w-4" />
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => setDialog({ type: "publish" })}
              disabled={dirty || !anyMarks}
              title={dirty ? "Save your changes first" : !anyMarks ? "Enter some marks first" : undefined}
              className={`${btn} bg-green-600 text-white hover:bg-green-700`}
            >
              <Send className="h-4 w-4" />
              Publish exam
            </button>
          )}
        </div>
      </div>

      {/* What the status means */}
      <p
        className={`rounded-xl px-4 py-3 text-sm ${
          published
            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
            : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        }`}
      >
        {published
          ? `Published${exam.publishedAt ? ` on ${new Date(exam.publishedAt).toLocaleDateString("en-GB", { dateStyle: "long" })}` : ""}. Students can see these results. Any change needs a reason and is recorded in the history.`
          : "Marks you save here are drafts. Students can't see anything until you publish the exam."}
        {exam.examType === "BACKLOG" && " Backlog results replace the earlier result of the same subject when GPA is calculated."}
      </p>

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
          <button onClick={() => { setError(""); refresh(); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Subjects with progress */}
      {overview.subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-14 text-center text-muted-foreground">
          No subjects found for this exam. Check that students are enrolled and a curriculum is set up.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Subjects">
          {overview.subjects.map((s) => {
            const active = s.id === subjectId;
            const done = s.enteredCount === s.totalCount;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectSubject(s.id)}
                className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
                  active ? "border-primary bg-primary/5" : "hover:border-primary"
                }`}
              >
                <span className="block font-medium">{s.code}</span>
                <span className="block text-xs text-muted-foreground">{s.name}</span>
                <span className={`mt-1 block text-xs font-medium ${done ? "text-green-600" : "text-amber-600"}`}>
                  {s.enteredCount}/{s.totalCount} complete
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Marks grid */}
      {sheetLoading && <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />}

      {sheet && view && !sheetLoading && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{sheet.subject.code} · {sheet.subject.name}</span> ·{" "}
              {sheet.rows.length} student{sheet.rows.length === 1 ? "" : "s"}
              {invalidNote(view.invalidCount)}
            </p>
            <div className="flex gap-2">
              {dirty && (
                <button onClick={() => setEdits({})} disabled={saving} className={`${btn} border hover:bg-muted`}>
                  Discard
                </button>
              )}
              <button
                onClick={saveClick}
                disabled={view.changed.length === 0 || view.invalidCount > 0 || saving}
                className={`${btn} bg-primary text-primary-foreground hover:opacity-90`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save{view.changed.length > 0 ? ` (${view.changed.length})` : ""}
              </button>
            </div>
          </div>

          <MarksGrid
            components={sheet.components}
            rows={view.rows}
            onEdit={(key, value) => setEdits((prev) => ({ ...prev, [key]: value }))}
          />

          <p className="text-xs text-muted-foreground">
            Grades shown under each mark are a preview. The system calculates and stores the official grades when you
            save. Press Enter to move to the next student. Leave a box empty if marks aren&apos;t available yet.
          </p>
        </>
      )}

      {/* Dialogs */}
      {dialog.type === "save" && (
        <ConfirmReasonModal
          title="Change published results?"
          description="Students will see the corrected marks immediately, and the change is recorded in the history."
          confirmLabel="Save changes"
          requireReason
          onClose={close}
          onConfirm={async (reason) => {
            await persist(reason);
            close();
          }}
        />
      )}

      {dialog.type === "publish" && (
        <ConfirmReasonModal
          title="Publish this exam?"
          description={
            incompleteSubjects > 0
              ? `${incompleteSubjects} of ${overview.subjects.length} subjects still have missing marks. Publishing makes every saved mark visible to students now. Continue only if the missing ones are intentional.`
              : "Every subject is complete. Students will see their results immediately."
          }
          confirmLabel="Publish"
          onClose={close}
          onConfirm={async () => {
            await resultApi.publish(examId);
            close();
            refresh();
            showToast("Exam published. Students can now see their results.");
          }}
        />
      )}

      {dialog.type === "unpublish" && (
        <ConfirmReasonModal
          title="Unpublish this exam?"
          description="All results of this exam are hidden from students and return to draft."
          confirmLabel="Unpublish"
          requireReason
          danger
          onClose={close}
          onConfirm={async (reason) => {
            await resultApi.unpublish(examId, reason);
            close();
            refresh();
            showToast("Exam unpublished.");
          }}
        />
      )}

      {dialog.type === "history" && (
        <ResultHistoryModal
          examId={examId}
          subjectId={currentSubject?.id ?? null}
          subjectLabel={currentSubject?.code ?? null}
          onClose={close}
        />
      )}
    </div>
  );
}

const invalidNote = (count: number) => (count > 0 ? ` · ${count} value${count === 1 ? "" : "s"} need fixing` : "");