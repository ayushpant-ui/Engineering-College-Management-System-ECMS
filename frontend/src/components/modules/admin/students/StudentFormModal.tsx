"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import { departmentName, type AdminStudent } from "@/lib/admin-students";

const semesterError = "Enter a semester from 1 to 12.";

const studentSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(120, "Max 120 characters."),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required.")
    .max(30, "Max 30 characters.")
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-_/.]*$/, "Only letters, numbers and - _ / ."),
  semester: z.number({ error: semesterError }).int(semesterError).min(1, semesterError).max(12, semesterError),
  department: z.string().trim().min(1, "Department is required.").max(100, "Max 100 characters."),
});

type StudentFormData = z.infer<typeof studentSchema>;

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

export default function StudentFormModal({
  student,
  onClose,
  onCreated,
  onUpdated,
}: {
  student: AdminStudent | null; // null = adding a new student
  onClose: () => void;
  onCreated: (student: AdminStudent, temporaryPassword: string) => void;
  onUpdated: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const isEdit = student !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: student?.fullName ?? "",
      registrationNumber: student?.registrationNumber ?? "",
      semester: student?.semester ?? 1,
      department: student ? (departmentName(student.department) === "—" ? "" : departmentName(student.department)) : "",
    },
  });

  async function onSubmit(values: StudentFormData) {
    setServerError("");
    try {
      if (isEdit) {
        // The registration number is the student's login ID, so it isn't sent
        await adminFetch(`/admin/students/${student.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullName: values.fullName,
            semester: values.semester,
            department: values.department,
          }),
        });
        onUpdated();
      } else {
        const result = await adminFetch<{ student: AdminStudent; temporaryPassword: string }>("/admin/students", {
          method: "POST",
          body: JSON.stringify(values),
        });
        onCreated(result.student, result.temporaryPassword);
      }
    } catch (err) {
      setServerError(err instanceof AdminApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  const error = (message?: string) => message && <p className="mt-1 text-sm text-red-500">{message}</p>;

  return (
    <Modal title={isEdit ? "Edit Student" : "Add Student"} onClose={onClose} busy={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            Full name
          </label>
          <input id="fullName" autoFocus {...register("fullName")} className={field} />
          {error(errors.fullName?.message)}
        </div>

        <div>
          <label htmlFor="registrationNumber" className="mb-1.5 block text-sm font-medium">
            Registration number
          </label>
          <input
            id="registrationNumber"
            placeholder="CE-2024-001"
            disabled={isEdit}
            {...register("registrationNumber")}
            className={field}
          />
          {isEdit ? (
            <p className="mt-1 text-xs text-muted-foreground">
              This is the student&apos;s login ID, so it can&apos;t be changed.
            </p>
          ) : (
            error(errors.registrationNumber?.message)
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium">
              Department
            </label>
            <input id="department" placeholder="Computer Engineering" {...register("department")} className={field} />
            {error(errors.department?.message)}
          </div>
          <div>
            <label htmlFor="semester" className="mb-1.5 block text-sm font-medium">
              Semester
            </label>
            <input id="semester" type="number" {...register("semester", { valueAsNumber: true })} className={field} />
            {error(errors.semester?.message)}
          </div>
        </div>

        {!isEdit && (
          <p className="text-xs text-muted-foreground">
            A temporary password is generated automatically and shown once after the student is created.
          </p>
        )}

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
            {isEdit ? "Save Changes" : "Add Student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}