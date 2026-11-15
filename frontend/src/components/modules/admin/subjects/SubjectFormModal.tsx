"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { curriculumApi } from "@/lib/curriculum-api";
import type { ComponentType, Subject } from "@/lib/curriculum-types";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Subject code is required.")
      .max(20, "Max 20 characters.")
      .regex(/^[A-Za-z0-9][A-Za-z0-9 \-_./]*$/, "Use letters, numbers, spaces and - _ / ."),
    name: z.string().trim().min(1, "Subject name is required.").max(150, "Max 150 characters."),
    theory: z.boolean(),
    practical: z.boolean(),
  })
  .refine((d) => d.theory || d.practical, { message: "Choose at least one: theory or practical.", path: ["theory"] });

type SubjectFormData = z.infer<typeof schema>;

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
    resolver: zodResolver(schema),
    defaultValues: {
      code: subject?.code ?? "",
      name: subject?.name ?? "",
      theory: subject ? subject.components.includes("THEORY") : true,
      practical: subject ? subject.components.includes("PRACTICAL") : false,
    },
  });

  async function onSubmit(values: SubjectFormData) {
    setServerError("");
    const components: ComponentType[] = [];
    if (values.theory) components.push("THEORY");
    if (values.practical) components.push("PRACTICAL");

    try {
      const saved = isEdit
        ? await curriculumApi.updateSubject(subject.id, { code: values.code, name: values.name, components })
        : await curriculumApi.createSubject({ code: values.code, name: values.name, components });
      onSaved(saved, isEdit);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Parts of this subject</legend>
          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="checkbox" {...register("theory")} />
              Theory
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="checkbox" {...register("practical")} />
              Practical
            </label>
          </div>
          {error(errors.theory?.message)}
          <p className="mt-1 text-xs text-muted-foreground">Credit hours for each part are set when the subject is added to a curriculum.</p>
        </fieldset>

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
            {isEdit ? "Save Changes" : "Create Subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}