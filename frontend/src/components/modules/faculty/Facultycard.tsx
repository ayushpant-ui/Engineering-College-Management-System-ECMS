import { GraduationCap, Mail } from "lucide-react";
import type { FacultyMember } from "@/data/faculty";
import FacultyAvatar from "./Facultyavatar";

export default function FacultyCard({
  member,
  departmentName,
}: {
  member: FacultyMember;
  departmentName: string;
}) {
  return (
    <article className="flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/5">
      <FacultyAvatar name={member.name} photoUrl={member.photoUrl} />

      <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 dark:text-white">
        {member.name}
      </h3>
      <p className="mt-0.5 text-sm font-medium text-blue-600 dark:text-blue-400">
        {member.designation}
      </p>
      <span className="mt-2 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs text-slate-500 dark:text-slate-400">
        {departmentName}
      </span>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
        {member.qualification}
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {member.specialization.map((item) => (
          <span
            key={item}
            className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>

      <a
        href={`mailto:${member.email}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Mail className="h-4 w-4" />
        Email
      </a>
    </article>
  );
}