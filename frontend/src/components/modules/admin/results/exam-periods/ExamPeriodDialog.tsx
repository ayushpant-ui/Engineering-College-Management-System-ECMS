"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X, CalendarDays } from "lucide-react";

import {
  ExamPeriod,
  ExamPeriodInput,
  examPeriodApi,
} from "@/lib/exam-periods";

import ExamPeriodTable from "./ExamPeriodTable";
import ExamPeriodFormModal from "./ExamPeriodFormModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExamPeriodDialog({
  open,
  onClose,
}: Props) {
  const [periods, setPeriods] = useState<ExamPeriod[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [selectedPeriod, setSelectedPeriod] =
    useState<ExamPeriod | null>(null);

  const [error, setError] = useState("");

  // Fetch exam periods
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await examPeriodApi.getAll();

      setPeriods(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load exam periods"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPeriods();
    }
  }, [open]);

  // Open create modal
  const handleCreate = () => {
    setSelectedPeriod(null);
    setFormOpen(true);
  };

  // Open edit modal
  const handleEdit = (period: ExamPeriod) => {
    setSelectedPeriod(period);
    setFormOpen(true);
  };

  // Save exam period
  const handleSave = async (data: ExamPeriodInput) => {
    try {
      setError("");

      if (selectedPeriod) {
        await examPeriodApi.update(
          selectedPeriod.id,
          data
        );
      } else {
        await examPeriodApi.create(data);
      }

      setFormOpen(false);
      setSelectedPeriod(null);

      await fetchPeriods();
    } catch (err) {
      throw err;
    }
  };

  // Delete exam period
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exam period?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await examPeriodApi.remove(id);

      await fetchPeriods();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete exam period"
      );
    }
  };

  // Search
  const filteredPeriods = periods.filter((period) =>
    period.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <>
      {/* Main Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <CalendarDays size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Exam Periods
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your examination sessions.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={20} />
            </button>

          </div>

          {/* Search and Create */}
          <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">

            <div className="relative w-full sm:max-w-sm">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exam periods..."
                className="w-full rounded-xl border border-slate-700 bg-[#111b30] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
              />

            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
            >
              <Plus size={18} />
              New Exam Period
            </button>

          </div>

          {/* Summary */}
          <div className="px-6 pb-4">
            <div className="inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111b30] px-4 py-3">

              <div>
                <p className="text-xs text-slate-400">
                  Total Exam Periods
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {periods.length}
                </p>
              </div>

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-y-auto px-6 pb-6">

            <ExamPeriodTable
              periods={filteredPeriods}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          </div>

        </div>
      </div>

      {/* Create/Edit Modal */}
      <ExamPeriodFormModal
        open={formOpen}
        initialData={selectedPeriod}
        onClose={() => {
          setFormOpen(false);
          setSelectedPeriod(null);
        }}
        onSubmit={handleSave}
      />
    </>
  );
}