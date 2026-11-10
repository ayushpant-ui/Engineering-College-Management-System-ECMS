"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";

import { ExamPeriod } from "@/lib/exam-periods";

interface Props {
  periods: ExamPeriod[];
  loading: boolean;
  onEdit: (period: ExamPeriod) => void;
  onDelete: (id: number) => void;
}

export default function ExamPeriodTable({
  periods,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111b30]">

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">

          <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Exam Period</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">

            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading exam periods...
                </td>
              </tr>
            ) : periods.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-14 text-center">

                  <CalendarDays
                    size={32}
                    className="mx-auto mb-3 text-slate-500"
                  />

                  <p className="font-medium text-slate-300">
                    No exam periods found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Create your first examination period.
                  </p>

                </td>
              </tr>
            ) : (
              periods.map((period) => (
                <tr
                  key={period.id}
                  className="transition hover:bg-slate-800/40"
                >

                  <td className="px-6 py-5 font-medium text-white">
                    {period.name}
                  </td>

                  <td className="px-6 py-5 text-slate-300">
                    {formatDate(period.startsAt)}
                  </td>

                  <td className="px-6 py-5 text-slate-300">
                    {formatDate(period.endsAt)}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() => onEdit(period)}
                        title="Edit exam period"
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(period.id)}
                        title="Delete exam period"
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-red-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}