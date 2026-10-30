"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  History,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Send,
  Undo2,
  TriangleAlert,
} from "lucide-react";

import { adminFetch, AdminApiError } from "@/lib/admin-api";
import { parseMarks, type RowStatus, type Sheet, type Subject } from "@/lib/admin-results";
import ConfirmReasonModal from "./ConfirmReasonModal";
import HistoryModal from "./HistoryModal";
import SubjectFormModal from "./SubjectFormModal";

const statusStyles: Record<RowStatus, string> = {
  NOT_ENTERED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  DRAFT: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PUBLISHED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};
const statusLabels: Record<RowStatus, string> = {
  NOT_ENTERED: "Not entered",
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

type Dialog =
  | { type: "none" }
  | { type: "subject"; subject: Subject | null }
  | { type: "history" }
  | { type: "save" } // reason required: touches published results
  | { type: "publish" }
  | { type: "unpublish" };

const message = (err: unknown) => (err instanceof AdminApiError ? err.message : "Something went wrong. Please try again.");

export default function AdminResultsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [edits, setEdits] = useState<Record<number, string>>({}); // studentId -> what was typed
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<Dialog>({ type: "none" });
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  // ── Load subjects once ──
  useEffect(() => {
    let cancelled = false;
    adminFetch<Subject[]>("/admin/results/subjects")
      .then((data) => !cancelled && setSubjects(data))
      .catch((err) => !cancelled && setError(message(err)))
      .finally(() => !cancelled && setSubjectsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load the marks sheet for the selected subject ──
  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    setSheetLoading(true);
    setError("");
    adminFetch<Sheet>(`/admin/results/subjects/${selectedId}/sheet`)
      .then((data) => {
        if (!cancelled) {
          setSheet(data);
          setEdits({});
        }
      })
      .catch((err) => !cancelled && setError(message(err)))
      .finally(() => !cancelled && setSheetLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId, reloadKey]);

  // ── Work out what changed ──
  const fullMarks = sheet?.subject.fullMarks ?? 100;

  const view = useMemo(
    () =>
      (sheet?.rows ?? []).map((row, index) => {
        const raw = edits[row.studentId];
        const edited = raw !== undefined;
        const parsed = edited ? parseMarks(raw, fullMarks) : { value: row.marks, error: undefined };
        return {
          ...row,
          index,
          raw: raw ?? (row.marks === null ? "" : String(row.marks)),
          error: parsed.error,
          value: parsed.value,
          changed: edited && !parsed.error && parsed.value !== row.marks,
        };
      }),
    [sheet, edits, fullMarks]
  );

  const changed = view.filter((r) => r.changed);
  const invalidCount = view.filter((r) => r.error).length;
  const draftCount = view.filter((r) => r.status === "DRAFT").length;
  const publishedCount = view.filter((r) => r.status === "PUBLISHED").length;
  const enteredCount = view.filter((r) => r.marks !== null).length;
  const touchesPublished = changed.some((r) => r.status === "PUBLISHED");
  const dirty = changed.length > 0 || invalidCount > 0;

  // Warn before leaving the page with unsaved marks
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function selectSubject(id: number | null) {
    if (dirty && !window.confirm("You have unsaved marks. Discard them?")) return;
    setSheet(null);
    setEdits({});
    setSelectedId(id);
  }

  // ── Actions ──
  async function save(reason?: string) {
    if (!sheet) return;
    setSaving(true);
    try {
      await adminFetch(`/admin/results/subjects/${sheet.subject.id}/marks`, {
        method: "PUT",
        body: JSON.stringify({
          entries: changed.map((r) => ({ studentId: r.studentId, marks: r.value })),
          ...(reason ? { reason } : {}),
        }),
      });
      setDialog({ type: "none" });
      setReloadKey((n) => n + 1);
      showToast(`${changed.length} mark${changed.length === 1 ? "" : "s"} saved.`);
    } catch (err) {
      if (dialog.type === "save") throw err; // let the reason dialog show it
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!sheet) return;
    try {
      const res = await adminFetch<{ published: number }>(`/admin/results/subjects/${sheet.subject.id}/publish`, {
        method: "POST",
      });
      setDialog({ type: "none" });
      setReloadKey((n) => n + 1);
      showToast(`${res.published} result${res.published === 1 ? "" : "s"} published to students.`);
    } catch (err) {
      throw new Error(message(err));
    }
  }

  async function unpublish(reason: string) {
    if (!sheet) return;
    try {
      const res = await adminFetch<{ unpublished: number }>(`/admin/results/subjects/${sheet.subject.id}/unpublish`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setDialog({ type: "none" });
      setReloadKey((n) => n + 1);
      showToast(`${res.unpublished} result${res.unpublished === 1 ? "" : "s"} moved back to draft.`);
    } catch (err) {
      throw new Error(message(err));
    }
  }

  function handleSubjectSaved(subject: Subject, isEdit: boolean) {
    setSubjects((prev) =>
      (isEdit ? prev.map((s) => (s.id === subject.id ? subject : s)) : [...prev, subject]).sort(
        (a, b) => a.semester - b.semester || a.code.localeCompare(b.code)
      )
    );
    setDialog({ type: "none" });
    showToast(isEdit ? "Subject updated." : "Subject created.");
    if (isEdit) setReloadKey((n) => n + 1);
    else {
      setSheet(null);
      setEdits({});
      setSelectedId(subject.id);
    }
  }

  const bySemester = useMemo(() => {
    const groups = new Map<number, Subject[]>();
    for (const s of subjects) groups.set(s.semester, [...(groups.get(s.semester) ?? []), s]);
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [subjects]);

  const currentSubject = sheet?.subject ?? subjects.find((s) => s.id === selectedId) ?? null;
  const btn =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter marks as drafts, then publish when they&apos;re final. Students only see published results.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "subject", subject: null })}
          className={`${btn} border hover:bg-muted`}
        >
          <Plus className="h-4 w-4" />
          New Subject
        </button>
      </div>

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {/* Subject picker */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] flex-1 sm:max-w-md">
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
            Subject
          </label>
          <select
            id="subject"
            value={selectedId ?? ""}
            onChange={(e) => selectSubject(e.target.value ? Number(e.target.value) : null)}
            disabled={subjectsLoading}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{subjectsLoading ? "Loading subjects..." : "Select a subject"}</option>
            {bySemester.map(([semester, list]) => (
              <optgroup key={semester} label={`Semester ${semester}`}>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name} ({s.department})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {currentSubject && (
          <>
            <button onClick={() => setDialog({ type: "subject", subject: currentSubject })} className={`${btn} border hover:bg-muted`}>
              <Pencil className="h-4 w-4" />
              Edit subject
            </button>
            <button onClick={() => setDialog({ type: "history" })} className={`${btn} border hover:bg-muted`}>
              <History className="h-4 w-4" />
              History
            </button>
          </>
        )}
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          {selectedId !== null && (
            <button
              onClick={() => setReloadKey((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {selectedId === null && !subjectsLoading && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          {subjects.length === 0
            ? "No subjects yet. Create the first one to start entering marks."
            : "Choose a subject to enter or review marks."}
        </div>
      )}

      {sheetLoading && <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />}

      {sheet && !sheetLoading && (
        <>
          {/* Summary + actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Semester {sheet.subject.semester} · Full marks {sheet.subject.fullMarks} · {view.length} student
              {view.length === 1 ? "" : "s"} · {enteredCount} entered · {draftCount} draft · {publishedCount} published
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => (touchesPublished ? setDialog({ type: "save" }) : save())}
                disabled={changed.length === 0 || invalidCount > 0 || saving}
                className={`${btn} bg-primary text-primary-foreground hover:opacity-90`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save{changed.length > 0 ? ` (${changed.length})` : ""}
              </button>
              <button
                onClick={() => setDialog({ type: "publish" })}
                disabled={dirty || draftCount === 0}
                title={dirty ? "Save your changes first" : undefined}
                className={`${btn} bg-green-600 text-white hover:bg-green-700`}
              >
                <Send className="h-4 w-4" />
                Publish{draftCount > 0 ? ` (${draftCount})` : ""}
              </button>
              <button
                onClick={() => setDialog({ type: "unpublish" })}
                disabled={dirty || publishedCount === 0}
                title={dirty ? "Save your changes first" : undefined}
                className={`${btn} border hover:bg-muted`}
              >
                <Undo2 className="h-4 w-4" />
                Unpublish
              </button>
            </div>
          </div>

          {invalidCount > 0 && (
            <p role="alert" className="text-sm text-red-500">
              Fix the highlighted marks before saving.
            </p>
          )}

          {/* Marks grid */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Registration No.</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Marks / {sheet.subject.fullMarks}</th>
                  <th className="px-4 py-3 font-semibold">%</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {view.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-slate-400">
                      No students found for this subject&apos;s semester.
                    </td>
                  </tr>
                )}
                {view.map((row) => (
                  <tr key={row.studentId} className={row.changed ? "bg-amber-50/70 dark:bg-amber-500/5" : ""}>
                    <td className="px-4 py-2.5 text-slate-400">{row.index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium">{row.registrationNumber}</td>
                    <td className="px-4 py-2.5">{row.fullName}</td>
                    <td className="px-4 py-2.5">
                      <input
                        data-row={row.index}
                        inputMode="decimal"
                        value={row.raw}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [row.studentId]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            document.querySelector<HTMLInputElement>(`[data-row="${row.index + 1}"]`)?.focus();
                          }
                        }}
                        aria-label={`Marks for ${row.fullName}`}
                        aria-invalid={!!row.error}
                        className={`w-24 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none transition focus:ring-2 ${
                          row.error
                            ? "border-red-400 focus:ring-red-400/30"
                            : "border-border focus:border-primary focus:ring-primary/30"
                        }`}
                      />
                      {row.error && <p className="mt-1 text-xs text-red-500">{row.error}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                      {row.value !== null ? `${((row.value / fullMarks) * 100).toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}>
                        {statusLabels[row.status]}
                      </span>
                      {row.changed && <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">edited</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: press Enter to jump to the next student. Leave a cell empty if marks aren&apos;t available yet.
          </p>
        </>
      )}

      {/* Dialogs */}
      {dialog.type === "subject" && (
        <SubjectFormModal subject={dialog.subject} onClose={() => setDialog({ type: "none" })} onSaved={handleSubjectSaved} />
      )}

      {dialog.type === "history" && currentSubject && (
        <HistoryModal
          subjectId={currentSubject.id}
          subjectLabel={`${currentSubject.code} ${currentSubject.name}`}
          onClose={() => setDialog({ type: "none" })}
        />
      )}

      {dialog.type === "save" && (
        <ConfirmReasonModal
          title="Change published results?"
          description="Some of these marks are already visible to students. Students will see the corrected marks immediately, and the change will be recorded in the audit log."
          confirmLabel="Save changes"
          requireReason
          onConfirm={save}
          onClose={() => setDialog({ type: "none" })}
        />
      )}

      {dialog.type === "publish" && (
        <ConfirmReasonModal
          title="Publish results?"
          description={`${draftCount} draft result${draftCount === 1 ? "" : "s"} will become visible to the students. Students without marks entered stay hidden.`}
          confirmLabel="Publish"
          onConfirm={publish}
          onClose={() => setDialog({ type: "none" })}
        />
      )}

      {dialog.type === "unpublish" && (
        <ConfirmReasonModal
          title="Unpublish results?"
          description={`${publishedCount} published result${publishedCount === 1 ? "" : "s"} will be hidden from students and return to draft.`}
          confirmLabel="Unpublish"
          requireReason
          danger
          onConfirm={unpublish}
          onClose={() => setDialog({ type: "none" })}
        />
      )}
    </div>
  );
}