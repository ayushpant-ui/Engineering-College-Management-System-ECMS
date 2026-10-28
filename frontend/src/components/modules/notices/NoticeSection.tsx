"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { noticeCategories, type Notice, type NoticeCategory } from "@/data/notice";
import NoticeCard from "./NoticeCard";

// Shape returned by GET /notices on the backend
interface ApiNotice {
  id: number | string;
  title: string;
  body: string;
  category: NoticeCategory;
  attachmentUrl: string | null;
  isPinned: boolean;
  publishedAt: string;
}

export default function NoticesSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NoticeCategory | "ALL">("ALL");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // cache: "no-store" so a notice the admin just published shows up right away
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not load notices.");

        const body = await response.json();
        const list: ApiNotice[] = Array.isArray(body) ? body : (body.data ?? []);

        if (!cancelled) {
          setNotices(
            list.map((n) => ({
              id: String(n.id),
              title: n.title,
              body: n.body,
              category: n.category,
              isPinned: n.isPinned,
              publishedAt: n.publishedAt,
              attachmentUrl: n.attachmentUrl ?? undefined,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof TypeError
              ? "Could not reach the server. Check your connection and try again."
              : "Could not load notices. Please try again."
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
  }, [attempt]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices
      .filter((n) => category === "ALL" || n.category === category)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1; // pinned first
        return b.publishedAt.localeCompare(a.publishedAt); // then newest first
      });
  }, [notices, query, category]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <Bell className="h-3.5 w-3.5" />
          Notice Board
        </span>
        <h1 className="mt-4 font-serif text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
          Notices &amp; Announcements
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Stay updated with the latest admissions, examination, academic and event notices from the
          School of Engineering.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices..."
            aria-label="Search notices"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {noticeCategories.map(({ value, label }) => {
            const isActive = value === category;
            return (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-4">
        {/* Loading */}
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}

        {/* Error */}
        {!loading && error && (
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

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400 dark:border-slate-700 dark:text-slate-500">
            {notices.length === 0 ? "No notices have been published yet." : "No notices match your search."}
          </div>
        )}

        {/* List */}
        {!loading && !error && filtered.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
      </div>
    </section>
  );
}