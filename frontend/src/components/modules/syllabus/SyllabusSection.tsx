"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Download, ExternalLink, FileText } from "lucide-react";

import {
  ordinals,
  syllabusDepartments,
  syllabusFile,
  yearLabels,
  type SyllabusDepartment,
  type SyllabusDeptSlug,
} from "@/data/syllabus";

function SemesterCard({ department, semester }: { department: SyllabusDepartment; semester: number }) {
  const file = syllabusFile(department, semester);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <p className="font-serif text-base font-bold text-slate-900 dark:text-white">Semester {semester}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{ordinals[semester - 1]} semester syllabus</p>
        </div>
      </div>

      {file ? (
        <div className="flex gap-2">
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${department.name} semester ${semester} syllabus`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-400"
          >
            <ExternalLink className="h-4 w-4" />
            View
          </a>
          <a
            href={file}
            download={`${department.code}-Semester-${semester}-Syllabus.pdf`}
            aria-label={`Download ${department.name} semester ${semester} syllabus`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      ) : (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Coming soon
        </span>
      )}
    </div>
  );
}

export default function SyllabusSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The chosen department lives in the URL (?dept=civil), so a link can be shared
  const active =
    syllabusDepartments.find((d) => d.slug === searchParams.get("dept")) ?? syllabusDepartments[0];

  function select(slug: SyllabusDeptSlug) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dept", slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <BookOpen className="h-3.5 w-3.5" />
          Academic Resources
        </span>
        <h1 className="mt-4 font-serif text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">Syllabus</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Choose your department to view or download the syllabus of any semester, from semester 1 to 8.
        </p>
      </div>

      {/* Department tabs */}
      <div role="tablist" aria-label="Department" className="mt-8 flex flex-wrap justify-center gap-2">
        {syllabusDepartments.map((d) => {
          const isActive = d.slug === active.slug;
          return (
            <button
              key={d.slug}
              role="tab"
              id={`tab-${d.slug}`}
              aria-selected={isActive}
              aria-controls="syllabus-panel"
              onClick={() => select(d.slug)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
            >
              {d.name}
            </button>
          );
        })}
      </div>

      {/* Semesters, grouped by year */}
      <div
        role="tabpanel"
        id="syllabus-panel"
        aria-labelledby={`tab-${active.slug}`}
        className="mx-auto mt-8 max-w-4xl space-y-8"
      >
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {active.name} · {active.available.length} of 8 semesters available
        </p>

        {yearLabels.map((label, yearIndex) => {
          const first = yearIndex * 2 + 1;
          return (
            <div key={label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <SemesterCard department={active} semester={first} />
                <SemesterCard department={active} semester={first + 1} />
              </div>
            </div>
          );
        })}

        <p className="text-center text-xs text-slate-400">
          Syllabi are provided for reference. Please confirm the latest revision with the college office.
        </p>
      </div>
    </section>
  );
}