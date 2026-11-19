"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Layers, Pencil, Plus, RefreshCw, Trash2, TriangleAlert } from "lucide-react";

import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import { curriculumApi } from "@/lib/curriculum-api";
import { SEMESTERS, type CurriculumDetail, type CurriculumSubject, type Subject } from "@/lib/curriculum-types";
import ComponentChips from "./ComponentChips";
import CurriculumSubjectModal from "./CurriculumSubjectModal";

type Dialog =
  | { type: "none" }
  | { type: "subject"; item: CurriculumSubject | null }
  | { type: "remove"; item: CurriculumSubject };

export default function CurriculumDetailPage({ curriculumId }: { curriculumId: number }) {
  const [detail, setDetail] = useState<CurriculumDetail | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semester, setSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState<Dialog>({ type: "none" });
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  useEffect(() => {
    if (!Number.isInteger(curriculumId)) {
      setError("Curriculum not found.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError("");
    Promise.all([curriculumApi.getCurriculum(curriculumId), curriculumApi.listSubjects()])
      .then(([data, allSubjects]) => {
        if (cancelled) return;
        setDetail(data);
        setSubjects(allSubjects);
        // Start on the first semester that has subjects
        setSemester((current) => current ?? data.curriculum.semesters[0] ?? 1);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load this curriculum."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [curriculumId, attempt]);

  const refresh = () => setAttempt((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  const bySemester = useMemo(() => {
    const map = new Map<number, CurriculumSubject[]>();
    for (const item of detail?.items ?? []) map.set(item.semester, [...(map.get(item.semester) ?? []), item]);
    return map;
  }, [detail]);

  const back = (
    <Link href="/admin/curricula" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-4 w-4" />
      All curricula
    </Link>
  );

  if (loading) return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />;

  if (!detail || semester === null) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        {back}
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error || "Curriculum not found."}
        </p>
      </div>
    );
  }

  const { curriculum } = detail;
  const items = bySemester.get(semester) ?? [];
  const semesterCredits = items.reduce((sum, i) => sum + i.creditHours, 0);
  const takenIds = new Set(items.map((i) => i.subject.id));
  const available = subjects.filter((s) => !takenIds.has(s.id));

  const stats = [
    { label: "Subjects", value: curriculum.subjectCount, icon: BookOpen },
    { label: "Total credit hours", value: curriculum.totalCredits, icon: Layers },
    { label: "Semesters covered", value: curriculum.semesters.length, icon: Layers },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {back}

      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">
          {curriculum.name} <span className="text-muted-foreground">· {curriculum.version}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{curriculum.department.name}</p>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Semester tabs */}
      <div role="tablist" aria-label="Semesters" className="flex flex-wrap gap-2">
        {SEMESTERS.map((s) => {
          const count = bySemester.get(s)?.length ?? 0;
          const active = s === semester;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={active}
              onClick={() => setSemester(s)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
              }`}
            >
              Semester {s}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subjects of the chosen semester */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Semester {semester} · {items.length} subject{items.length === 1 ? "" : "s"} ·{" "}
          <span className="font-medium text-foreground">{semesterCredits} credit hours</span>
        </p>
        <button
          onClick={() => setDialog({ type: "subject", item: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add subject
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Parts and credit hours</th>
              <th className="px-4 py-3 text-center font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-slate-400">
                  No subjects in semester {semester} yet.
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id} className="text-slate-700 dark:text-slate-200">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{item.subject.code}</td>
                <td className="px-4 py-3">{item.subject.name}</td>
                <td className="px-4 py-3">
                  <ComponentChips items={item.components} />
                </td>
                <td className="px-4 py-3 text-center font-medium">{item.creditHours}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setDialog({ type: "subject", item })}
                      aria-label={`Edit ${item.subject.code}`}
                      title="Edit credit hours"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDialog({ type: "remove", item })}
                      aria-label={`Remove ${item.subject.code}`}
                      title="Remove from this semester"
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

      {dialog.type === "subject" && (
        <CurriculumSubjectModal
          curriculumId={curriculumId}
          semester={semester}
          availableSubjects={available}
          item={dialog.item}
          onClose={close}
          onSaved={(isEdit) => {
            close();
            refresh();
            showToast(isEdit ? "Subject updated." : "Subject added.");
          }}
        />
      )}

      {dialog.type === "remove" && (
        <ConfirmReasonModal
          title="Remove this subject?"
          description={`${dialog.item.subject.code} — ${dialog.item.subject.name} will be removed from semester ${dialog.item.semester} of this curriculum. The subject stays in the catalogue.`}
          confirmLabel="Remove"
          danger
          onClose={close}
          onConfirm={async () => {
            await curriculumApi.removeCurriculumSubject(dialog.item.id);
            close();
            refresh();
            showToast("Subject removed.");
          }}
        />
      )}
    </div>
  );
}