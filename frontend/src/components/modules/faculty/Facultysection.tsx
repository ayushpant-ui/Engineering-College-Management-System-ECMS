"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { facultyMembers } from "@/data/faculty";
import { departments } from "@/data/departments";
import FacultyCard from "./Facultycard";

export default function FacultySection() {
  const [query, setQuery] = useState("");
  const [activeDept, setActiveDept] = useState<string>("All");

  const departmentNames = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.code, d.name])),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facultyMembers.filter((m) => {
      const matchesDept = activeDept === "All" || m.departmentCode === activeDept;
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.specialization.some((s) => s.toLowerCase().includes(q));
      return matchesDept && matchesQuery;
    });
  }, [query, activeDept]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Users className="h-3.5 w-3.5" />
          Our Faculty
        </span>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Meet the Faculty
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Experienced educators and researchers guiding the next generation of
          engineers at the School of Engineering.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role or specialization..."
            aria-label="Search faculty"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["All", ...departments.map((d) => d.code)].map((code) => {
            const isActive = code === activeDept;
            return (
              <button
                key={code}
                onClick={() => setActiveDept(code)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {code === "All" ? "All" : departmentNames[code]}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400 dark:text-slate-500">
          No faculty members found.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <FacultyCard
              key={member.id}
              member={member}
              departmentName={departmentNames[member.departmentCode] ?? member.departmentCode}
            />
          ))}
        </div>
      )}
    </section>
  );
}