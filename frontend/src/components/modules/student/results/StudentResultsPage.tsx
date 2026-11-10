"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, RefreshCw, ShieldCheck, TrendingUp, TriangleAlert } from "lucide-react";

import { getStoredSession } from "@/lib/auth-session";
import { resultApi } from "@/lib/result-api";
import type { StudentResultsResponse } from "@/lib/result-types";

const card = "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60";
const iconBox = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
const typeLabel = { THEORY: "Theory", PRACTICAL: "Practical" } as const;

export default function StudentResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentResultsResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login"); // change if your login route is different
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    resultApi
      .getMyResults({
        registrationNumber: session.registrationNumber,
        fullName: session.fullName,
        semester: session.semester,
      })
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setSelected((current) => current ?? response.exams[0]?.examId ?? null);
      })
      .catch(() => !cancelled && setError("Could not load your results. Please try again."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  const exam = data?.exams.find((e) => e.examId === selected) ?? null;
  const credits = exam ? exam.subjects.reduce((sum, s) => sum + s.creditHours, 0) : 0;
  const backlogs = exam ? exam.subjects.filter((s) => !s.passed).length : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">My Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">Published results for each examination you have taken.</p>
      </div>

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

      {!loading && error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setAttempt((n) => n + 1)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && data.exams.length === 0 && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          No results have been published yet.
        </div>
      )}

      {!loading && !error && data && exam && (
        <>
          {/* Exam picker */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Examinations">
            {data.exams.map((e) => (
              <button
                key={e.examId}
                role="tab"
                aria-selected={e.examId === selected}
                onClick={() => setSelected(e.examId)}
                className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
                  e.examId === selected ? "border-primary bg-primary/5" : "hover:border-primary"
                }`}
              >
                <span className="block font-medium">{e.examName}</span>
                <span className="block text-xs text-muted-foreground">
                  {e.examPeriod}
                  {e.examType === "BACKLOG" && " · Backlog"}
                </span>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={card}>
              <span className={iconBox}><GraduationCap className="h-5 w-5" /></span>
              <div>
                <p className="text-xs text-muted-foreground">SGPA (this exam)</p>
                <p className="text-xl font-bold">{exam.sgpa.toFixed(2)}</p>
              </div>
            </div>
            <div className={card}>
              <span className={iconBox}><TrendingUp className="h-5 w-5" /></span>
              <div>
                <p className="text-xs text-muted-foreground">CGPA (overall)</p>
                <p className="text-xl font-bold">{data.cgpa === null ? "—" : data.cgpa.toFixed(2)}</p>
              </div>
            </div>
            <div className={card}>
              <span className={iconBox}><BookOpen className="h-5 w-5" /></span>
              <div>
                <p className="text-xs text-muted-foreground">Credit hours</p>
                <p className="text-xl font-bold">{credits}</p>
              </div>
            </div>
            <div className={card}>
              <span className={iconBox}><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-xs text-muted-foreground">Result</p>
                <p className={`text-xl font-bold ${exam.passedAll ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {exam.passedAll ? "Passed" : `${backlogs} backlog${backlogs === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Marks and grade</th>
                  <th className="px-4 py-3 text-center font-semibold">Credit</th>
                  <th className="px-4 py-3 text-center font-semibold">GPA</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exam.subjects.map((s) => (
                  <tr key={s.subjectId} className="align-top text-slate-700 dark:text-slate-200">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{s.code}</td>
                    <td className="px-4 py-3">
                      {s.name}
                      {!s.recognized && (
                        <span className="mt-1 block text-xs text-slate-400">Replaced by a later result in your CGPA</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.components.map((c) => (
                        <p key={c.type} className="whitespace-nowrap">
                          <span className="text-slate-500">{typeLabel[c.type]}:</span> {c.marksObtained}/{c.fullMarks}{" "}
                          <span className={`font-semibold ${c.gradeValue > 0 ? "" : "text-red-500"}`}>{c.grade}</span>
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-center">{s.creditHours}</td>
                    <td className="px-4 py-3 text-center font-medium">{s.gradeValue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.passed
                            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {s.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Grades and GPA are calculated by the college from the published marks. The official marksheet issued by the
            examination section is the final record.
          </p>
        </>
      )}
    </div>
  );
}