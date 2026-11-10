"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Search,
  TriangleAlert,
  CalendarDays,
} from "lucide-react";

import { resultApi } from "@/lib/result-api";
import type {
  ExamSummary,
  ExamType,
  PublicationStatus,
} from "@/lib/result-types";

import { ExamTypeBadge, PublicationBadge } from "./ResultBadges";
import ExamPeriodDialog from "./exam-periods/ExamPeriodDialog";

const select =
  "rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function ExamResultsListPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [type, setType] = useState<"" | ExamType>("");
  const [status, setStatus] = useState<"" | PublicationStatus>("");

  // Controls the Exam Period dialog
  const [showPeriods, setShowPeriods] = useState(false);

  // Fetch exams
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    resultApi
      .listExams()
      .then((data) => {
        if (!cancelled) {
          setExams(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load exams.");
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

  // Extract unique exam periods from the exams
  const periods = useMemo(
    () =>
      [...new Map(exams.map((e) => [e.examPeriod.id, e.examPeriod])).values()],
    [exams]
  );

  // Apply search and filters
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return exams.filter(
      (e) =>
        (!period || String(e.examPeriod.id) === period) &&
        (!type || e.examType === type) &&
        (!status || e.status === status) &&
        (!q || e.name.toLowerCase().includes(q))
    );
  }, [exams, search, period, type, status]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">
            Results
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Open an exam to enter marks subject by subject. Results are
            published for the whole exam at once.
          </p>
        </div>

        {/* Exam Period Management */}
        <button
          type="button"
          onClick={() => setShowPeriods(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          <CalendarDays className="h-4 w-4" />
          Exam Periods
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            aria-label="Search exams"
            className={`${select} w-full pl-10`}
          />
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Exam period"
          className={select}
        >
          <option value="">All exam periods</option>

          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "" | ExamType)}
          aria-label="Exam type"
          className={select}
        >
          <option value="">Regular and backlog</option>
          <option value="REGULAR">Regular</option>
          <option value="BACKLOG">Backlog</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "" | PublicationStatus)
          }
          aria-label="Status"
          className={select}
        >
          <option value="">Any status</option>
          <option value="NOT_STARTED">No marks yet</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>

        {/* Refresh Exams */}
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          disabled={loading}
          aria-label="Refresh exams"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-3.5 py-2.5 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />

          <span className="flex-1">{error}</span>

          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Exams Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Exam</th>
              <th className="px-4 py-3 font-semibold">Sem.</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Students</th>
              <th className="px-4 py-3 font-semibold">Marks entered</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
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
                <td
                  colSpan={7}
                  className="px-4 py-14 text-center text-slate-400"
                >
                  {exams.length === 0
                    ? "No exams yet."
                    : "No exams match your filters."}
                </td>
              </tr>
            )}

            {!loading &&
              visible.map((exam) => {
                const percent =
                  exam.subjectCount > 0
                    ? Math.round(
                        (exam.completedSubjects / exam.subjectCount) * 100
                      )
                    : 0;

                return (
                  <tr
                    key={exam.id}
                    className="text-slate-700 dark:text-slate-200"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/results/${exam.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {exam.name}
                      </Link>

                      <p className="text-xs text-slate-400">
                        {exam.examPeriod.name}
                      </p>
                    </td>

                    <td className="px-4 py-3">{exam.semester}</td>

                    <td className="px-4 py-3">
                      <ExamTypeBadge type={exam.examType} />
                    </td>

                    <td className="px-4 py-3">{exam.enrolledCount}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <span className="whitespace-nowrap text-xs text-slate-500">
                          {exam.completedSubjects}/{exam.subjectCount} subjects
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <PublicationBadge status={exam.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/results/${exam.id}`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        {exam.status === "PUBLISHED"
                          ? "View / correct"
                          : "Enter marks"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Exam Period Dialog */}
      <ExamPeriodDialog
        open={showPeriods}
        onClose={() => setShowPeriods(false)}
      />
    </div>
  );
}