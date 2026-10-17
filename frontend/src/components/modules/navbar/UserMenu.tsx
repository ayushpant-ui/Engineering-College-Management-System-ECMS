"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, KeyRound, LayoutDashboard, LogIn, LogOut } from "lucide-react";

import { useStudentSession } from "@/hooks/useStudentSession";
import { clearSession } from "@/lib/auth-session";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function UserMenu() {
  const { student, isLoggedIn, ready } = useStudentSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when navigating to another page
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Placeholder while storage is being checked (avoids layout jump)
  if (!ready) return <div className="h-9 w-24" aria-hidden />;

  // Logged out: show your normal Login button
  if (!isLoggedIn || !student) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
      >
        <LogIn className="h-4 w-4" />
        Login
      </Link>
    );
  }

  function logout() {
    setOpen(false);
    clearSession();
    router.replace("/login"); // change if your login route is different
  }

  const menuItem =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 transition-colors hover:border-blue-500 sm:pr-3 dark:border-slate-700"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {getInitials(student.fullName)}
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-800 sm:block dark:text-slate-100">
          {student.fullName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {student.fullName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {student.registrationNumber} · Semester {student.semester}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {student.department}
            </p>
          </div>

          <div className="py-1">
            <Link href="/student/dashboard" role="menuitem" className={menuItem}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/student/change-password" role="menuitem" className={menuItem}>
              <KeyRound className="h-4 w-4" />
              Change Password
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
            <button
              role="menuitem"
              onClick={logout}
              className={`${menuItem} hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10 dark:hover:!text-red-400`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}