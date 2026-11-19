"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { curriculumApi } from "@/lib/curriculum-api";
import type { Curriculum, Department } from "@/lib/curriculum-types";

const schema = z.object({
  name: z.string().trim().min(1, "Curriculum name is required.").max(150, "Max 150 characters."),
  version: z.string().trim().min(1, "Version is required.").max(30, "Max 30 characters."),
  departmentId: z.number({ error: "Choose a department." }).int("Choose a department.").min(1, "Choose a department."),
});

type CurriculumFormData = z.infer<typeof schema>;

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

export default function CurriculumFormModal({
  curriculum,
  onClose,
  onSaved,
}: {
  curriculum: Curriculum | null; // null = creating
  onClose: () => void;
  onSaved: (curriculum: Curriculum, isEdit: boolean) => void;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [serverError, setServerError] = useState("");
  const isEdit = curriculum !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CurriculumFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: curriculum?.name ?? "",
      version: curriculum?.version ?? "",
      departmentId: curriculum?.department.id,
    },
  });

  useEffect(() => {
    curriculumApi.listDepartments().then(setDepartments).catch(() => setServerError("Could not load departments."));
  }, []);

  async function onSubmit(values: CurriculumFormData) {
    setServerError("");
    try {
      const saved = isEdit
        ? await curriculumApi.updateCurriculum(curriculum.id, { name: values.name, version: values.version })
        : await curriculumApi.createCurriculum(values);
      onSaved(saved, isEdit);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const error = (message?: string) => message && <p className="mt-1 text-sm text-red-500">{message}</p>;

  return (
    <Modal title={isEdit ? "Edit Curriculum" : "New Curriculum"} onClose={onClose} busy={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Curriculum name</label>
          <input id="name" autoFocus placeholder="Bachelor of Computer Engineering" {...register("name")} className={field} />
          {error(errors.name?.message)}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="departmentId" className="mb-1.5 block text-sm font-medium">Department</label>
            <select
              id="departmentId"
              disabled={isEdit}
              {...register("departmentId", { valueAsNumber: true })}
              className={field}
            >
              <option value="">Select a department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {isEdit ? (
              <p className="mt-1 text-xs text-muted-foreground">The department can't be changed after creation.</p>
            ) : (
              error(errors.departmentId?.message)
            )}
          </div>
          <div>
            <label htmlFor="version" className="mb-1.5 block text-sm font-medium">Version</label>
            <input id="version" placeholder="2023" {...register("version")} className={field} />
            {error(errors.version?.message)}
          </div>
        </div>

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Curriculum"}
          </button>
        </div>
      </form>
    </Modal>
  );
}