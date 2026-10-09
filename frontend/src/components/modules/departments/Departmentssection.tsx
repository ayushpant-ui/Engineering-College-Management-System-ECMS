"use client";

import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { departments } from "@/data/departments";
import DepartmentCard from "./Departmentcard";

export default function DepartmentsSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.shortDescription.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Building2 className="h-3.5 w-3.5" />
          Academic Departments
        </span>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Our Departments
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Explore the departments of the School of Engineering — their programs,
          laboratories and the careers they lead to.
        </p>
      </div>

      <div className="relative mx-auto mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments..."
          aria-label="Search departments"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400 dark:text-slate-500">
          No departments match &quot;{query}&quot;.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((department) => (
            <DepartmentCard key={department.slug} department={department} />
          ))}
        </div>
      )}
    </section>
  );
}