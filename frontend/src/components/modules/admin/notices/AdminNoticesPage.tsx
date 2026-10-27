"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { adminFetch, AdminApiError } from "@/lib/admin-api";
import NoticeFormModal, { AdminNotice, NOTICE_CATEGORIES } from "./NoticeFormModal";

interface NoticeList {
  items: AdminNotice[];
  total: number;
  page: number;
  totalPages: number;
}

const categoryStyles: Record<string, string> = {
  GENERAL: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  ACADEMIC: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  EXAM: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  ADMISSION: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  EVENT: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

type Modal = { mode: "closed" } | { mode: "create" } | { mode: "edit"; notice: AdminNotice };

export default function AdminNoticesPage() {
  const [data, setData] = useState<NoticeList | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced copy of searchInput
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<Modal>({ mode: "closed" });
  const [toDelete, setToDelete] = useState<AdminNotice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState("");

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
      if (category) params.set("category", category);

      try {
        const result = await adminFetch<NoticeList>(`/admin/notices?${params}`);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof AdminApiError ? err.message : "Could not load notices.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, category, refreshKey]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }, []);

  function handleSaved(message: string) {
    setModal({ mode: "closed" });
    setRefreshKey((n) => n + 1);
    showToast(message);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await adminFetch(`/admin/notices/${toDelete.id}`, { method: "DELETE" });
      // If that was the last item on the page, step back one page
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      setToDelete(null);
      setRefreshKey((n) => n + 1);
      showToast("Notice deleted.");
    } catch (err) {
      setDeleteError(err instanceof AdminApiError ? err.message : "Could not delete the notice.");
    } finally {
      setDeleting(false);
    }
  }

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Notices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and publish announcements shown on the website.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Notice
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400"
        >
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
            placeholder="Search notices..."
            aria-label="Search notices"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All categories</option>
          {NOTICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setRefreshKey((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-slate-400">
                  {search || category ? "No notices match your filters." : "No notices yet. Create the first one."}
                </td>
              </tr>
            )}

            {!loading &&
              items.map((notice) => (
                <tr key={notice.id} className="text-slate-700 dark:text-slate-200">
                  <td className="max-w-[320px] px-4 py-3">
                    <p className="flex items-center gap-1.5 truncate font-medium">
                      {notice.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-label="Pinned" />}
                      <span className="truncate">{notice.title}</span>
                    </p>
                    <p className="truncate text-xs text-slate-400">{notice.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles[notice.category]}`}>
                      {notice.category.charAt(0) + notice.category.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        notice.isPublished
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {notice.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(notice.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setModal({ mode: "edit", notice })}
                        aria-label={`Edit ${notice.title}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError("");
                          setToDelete(notice);
                        }}
                        aria-label={`Delete ${notice.title}`}
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
            {data.total} notice{data.total === 1 ? "" : "s"} · Page {data.page} of {data.totalPages}
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

      {/* Create / edit modal */}
      {modal.mode !== "closed" && (
        <NoticeFormModal
          notice={modal.mode === "edit" ? modal.notice : null}
          onClose={() => setModal({ mode: "closed" })}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && !deleting && setToDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl"
          >
            <h2 id="delete-title" className="font-serif text-lg font-bold">
              Delete this notice?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              &ldquo;{toDelete.title}&rdquo; will be removed permanently. If you only want to hide it, edit it and
              untick Published instead.
            </p>

            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}