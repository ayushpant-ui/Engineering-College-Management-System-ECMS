"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Paperclip, Pin } from "lucide-react";
import type { Notice, NoticeCategory } from "@/data/notice";

const categoryStyles: Record<NoticeCategory, string> = {
  GENERAL: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  ACADEMIC: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  EXAM: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  ADMISSION: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  EVENT: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC", // keeps server and client output identical
  });
}

export default function NoticeCard({ notice }: { notice: Notice }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={`rounded-2xl border bg-white dark:bg-slate-900/60 p-5 transition-colors ${
        notice.isPinned
          ? "border-blue-300 dark:border-blue-500/40"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-0.5 font-medium ${categoryStyles[notice.category]}`}>
          {notice.category.charAt(0) + notice.category.slice(1).toLowerCase()}
        </span>
        {notice.isPinned && (
          <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
            <Pin className="h-3.5 w-3.5" />
            Pinned
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(notice.publishedAt)}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold text-slate-900 dark:text-white">
        {notice.title}
      </h3>

      <p
        className={`mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 ${
          open ? "" : "line-clamp-2"
        }`}
      >
        {notice.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400"
        >
          {open ? "Show less" : "Read more"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {notice.attachmentUrl && (
          <a
            href={notice.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachment
          </a>
        )}
      </div>
    </article>
  );
}