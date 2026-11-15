"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Pencil, Plus, RefreshCw, Trash2, TriangleAlert } from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import { curriculumApi } from "@/lib/curriculum-api";
import type { Curriculum } from "@/lib/curriculum-types";
import CurriculumFormModal from "./CurriculumFormModal";

type Dialog = { type: "none" } | { type: "form"; curriculum: Curriculum | null } | { type: "delete"; curriculum: Curriculum };

export default function CurriculaPage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [department, setDepartment] = useState("");
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
      .listCurricula()
      .then((data) => !cancelled && setCurricula(data))
      .catch(() => !cancelled && setError("Could not load curricula."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const departments = useMemo(
    () => [...new Map(curricula.map((c) => [c.department.id, c.department])).values()],
    [curricula]
  );
  const visible = curricula.filter((c) => !department || String(c.department.id) === department);

  const refresh = () => setAttempt((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Curricula</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A curriculum lists the subjects of each semester and their credit hours. Exams and results use it.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "form", curriculum: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Curriculum
        </button>
      </div>

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {departments.length > 1 && (
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Filter by department"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
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

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Curriculum</th>
              <th className="px-4 py-3 font-semibold">Version</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Subjects</th>
              <th className="px-4 py-3 font-semibold">Semesters</th>
              <th className="px-4 py-3 font-semibold">Credits</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-slate-400">
                  {curricula.length === 0 ? "No curricula yet. Create the first one." : "No curricula for this department."}
                </td>
              </tr>
            )}

            {!loading &&
              visible.map((c) => (
                <tr key={c.id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3">
                    <Link href={`/admin/curricula/${c.id}`} className="font-medium hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.version}</td>
                  <td className="px-4 py-3">{c.department.name}</td>
                  <td className="px-4 py-3">{c.subjectCount}</td>
                  <td className="px-4 py-3 text-slate-500">{c.semesters.length === 0 ? "—" : c.semesters.join(", ")}</td>
                  <td className="px-4 py-3">{c.totalCredits}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/curricula/${c.id}`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        Manage subjects
                      </Link>
                      <button
                        onClick={() => setDialog({ type: "form", curriculum: c })}
                        aria-label={`Edit ${c.name}`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDialog({ type: "delete", curriculum: c })}
                        aria-label={`Delete ${c.name}`}
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
        <CurriculumFormModal
          curriculum={dialog.curriculum}
          onClose={close}
          onSaved={(_, isEdit) => {
            close();
            refresh();
            showToast(isEdit ? "Curriculum updated." : "Curriculum created.");
          }}
        />
      )}

      {dialog.type === "delete" && (
        <ConfirmReasonModal
          title="Delete this curriculum?"
          description={`${dialog.curriculum.name} (${dialog.curriculum.version}) will be removed. A curriculum that still has subjects can't be deleted.`}
          confirmLabel="Delete"
          danger
          onClose={close}
          onConfirm={async () => {
            await curriculumApi.deleteCurriculum(dialog.curriculum.id);
            close();
            refresh();
            showToast("Curriculum deleted.");
          }}
        />
      )}
    </div>
  );
}