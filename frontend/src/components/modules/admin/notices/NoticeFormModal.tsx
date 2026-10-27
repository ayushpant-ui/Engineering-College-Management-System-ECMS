"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";

import { adminFetch, AdminApiError } from "@/lib/admin-api";

export const NOTICE_CATEGORIES = ["GENERAL", "ACADEMIC", "EXAM", "ADMISSION", "EVENT"] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export interface AdminNotice {
  id: number;
  title: string;
  body: string;
  category: NoticeCategory;
  attachmentUrl: string | null;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string;
}

const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Keep the title under 200 characters."),
  body: z.string().trim().min(1, "Notice text is required.").max(5000, "Keep the text under 5000 characters."),
  category: z.enum(NOTICE_CATEGORIES),
  attachmentUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "Must start with http://, https:// or /"),
  isPinned: z.boolean(),
  isPublished: z.boolean(),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function NoticeFormModal({
  notice,
  onClose,
  onSaved,
}: {
  notice: AdminNotice | null; // null = creating a new notice
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [serverError, setServerError] = useState("");
  const isEdit = notice !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: notice?.title ?? "",
      body: notice?.body ?? "",
      category: notice?.category ?? "GENERAL",
      attachmentUrl: notice?.attachmentUrl ?? "",
      isPinned: notice?.isPinned ?? false,
      isPublished: notice?.isPublished ?? true,
    },
  });

  // Close on Escape and lock page scrolling while the modal is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isSubmitting && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, isSubmitting]);

  async function onSubmit(values: NoticeFormData) {
    setServerError("");
    try {
      await adminFetch(isEdit ? `/admin/notices/${notice.id}` : "/admin/notices", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(values), // attachmentUrl "" tells the backend to clear it
      });
      onSaved(isEdit ? "Notice updated." : "Notice created.");
    } catch (err) {
      setServerError(err instanceof AdminApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="notice-modal-title" className="font-serif text-xl font-bold">
            {isEdit ? "Edit Notice" : "New Notice"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title
            </label>
            <input id="title" autoFocus {...register("title")} className={field} />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
              Notice text
            </label>
            <textarea id="body" rows={6} {...register("body")} className={`${field} resize-y`} />
            {errors.body && <p className="mt-1 text-sm text-red-500">{errors.body.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
                Category
              </label>
              <select id="category" {...register("category")} className={field}>
                {NOTICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="attachmentUrl" className="mb-1.5 block text-sm font-medium">
                Attachment link <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="attachmentUrl"
                placeholder="/notices/routine.pdf or https://..."
                {...register("attachmentUrl")}
                className={field}
              />
              {errors.attachmentUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.attachmentUrl.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isPublished")} />
              Published (visible on the website)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isPinned")} />
              Pin to top
            </label>
          </div>

          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400"
            >
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}