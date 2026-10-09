import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Clock, FlaskConical, GraduationCap, Users } from "lucide-react";
import { departments, getDepartmentBySlug } from "@/data/Departments";
import DepartmentIcon from "@/components/modules/departments/Departmenticon";

export function generateStaticParams() {
  return departments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);
  return { title: department ? `${department.name} | School of Engineering` : "Department" };
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);
  if (!department) notFound();

  const stats = [
    { label: "Duration", value: department.duration, icon: Clock },
    { label: "Intake", value: `${department.intake} Seats`, icon: GraduationCap },
    { label: "Faculty", value: `${department.facultyCount} Members`, icon: Users },
  ];

  const card =
    "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6";

  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/departments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          All departments
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <DepartmentIcon name={department.icon} className="h-7 w-7" />
          </span>
          <div>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {department.code}
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {department.name}
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{department.program}</p>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-slate-600 dark:text-slate-300">
          {department.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className={`${card} flex items-center gap-3 !p-4`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className={card}>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900 dark:text-white">
              <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Laboratories
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {department.labs.map((lab) => (
                <li key={lab} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {lab}
                </li>
              ))}
            </ul>
          </div>

          <div className={card}>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900 dark:text-white">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Career Paths
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {department.careers.map((career) => (
                <li key={career} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {career}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/faculty"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Meet the faculty
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-500"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}