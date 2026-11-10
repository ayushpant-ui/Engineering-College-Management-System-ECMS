"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExamPeriod,
  ExamPeriodInput,
} from "@/lib/exam-periods";

const schema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
}).refine(
  (data) =>
    !data.startsAt ||
    !data.endsAt ||
    data.endsAt >= data.startsAt,
  {
    message: "End date cannot be earlier than start date",
    path: ["endsAt"],
  }
);

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initialData?: ExamPeriod | null;
  onClose: () => void;
  onSubmit: (data: ExamPeriodInput) => Promise<void>;
}

export default function ExamPeriodFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      startsAt: "",
      endsAt: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        startsAt: initialData?.startsAt?.slice(0, 10) ?? "",
        endsAt: initialData?.endsAt?.slice(0, 10) ?? "",
      });
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  const submitHandler = async (data: FormData) => {
    await onSubmit({
      name: data.name.trim(),
      startsAt: data.startsAt
        ? new Date(`${data.startsAt}T00:00:00`).toISOString()
        : null,
      endsAt: data.endsAt
        ? new Date(`${data.endsAt}T23:59:59`).toISOString()
        : null,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-[#111b30] px-4 py-3 text-sm text-white outline-none focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111b30] p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {initialData ? "Edit Exam Period" : "New Exam Period"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage your college examination period.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Exam Period Name
            </label>

            <input
              {...register("name")}
              placeholder="e.g. 2026 Final Examination"
              className={inputClass}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Start Date
            </label>

            <input
              type="date"
              {...register("startsAt")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              End Date
            </label>

            <input
              type="date"
              {...register("endsAt")}
              className={inputClass}
            />

            {errors.endsAt && (
              <p className="mt-1 text-xs text-red-400">
                {errors.endsAt.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Create Period"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}