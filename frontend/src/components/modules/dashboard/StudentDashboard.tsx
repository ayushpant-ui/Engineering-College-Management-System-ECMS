"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LogOut,
  TriangleAlert,
} from "lucide-react";
import { notices } from "@/data/notice";

// Shape of the `student` object , backend returns on login.
interface StudentUser {
  id: number | string;
  fullName: string;
  department: string;
  registrationNumber: string;
  semester: number;
  mustChangePassword?: boolean;
}

const quickLinks = [
  { label: "Results", href: "/student/results", icon: FileText },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Class Routine", href: "/student/routine", icon: ClipboardList },
  { label: "Notices", href: "/notices", icon: Bell },
];

function readSession(): StudentUser | null {
  // Login stores in localStorage (Remember Me) or sessionStorage.
  const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
  const token = storage.getItem("accessToken");
  const raw = storage.getItem("user");
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw) as StudentUser;
  } catch {
    return null;
  }
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace("/login"); 
      return;
    }
    setStudent(session);
    setChecked(true);
  }, [router]);

  function logout() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("accessToken");
      storage.removeItem("user");
    }
    router.replace("/login");
  }

  if (!checked || !student) {
    return <p className="p-8 text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>;
  }

  const firstName = student.fullName.split(" ")[0];
  const latestNotices = notices.slice(0, 3);

  const stats = [
    { label: "Registration No.", value: student.registrationNumber, icon: GraduationCap },
    { label: "Department", value: student.department, icon: BookOpen },
    { label: "Current Semester", value: `Semester ${student.semester}`, icon: ClipboardList },
    // have to Replace "—" once you fetch attendance from your API.
    { label: "Attendance", value: "—", icon: CalendarCheck },
  ];

  const card =
    "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s an overview of your academic portal.
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Password change warning */}
      {student.mustChangePassword && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You&apos;re using a temporary password.{" "}
            <Link href="/student/change-password" className="font-semibold underline">
              Change it now
            </Link>{" "}
            to keep your account secure.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={`${card} flex items-center gap-3 p-4`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <section className={`${card} p-6 lg:col-span-1`}>
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Quick Links</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center text-sm font-medium text-slate-700 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Latest notices */}
        <section className={`${card} p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Latest Notices</h2>
            <Link href="/notices" className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {latestNotices.map((notice) => (
              <li key={notice.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{notice.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{notice.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}