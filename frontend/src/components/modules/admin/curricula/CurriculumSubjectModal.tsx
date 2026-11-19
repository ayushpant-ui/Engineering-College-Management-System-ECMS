"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { curriculumApi } from "@/lib/curriculum-api";
import type { CurriculumComponent, CurriculumSubject, Subject } from "@/lib/curriculum-types";

// Credit hours are typed as text so an unticked, empty box never blocks the form
const schema = z
  .object({
    subjectId: z.number({ error: "Choose a subject." }).int("Choose a subject.").min(1, "Choose a subject."),
    theoryOn: z.boolean(),
    theoryCredits: z.string(),
    practicalOn: z.boolean(),
    practicalCredits: z.string(),
  })
  .superRefine((d, ctx) => {
    const check = (on: boolean, credits: string, path: "theoryCredits" | "practicalCredits") => {
      if (!on) return;
      const text = credits.trim();
      const n = Number(text);
      if (!/^\d+$/.test(text) || n < 1 || n > 10) {
        ctx.addIssue({ code: "custom", message: "Whole number, 1 to 10.", path: [path] });
      }
    };
    check(d.theoryOn, d.theoryCredits, "theoryCredits");
    check(d.practicalOn, d.practicalCredits, "practicalCredits");
  });

type FormData = z.infer<typeof schema>;

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

export default function CurriculumSubjectModal({
  curriculumId,
  semester,
  availableSubjects,
  item,
  onClose,
  onSaved,
}: {
  curriculumId: number;
  semester: number;
  availableSubjects: Subject[]; // subjects not yet in this semester (add mode)
  item: CurriculumSubject | null; // null = adding
  onClose: () => void;
  onSaved: (isEdit: boolean) => void;
}) {
  const [serverError, setServerError] = useState("");
  const isEdit = item !== null;

  const creditsOf = (type: "THEORY" | "PRACTICAL") => item?.components.find((c) => c.type === type);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectId: item?.subject.id,
      theoryOn: isEdit ? !!creditsOf("THEORY") : true,
      theoryCredits: String(creditsOf("THEORY")?.creditHours ?? 3),
      practicalOn: isEdit ? !!creditsOf("PRACTICAL") : false,
      practicalCredits: String(creditsOf("PRACTICAL")?.creditHours ?? 1),
    },
  });

  const subjectId = watch("subjectId");
  const subject = item ? item.subject : availableSubjects.find((s) => s.id === subjectId);
  const hasTheory = !!subject?.components.includes("THEORY");
  const hasPractical = !!subject?.components.includes("PRACTICAL");

  // When a subject is picked, tick the parts it actually has
  useEffect(() => {
    if (isEdit || !subject) return;
    setValue("theoryOn", subject.components.includes("THEORY"));
    setValue("practicalOn", subject.components.includes("PRACTICAL"));
  }, [isEdit, subject, setValue]);

  async function onSubmit(values: FormData) {
    setServerError("");
    if (!subject) return;

    const components: CurriculumComponent[] = [];
    if (hasTheory && values.theoryOn) components.push({ type: "THEORY", creditHours: Number(values.theoryCredits) });
    if (hasPractical && values.practicalOn) components.push({ type: "PRACTICAL", creditHours: Number(values.practicalCredits) });

    if (components.length === 0) {
      setServerError("Choose at least one part (theory or practical).");
      return;
    }

    try {
      if (isEdit) await curriculumApi.updateCurriculumSubject(item.id, components);
      else await curriculumApi.addSubjectToCurriculum(curriculumId, { subjectId: subject.id, semester, components });
      onSaved(isEdit);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const error = (message?: string) => message && <p className="mt-1 text-sm text-red-500">{message}</p>;

  const partRow = (
    label: string,
    onName: "theoryOn" | "practicalOn",
    creditsName: "theoryCredits" | "practicalCredits",
    visible: boolean
  ) =>
    visible && (
      <div className="flex flex-wrap items-center gap-4 rounded-xl border p-3">
        <label className="flex min-w-[120px] cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register(onName)} />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor={creditsName} className="text-sm text-muted-foreground">
            Credit hours
          </label>
          <input
            id={creditsName}
            inputMode="numeric"
            maxLength={2}
            disabled={!watch(onName)}
            {...register(creditsName)}
            className={`${field} !w-20 !py-1.5 text-center`}
          />
        </div>
        {error(errors[creditsName]?.message)}
      </div>
    );

  return (
    <Modal
      title={isEdit ? `Edit ${item.subject.code}` : `Add a subject to semester ${semester}`}
      onClose={onClose}
      busy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="subjectId" className="mb-1.5 block text-sm font-medium">
            Subject
          </label>
          {isEdit ? (
            <p className="rounded-xl border bg-muted/40 px-4 py-2.5 text-sm">
              {item.subject.code} — {item.subject.name}
            </p>
          ) : (
            <>
              <select id="subjectId" autoFocus {...register("subjectId", { valueAsNumber: true })} className={field}>
                <option value="">Select a subject</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
              {error(errors.subjectId?.message)}
              {availableSubjects.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Every subject is already in this semester. Create a new one on the Subjects page.
                </p>
              )}
            </>
          )}
        </div>

        {subject && (
          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium">Parts and credit hours</legend>
            {partRow("Theory", "theoryOn", "theoryCredits", hasTheory)}
            {partRow("Practical", "practicalOn", "practicalCredits", hasPractical)}
            <p className="text-xs text-muted-foreground">
              Only the parts this subject has are shown. Untick a part to leave it out of this curriculum.
            </p>
          </fieldset>
        )}

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
            disabled={isSubmitting || !subject}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add to Semester"}
          </button>
        </div>
      </form>
    </Modal>
  );
}