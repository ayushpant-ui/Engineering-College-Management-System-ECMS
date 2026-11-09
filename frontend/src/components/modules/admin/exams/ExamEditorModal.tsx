"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { examApi } from "@/lib/exam-api";
import type { Exam } from "@/lib/exam-types";

const required = "Required";
const numberError = "Enter a number.";

const schema = z
  .object({
    name: z.string().trim().min(1, "Exam name is required.").max(150, "Max 150 characters."),
    semester: z.number({ error: "Enter a semester (1-8)." }).int("Enter a semester (1-8).").min(1, "Enter a semester (1-8).").max(8, "Enter a semester (1-8)."),
    fee: z.number({ error: numberError }).min(0, "Can't be negative."),
    backPaperFee: z.number({ error: numberError }).min(0, "Can't be negative."),
    formOpensAt: z.string().min(1, required),
    formClosesAt: z.string().min(1, required),
    examStartsAt: z.string().min(1, required),
    center: z.string().trim().min(1, "Exam center is required.").max(200),
    subjects: z
      .array(
        z.object({
          code: z.string().trim().min(1, required),
          name: z.string().trim().min(1, required),
          date: z.string().min(1, required),
          time: z.string().trim().min(1, required),
        })
      )
      .min(1, "Add at least one subject."),
  })
  .refine((d) => d.formClosesAt >= d.formOpensAt, {
    message: "Closing date must be on or after the opening date.",
    path: ["formClosesAt"],
  });

type ExamFormData = z.infer<typeof schema>;

const field =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";
const small = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function ExamEditorModal({
  exam,
  onClose,
  onSaved,
}: {
  exam: Exam | null; // null = creating
  onClose: () => void;
  onSaved: (exam: Exam, isEdit: boolean) => void;
}) {
  const [serverError, setServerError] = useState("");
  const isEdit = exam !== null;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(schema),
    defaultValues: exam
      ? {
          name: exam.name,
          semester: exam.semester,
          fee: exam.fee,
          backPaperFee: exam.backPaperFee,
          formOpensAt: exam.formOpensAt,
          formClosesAt: exam.formClosesAt,
          examStartsAt: exam.examStartsAt,
          center: exam.center,
          subjects: exam.subjects.map(({ code, name, date, time }) => ({ code, name, date, time })),
        }
      : {
          name: "",
          semester: 1,
          fee: 1500,
          backPaperFee: 500,
          formOpensAt: "",
          formClosesAt: "",
          examStartsAt: "",
          center: "School of Engineering, Far Western University, Kanchanpur",
          subjects: [{ code: "", name: "", date: "", time: "10:00 AM - 1:00 PM" }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "subjects" });

  async function onSubmit(values: ExamFormData) {
    setServerError("");
    try {
      const saved = await examApi.saveExam(values, exam?.id);
      onSaved(saved, isEdit);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const error = (message?: string) => message && <p className="mt-1 text-xs text-red-500">{message}</p>;

  return (
    <Modal title={isEdit ? "Edit Exam" : "New Exam"} onClose={onClose} busy={isSubmitting} wide>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Exam name</label>
            <input id="name" autoFocus placeholder="Fourth Semester Final Examination 2026" {...register("name")} className={field} />
            {error(errors.name?.message)}
          </div>
          <div>
            <label htmlFor="semester" className="mb-1.5 block text-sm font-medium">Semester</label>
            <input id="semester" type="number" {...register("semester", { valueAsNumber: true })} className={field} />
            {error(errors.semester?.message)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fee" className="mb-1.5 block text-sm font-medium">Exam fee (Rs.)</label>
            <input id="fee" type="number" {...register("fee", { valueAsNumber: true })} className={field} />
            {error(errors.fee?.message)}
          </div>
          <div>
            <label htmlFor="backPaperFee" className="mb-1.5 block text-sm font-medium">Fee per back paper (Rs.)</label>
            <input id="backPaperFee" type="number" {...register("backPaperFee", { valueAsNumber: true })} className={field} />
            {error(errors.backPaperFee?.message)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="formOpensAt" className="mb-1.5 block text-sm font-medium">Form opens</label>
            <input id="formOpensAt" type="date" {...register("formOpensAt")} className={field} />
            {error(errors.formOpensAt?.message)}
          </div>
          <div>
            <label htmlFor="formClosesAt" className="mb-1.5 block text-sm font-medium">Form closes</label>
            <input id="formClosesAt" type="date" {...register("formClosesAt")} className={field} />
            {error(errors.formClosesAt?.message)}
          </div>
          <div>
            <label htmlFor="examStartsAt" className="mb-1.5 block text-sm font-medium">Exam starts</label>
            <input id="examStartsAt" type="date" {...register("examStartsAt")} className={field} />
            {error(errors.examStartsAt?.message)}
          </div>
        </div>

        <div>
          <label htmlFor="center" className="mb-1.5 block text-sm font-medium">Exam center</label>
          <input id="center" {...register("center")} className={field} />
          {error(errors.center?.message)}
        </div>

        {/* Schedule */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Exam schedule</h3>
            <button
              type="button"
              onClick={() => append({ code: "", name: "", date: "", time: "10:00 AM - 1:00 PM" })}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add subject
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((item, index) => {
              const rowErrors = errors.subjects?.[index];
              return (
                <div key={item.id} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[110px_1fr_150px_170px_auto]">
                  <div>
                    <input aria-label="Subject code" placeholder="CMP 251" {...register(`subjects.${index}.code`)} className={small} />
                    {error(rowErrors?.code?.message)}
                  </div>
                  <div>
                    <input aria-label="Subject name" placeholder="Subject name" {...register(`subjects.${index}.name`)} className={small} />
                    {error(rowErrors?.name?.message)}
                  </div>
                  <div>
                    <input aria-label="Exam date" type="date" {...register(`subjects.${index}.date`)} className={small} />
                    {error(rowErrors?.date?.message)}
                  </div>
                  <div>
                    <input aria-label="Exam time" placeholder="10:00 AM - 1:00 PM" {...register(`subjects.${index}.time`)} className={small} />
                    {error(rowErrors?.time?.message)}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label="Remove subject"
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          {typeof errors.subjects?.message === "string" && <p className="mt-1 text-xs text-red-500">{errors.subjects.message}</p>}
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
            {isEdit ? "Save Changes" : "Create Exam"}
          </button>
        </div>
      </form>
    </Modal>
  );
}