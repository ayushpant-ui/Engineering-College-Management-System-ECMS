"use client";

import { useMemo, useState } from "react";
import { Bell, Search } from "lucide-react";
import { noticeCategories, notices, type NoticeCategory } from "@/data/notice";
import NoticeCard from "./NoticeCard";

export default function NoticesSection() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NoticeCategory | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices
      .filter((n) => category === "ALL" || n.category === category)
      .filter(
        (n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1; // pinned first
        return b.publishedAt.localeCompare(a.publishedAt); // then newest first
      });
  }, [query, category]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Bell className="h-3.5 w-3.5" />
          Notice Board
        </span>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Notices &amp; Announcements
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Stay updated with the latest admissions, examination, academic and
          event notices from the School of Engineering.
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
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400 dark:text-slate-500">
            No notices found.
          </div>
        ) : (
          filtered.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        )}
      </div>
    </section>
  );
}