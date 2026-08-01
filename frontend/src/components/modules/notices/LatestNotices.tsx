"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ArrowRight,
  Pin,
} from "lucide-react";

const latestNotices = [
  {
    id: 1,
    title: "Admission Open for BE Programs 2026",
    date: "August 20, 2026",
    category: "Admission",
    featured: true,
  },
  {
    id: 2,
    title: "Semester Examination Form Submission",
    date: "August 15, 2026",
    category: "Examination",
    featured: false,
  },
  {
    id: 3,
    title: "Scholarship Application Notice",
    date: "August 30, 2026",
    category: "Scholarship",
    featured: false,
  },
];

export default function LatestNotices() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Latest Notices
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight">
            Stay Updated
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Find the latest announcements, examination notices,
            admissions, scholarships and other important updates
            from the School of Engineering.
          </p>
        </div>

        {/* Notice Cards */}
        <div className="space-y-5">
          {latestNotices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    {notice.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        <Pin className="h-3 w-3" />
                        Featured
                      </span>
                    )}

                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                      {notice.category}
                    </span>

                  </div>

                  <h3 className="text-xl font-semibold">
                    {notice.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {notice.date}
                  </div>

                </div>

                <Link
                  href={`/notices/${notice.id}`}
                  className="inline-flex items-center gap-2 font-medium text-primary transition hover:gap-3"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            href="/notices"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-medium transition hover:bg-muted"
          >
            View All Notices
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}