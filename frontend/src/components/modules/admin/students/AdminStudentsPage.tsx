"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { adminFetch, AdminApiError } from "@/lib/admin-api";
import { departmentName, type AdminStudent, type StudentList } from "@/lib/admin-students";
import ConfirmReasonModal from "@/components/modules/admin/results/ConfirmReasonModal";
import StudentFormModal from "./StudentFormModal";
import TemporaryPasswordModal from "./TemporaryPasswordModal";

type Dialog =
  | { type: "none" }
  | { type: "form"; student: AdminStudent | null }
  | { type: "credentials"; title: string; student: AdminStudent; password: string }
  | { type: "reset"; student: AdminStudent }
  | { type: "delete"; student: AdminStudent };

const message = (err: unknown) => (err instanceof AdminApiError ? err.message : "Something went wrong. Please try again.");

export default function AdminStudentsPage() {
  const [data, setData] = useState<StudentList | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced copy
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialog, setDialog] = useState<Dialog>({ type: "none" });
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  // Wait until the admin stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (semester) params.set("semester", semester);

      try {
        const result = await adminFetch<StudentList>(`/admin/students?${params}`);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(message(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, semester, refreshKey]);

  const refresh = () => setRefreshKey((n) => n + 1);
  const close = () => setDialog({ type: "none" });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add students, update their details and reset forgotten passwords.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "form", student: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or registration no..."
            aria-label="Search students"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by semester"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Registration No.</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Semester</th>
              <th className="px-4 py-3 font-semibold">Password</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-slate-400">
                  {search || semester ? "No students match your filters." : "No students yet. Add the first one."}
                </td>
              </tr>
            )}

            {!loading &&
              items.map((student) => (
                <tr key={student.id} className="text-slate-700 dark:text-slate-200">
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{student.registrationNumber}</td>
                  <td className="px-4 py-3">{student.fullName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{departmentName(student.department)}</td>
                  <td className="px-4 py-3">{student.semester}</td>
                  <td className="px-4 py-3">
                    {student.mustChangePassword ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        Temporary
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        Set by student
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setDialog({ type: "form", student })}
                        aria-label={`Edit ${student.fullName}`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDialog({ type: "reset", student })}
                        aria-label={`Reset password for ${student.fullName}`}
                        title="Reset password"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDialog({ type: "delete", student })}
                        aria-label={`Delete ${student.fullName}`}
                        title="Delete"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {data.total} student{data.total === 1 ? "" : "s"} · Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="rounded-lg border p-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages || loading}
              aria-label="Next page"
              className="rounded-lg border p-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}

      {dialog.type === "form" && (
        <StudentFormModal
          student={dialog.student}
          onClose={close}
          onUpdated={() => {
            close();
            refresh();
            showToast("Student updated.");
          }}
          onCreated={(student, password) => {
            setDialog({ type: "credentials", title: "Student added", student, password });
            refresh();
          }}
        />
      )}

      {dialog.type === "credentials" && (
        <TemporaryPasswordModal
          title={dialog.title}
          studentName={dialog.student.fullName}
          registrationNumber={dialog.student.registrationNumber}
          password={dialog.password}
          onClose={close}
        />
      )}

      {dialog.type === "reset" && (
        <ConfirmReasonModal
          title="Reset password?"
          description={`A new temporary password will be generated for ${dialog.student.fullName}. Their current password stops working immediately, and they must choose a new one at next login.`}
          confirmLabel="Reset password"
          onClose={close}
          onConfirm={async () => {
            const { student } = dialog;
            try {
              const res = await adminFetch<{ temporaryPassword: string }>(
                `/admin/students/${student.id}/reset-password`,
                { method: "POST" }
              );
              setDialog({ type: "credentials", title: "Password reset", student, password: res.temporaryPassword });
              refresh();
            } catch (err) {
              throw new Error(message(err));
            }
          }}
        />
      )}

      {dialog.type === "delete" && (
        <ConfirmReasonModal
          title="Delete this student?"
          description={`${dialog.student.fullName} (${dialog.student.registrationNumber}) will be removed permanently. Students who already have result records can't be deleted.`}
          confirmLabel="Delete"
          danger
          onClose={close}
          onConfirm={async () => {
            const { student } = dialog;
            try {
              await adminFetch(`/admin/students/${student.id}`, { method: "DELETE" });
              // If that was the last student on the page, step back one page
              if (data && data.items.length === 1 && page > 1) setPage(page - 1);
              close();
              refresh();
              showToast("Student deleted.");
            } catch (err) {
              throw new Error(message(err));
            }
          }}
        />
      )}
    </div>
  );
}