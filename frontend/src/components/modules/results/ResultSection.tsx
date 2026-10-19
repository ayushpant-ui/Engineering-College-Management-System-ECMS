"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import {
  calculateGpa,
  calculateSummary,
  fetchResults,
  UnauthorizedError,
  type SemesterResult,
} from "@/lib/results";
import ResultsTable from "./ResultTable";

export default function ResultsSection() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<SemesterResult[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = [...(await fetchResults())].sort((a, b) => a.semester - b.semester);
        if (cancelled) return;
        setSemesters(data);
        setSelected(data.length ? data[data.length - 1].semester : null); // latest semester
      } catch (err) {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) {
          router.replace("/login"); // change if your login route is different
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  const current = semesters.find((s) => s.semester === selected);
  const summary = useMemo(() => (current ? calculateSummary(current.subjects) : null), [current]);
  const cgpa = useMemo(() => calculateGpa(semesters.flatMap((s) => s.subjects)), [semesters]);

  const card =
    "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60";
  const iconBox =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          My Results
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Semester-wise marks, grades and GPA.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4" aria-busy="true">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && semesters.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400 dark:border-slate-700 dark:text-slate-500">
          No results have been published yet.
        </div>
      )}

      {/* Results */}
      {!loading && !error && current && summary && (
        <>
          {/* Semester selector */}
          <div className="flex flex-wrap gap-2">
            {semesters.map(({ semester }) => {
              const active = semester === selected;
              return (
                <button
                  key={semester}
                  onClick={() => setSelected(semester)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
                  }`}
                >
                  Semester {semester}
                </button>
              );
            })}
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={card}>
              <span className={iconBox}>
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Semester GPA</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {summary.gpa.toFixed(2)}
                </p>
              </div>
            </div>

            <div className={card}>
              <span className={iconBox}>
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Overall CGPA</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{cgpa.toFixed(2)}</p>
              </div>
            </div>

            <div className={card}>
              <span className={iconBox}>
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Credit Hours</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.credits}</p>
              </div>
            </div>

            <div className={card}>
              <span className={iconBox}>
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Result</p>
                <p
                  className={`text-xl font-bold ${
                    summary.passed
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {summary.passed ? "Passed" : `${summary.backlogs} Backlog${summary.backlogs > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>

          <ResultsTable subjects={current.subjects} />

          <p className="text-xs text-slate-400">
            Overall percentage this semester: {summary.percentage.toFixed(1)}%. Grades and GPA are
            calculated automatically from marks; the official marksheet issued by the examination
            section is the final record.
          </p>
        </>
      )}
    </div>
  );
}