"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import type { AdminStudent } from "@/lib/admin-students";

const semesterError = "Enter a semester from 1 to 12.";

const studentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(120, "Max 120 characters."),

  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required.")
    .max(30, "Max 30 characters.")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9\-_/.]*$/,
      "Only letters, numbers and - _ / .",
    ),

  semester: z
    .number({ error: semesterError })
    .int(semesterError)
    .min(1, semesterError)
    .max(12, semesterError),

  departmentId: z
    .number({ error: "Select a department." })
    .int("Select a valid department.")
    .min(1, "Select a department."),

  admissionYearId: z
    .number({ error: "Select an admission year." })
    .int("Select a valid admission year.")
    .min(1, "Select an admission year."),
});

type StudentFormData = z.infer<typeof studentSchema>;

type DepartmentOption = {
  id: number;
  name: string;
};

type AcademicYearOption = {
  id: number;
  name: string;
};

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

export default function StudentFormModal({
  student,
  onClose,
  onCreated,
  onUpdated,
}: {
  student: AdminStudent | null;
  onClose: () => void;
  onCreated: (student: AdminStudent, temporaryPassword: string) => void;
  onUpdated: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

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
      departmentId: student?.department.id,
      admissionYearId: student?.admissionYear.id,
    },
  });

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setServerError("");

      try {
        const [departmentData, academicYearData] = await Promise.all([
          adminFetch<DepartmentOption[]>("/admin/departments"),
          adminFetch<AcademicYearOption[]>("/admin/academic-years"),
        ]);

        setDepartments(departmentData);
        setAcademicYears(academicYearData);
      } catch (err) {
        setServerError(
          err instanceof AdminApiError
            ? err.message
            : "Could not load departments and admission years.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadOptions();
  }, []);

  async function onSubmit(values: StudentFormData) {
    setServerError("");

    try {
      if (isEdit) {
        await adminFetch(`/admin/students/${student.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullName: values.fullName,
            semester: values.semester,
            departmentId: values.departmentId,
            admissionYearId: values.admissionYearId,
          }),
        });

        onUpdated();
      } else {
        const result = await adminFetch<{
          student: AdminStudent;
          temporaryPassword: string;
        }>("/admin/students", {
          method: "POST",
          body: JSON.stringify(values),
        });

        onCreated(result.student, result.temporaryPassword);
      }
    } catch (err) {
      setServerError(
        err instanceof AdminApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  const error = (message?: string) =>
    message && (
      <p className="mt-1 text-sm text-red-500">{message}</p>
    );

  return (
    <Modal
      title={isEdit ? "Edit Student" : "Add Student"}
      onClose={onClose}
      busy={isSubmitting}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* Full name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium"
          >
            Full name
          </label>

          <input
            id="fullName"
            autoFocus
            {...register("fullName")}
            className={field}
          />

          {error(errors.fullName?.message)}
        </div>

        {/* Registration number */}
        <div>
          <label
            htmlFor="registrationNumber"
            className="mb-1.5 block text-sm font-medium"
          >
            Registration number
          </label>

          <input
            id="registrationNumber"
            placeholder="EG-2025-1-1-0056"
            disabled={isEdit}
            {...register("registrationNumber")}
            className={field}
          />

          {isEdit ? (
            <p className="mt-1 text-xs text-muted-foreground">
              This is the student's login ID, so it can't be changed.
            </p>
          ) : (
            error(errors.registrationNumber?.message)
          )}
        </div>

        {/* Department and semester */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="departmentId"
              className="mb-1.5 block text-sm font-medium"
            >
              Department
            </label>

            <select
              id="departmentId"
              disabled={loadingOptions}
              {...register("departmentId", { valueAsNumber: true })}
              className={field}
            >
              <option value={0}>
                {loadingOptions
                  ? "Loading departments..."
                  : "Select department"}
              </option>

              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {error(errors.departmentId?.message)}
          </div>

          <div>
            <label
              htmlFor="semester"
              className="mb-1.5 block text-sm font-medium"
            >
              Semester
            </label>

            <select
              id="semester"
              {...register("semester", { valueAsNumber: true })}
              className={field}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ),
              )}
            </select>

            {error(errors.semester?.message)}
          </div>
        </div>

        {/* Admission year */}
        <div>
          <label
            htmlFor="admissionYearId"
            className="mb-1.5 block text-sm font-medium"
          >
            Admission year
          </label>

          <select
            id="admissionYearId"
            disabled={loadingOptions}
            {...register("admissionYearId", { valueAsNumber: true })}
            className={field}
          >
            <option value={0}>
              {loadingOptions
                ? "Loading admission years..."
                : "Select admission year"}
            </option>

            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>

          {error(errors.admissionYearId?.message)}
        </div>

        {!isEdit && (
          <p className="text-xs text-muted-foreground">
            A temporary password is generated automatically and shown once
            after the student is created.
          </p>
        )}

        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        {/* Actions */}
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
            disabled={isSubmitting || loadingOptions}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isEdit ? "Save Changes" : "Add Student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}