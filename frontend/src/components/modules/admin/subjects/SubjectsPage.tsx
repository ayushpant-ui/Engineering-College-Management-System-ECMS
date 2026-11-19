"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, RefreshCw, Search, Trash2, TriangleAlert } from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import ComponentChips from "@/components/modules/admin/curricula/ComponentChips";
import { curriculumApi } from "@/lib/curriculum-api";
import type { Subject } from "@/lib/curriculum-types";
import SubjectFormModal from "./SubjectFormModal";

type Dialog = { type: "none" } | { type: "form"; subject: Subject | null } | { type: "delete"; subject: Subject };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
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

  curriculumApi
    .listSubjects()
    .then((data) => {
      console.log("Subjects API response:", data);

      if (!cancelled) {
        setSubjects(data);
      }
    })
    .catch((error) => {
      console.error("Failed to load subjects:", error);

      if (!cancelled) {
        setError(error.message || "Could not load subjects.");
      }
    })
    .finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, [attempt]);
  // useEffect(() => {
  //   let cancelled = false;
  //   setLoading(true);
  //   setError("");
  //   curriculumApi
  //     .listSubjects()
  //     .then((data) => !cancelled && setSubjects(data))
  //     .catch(() => !cancelled && setError("Could not load subjects."))
  //     .finally(() => !cancelled && setLoading(false));
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [attempt]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter((s) => !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [subjects, search]);

  const refresh = () => setAttempt((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The catalogue of all subjects. Add a subject to a curriculum to set its semester and credit hours.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "form", subject: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
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

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or name..."
          aria-label="Search subjects"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Parts</th>
              <th className="px-4 py-3 font-semibold">Used in</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-slate-400">
                  {subjects.length === 0 ? "No subjects yet. Add the first one." : "No subjects match your search."}
                </td>
              </tr>
            )}

            {!loading &&
              visible.map((subject) => (
                <tr key={subject.id} className="text-slate-700 dark:text-slate-200">
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{subject.code}</td>
                  <td className="px-4 py-3">{subject.name}</td>
                  <td className="px-4 py-3">
                    <ComponentChips items={subject.components.map((type) => ({ type }))} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {subject.curriculaCount === 0 ? "—" : `${subject.curriculaCount} curricul${subject.curriculaCount === 1 ? "um" : "a"}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setDialog({ type: "form", subject })}
                        aria-label={`Edit ${subject.code}`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDialog({ type: "delete", subject })}
                        aria-label={`Delete ${subject.code}`}
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

      {dialog.type === "form" && (
        <SubjectFormModal
          subject={dialog.subject}
          onClose={close}
          onSaved={(_, isEdit) => {
            close();
            refresh();
            showToast(isEdit ? "Subject updated." : "Subject created.");
          }}
        />
      )}

      {dialog.type === "delete" && (
        <ConfirmReasonModal
          title="Delete this subject?"
          description={`${dialog.subject.code} — ${dialog.subject.name} will be removed from the catalogue. Subjects that belong to a curriculum can't be deleted.`}
          confirmLabel="Delete"
          danger
          onClose={close}
          onConfirm={async () => {
            await curriculumApi.deleteSubject(dialog.subject.id);
            close();
            refresh();
            showToast("Subject deleted.");
          }}
        />
      )}
    </div>
  );
}