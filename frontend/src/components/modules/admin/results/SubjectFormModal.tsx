"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import type { Subject } from "@/lib/admin-results";

const num = (message: string) => z.number({ error: message }).int(message);

const subjectSchema = z.object({
  code: z.string().trim().min(1, "Code is required.").max(20, "Max 20 characters."),
  name: z.string().trim().min(1, "Name is required.").max(150, "Max 150 characters."),
  semester: num("Enter a semester from 1 to 12.").min(1, "Enter a semester from 1 to 12.").max(12, "Enter a semester from 1 to 12."),
  department: z.string().trim().min(1, "Department is required.").max(100),
  creditHours: num("Enter credit hours (1-10).").min(1, "Enter credit hours (1-10).").max(10, "Enter credit hours (1-10)."),
  fullMarks: num("Enter the full marks.").min(1, "Enter the full marks.").max(1000, "Max 1000."),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function SubjectFormModal({
  subject,
  onClose,
  onSaved,
}: {
  subject: Subject | null; // null = creating
  onClose: () => void;
  onSaved: (subject: Subject, isEdit: boolean) => void;
}) {
  const [serverError, setServerError] = useState("");
  const isEdit = subject !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      code: subject?.code ?? "",
      name: subject?.name ?? "",
      semester: subject?.semester ?? 1,
      department: subject?.department ?? "",
      creditHours: subject?.creditHours ?? 3,
      fullMarks: subject?.fullMarks ?? 100,
    },
  });

  async function onSubmit(values: SubjectFormData) {
    setServerError("");
    try {
      const saved = await adminFetch<Subject>(
        isEdit ? `/admin/results/subjects/${subject.id}` : "/admin/results/subjects",
        { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(values) }
      );
      onSaved(saved, isEdit);
    } catch (err) {
      setServerError(err instanceof AdminApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  const error = (message?: string) => message && <p className="mt-1 text-sm text-red-500">{message}</p>;

  return (
    <Modal title={isEdit ? "Edit Subject" : "New Subject"} onClose={onClose} busy={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium">Code</label>
            <input id="code" autoFocus placeholder="CMP 201" {...register("code")} className={field} />
            {error(errors.code?.message)}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Subject name</label>
            <input id="name" placeholder="Data Structures & Algorithms" {...register("name")} className={field} />
            {error(errors.name?.message)}
          </div>
        </div>

        <div>
          <label htmlFor="department" className="mb-1.5 block text-sm font-medium">Department</label>
          <input id="department" placeholder="Computer Engineering" {...register("department")} className={field} />
          <p className="mt-1 text-xs text-muted-foreground">
            Write it exactly as it&apos;s stored for students (e.g. Computer Engineering).
          </p>
          {error(errors.department?.message)}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="semester" className="mb-1.5 block text-sm font-medium">Semester</label>
            <input id="semester" type="number" {...register("semester", { valueAsNumber: true })} className={field} />
            {error(errors.semester?.message)}
          </div>
          <div>
            <label htmlFor="creditHours" className="mb-1.5 block text-sm font-medium">Credit hours</label>
            <input id="creditHours" type="number" {...register("creditHours", { valueAsNumber: true })} className={field} />
            {error(errors.creditHours?.message)}
          </div>
          <div>
            <label htmlFor="fullMarks" className="mb-1.5 block text-sm font-medium">Full marks</label>
            <input id="fullMarks" type="number" {...register("fullMarks", { valueAsNumber: true })} className={field} />
            {error(errors.fullMarks?.message)}
          </div>
        </div>

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
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
            {isEdit ? "Save Changes" : "Create Subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}