"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  TriangleAlert,
  Users,
} from "lucide-react";

import { clearAdminSession, getAdminToken } from "@/lib/admin-session";

interface Stats {
  students: number;
  faculty: number;
  departments: number;
  notices: number;
  unreadMessages: number;
}

const cards = [
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "faculty", label: "Faculty", icon: Users },
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "notices", label: "Notices", icon: Bell },
  { key: "unreadMessages", label: "Unread Messages", icon: MessageSquare },
] as const;

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      const token = getAdminToken();

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not load statistics.");
        if (!cancelled) setStats(body.data ?? body);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof TypeError
              ? "Could not reach the server. Check your connection and try again."
              : err instanceof Error
                ? err.message
                : "Could not load statistics."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of the School of Engineering portal.
        </p>
      </div>

      {error && (
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {loading ? (
                <div className="mt-1 h-7 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <p className="text-2xl font-bold">{stats ? stats[key] : "—"}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}