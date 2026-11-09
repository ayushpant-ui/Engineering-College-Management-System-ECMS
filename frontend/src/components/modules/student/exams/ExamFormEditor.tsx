"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { examApi } from "@/lib/exam-api";
import { formatDate, formatMoney } from "@/lib/exam-format";
import { calculateFee, type BackPaper, type Exam, type ExamForm, type StudentInfo } from "@/lib/exam-types";

const schema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number."),
  declaration: z.boolean().refine((value) => value, "Please confirm the declaration."),
});
type FormData = z.infer<typeof schema>;

const card = "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60";
const field =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function ExamFormEditor({
  exam,
  student,
  backPaperOptions,
  onSubmitted,
}: {
  exam: Exam;
  student: StudentInfo;
  backPaperOptions: BackPaper[];
  onSubmitted: (form: ExamForm) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", declaration: false },
  });

  const backPapers = backPaperOptions.filter((o) => selected.includes(o.code));
  const total = calculateFee(exam, backPapers.length);

  const toggle = (code: string) =>
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  async function onSubmit(values: FormData) {
    setServerError("");
    try {
      const form = await examApi.submitForm(exam, student, { phone: values.phone, backPapers });
      onSubmitted(form);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const details = [
    { label: "Full name", value: student.fullName },
    { label: "Registration number", value: student.registrationNumber },
    { label: "Department", value: student.department },
    { label: "Semester", value: String(student.semester) },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* 1. Details */}
      <section className={card}>
        <h2 className="font-serif text-lg font-bold">1. Your details</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 max-w-sm">
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Mobile number
          </label>
          <input id="phone" inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" {...register("phone")} className={field} />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </section>

      {/* 2. Subjects */}
      <section className={card}>
        <h2 className="font-serif text-lg font-bold">2. Subjects for this exam</h2>
        <p className="mt-1 text-sm text-muted-foreground">All regular subjects of semester {exam.semester} are included.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">Code</th>
                <th className="py-2 pr-3 font-semibold">Subject</th>
                <th className="py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exam.subjects.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap py-2.5 pr-3 font-medium">{s.code}</td>
                  <td className="py-2.5 pr-3">{s.name}</td>
                  <td className="whitespace-nowrap py-2.5 text-muted-foreground">{formatDate(s.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Back papers */}
      <section className={card}>
        <h2 className="font-serif text-lg font-bold">3. Back papers (optional)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tick any earlier subject you want to re-appear in. Each adds {formatMoney(exam.backPaperFee)} to your fee.
        </p>
        {backPaperOptions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No earlier subjects are available.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {backPaperOptions.map((option) => (
              <li key={option.code}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.code)}
                    onChange={() => toggle(option.code)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">{option.code}</span>
                    <span className="block text-muted-foreground">{option.name}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4. Fee + submit */}
      <section className={card}>
        <h2 className="font-serif text-lg font-bold">4. Fee summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Regular exam fee</dt>
            <dd>{formatMoney(exam.fee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Back papers ({backPapers.length} × {formatMoney(exam.backPaperFee)})
            </dt>
            <dd>{formatMoney(backPapers.length * exam.backPaperFee)}</dd>
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>

        <label className="mt-5 flex items-start gap-3 text-sm">
          <input type="checkbox" {...register("declaration")} className="mt-0.5" />
          <span>I declare that the information above is correct and I will follow the examination rules.</span>
        </label>
        {errors.declaration && <p className="mt-1 text-sm text-red-500">{errors.declaration.message}</p>}

        {serverError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit exam form
        </button>
        <p className="mt-2 text-xs text-muted-foreground">You can pay the fee right after submitting.</p>
      </section>
    </form>
  );
}