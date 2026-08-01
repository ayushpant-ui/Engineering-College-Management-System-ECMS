"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ArrowRight,
  Pin,
} from "lucide-react";

const notices = [
  {
    id: 1,
    title: "Admission Open for BE Programs 2026",
    date: "August 20, 2026",
    type: "Admission",
    featured: true,
  },
  {
    id: 2,
    title: "Semester Examination Form Submission",
    date: "August 15, 2026",
    type: "Examination",
    featured: false,
  },
  {
    id: 3,
    title: "Scholarship Application Notice",
    date: "August 30, 2026",
    type: "Scholarship",
    featured: false,
  },
];

export default function Notices() {
  return (
    <section className="border-b border-border py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center">

          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Latest Notices
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight">
            Important Announcements
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Stay updated with admissions, examinations,
            scholarships, academic notices, and other
            official announcements from the School of
            Engineering.
          </p>

        </div>

        <div className="space-y-5">

          {notices.map((notice) => (

            <div
              key={notice.id}
              className="rounded-xl border bg-card p-6 transition hover:border-primary hover:shadow-md"
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="mb-3 flex items-center gap-3">

                    {notice.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        <Pin className="h-3 w-3" />
                        Featured
                      </span>
                    )}

                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {notice.type}
                    </span>

                  </div>

                  <h3 className="text-xl font-semibold">
                    {notice.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {notice.date}
                  </div>

                </div>

                <Link
                  href={`/notices/${notice.id}`}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            </div>

          ))}

        </div>

        <div className="mt-10 text-center">

          <Link
            href="/notices"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition hover:bg-muted"
          >
            View All Notices
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </div>

    </section>
  );
}