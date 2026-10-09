import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import type { Department } from "@/data/Departments";
import DepartmentIcon from "./Departmenticon";

export default function DepartmentCard({ department }: { department: Department }) {
  return (
    <Link
      href={`/departments/${department.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/5"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <DepartmentIcon name={department.icon} className="h-6 w-6" />
        </span>
        <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {department.code}
        </span>
      </div>

      <h3 className="mt-5 font-serif text-xl font-bold text-slate-900 dark:text-white">
        {department.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {department.shortDescription}
      </p>

      <div className="mt-5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {department.facultyCount} Faculty
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" />
          {department.intake} Seats
        </span>
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
        View department
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}