"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { contactSubjects } from "@/lib/contactdata";
import { contactSchema, type ContactFormValues } from "@/lib/contactschema";

type Status = "idle" | "success" | "error";

const MAX_MESSAGE_LENGTH = 500;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", subject: undefined, message: "" },
  });

  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("idle");
    try {
      // Replace with your real endpoint, e.g.
      // await fetch("/api/contact", { method: "POST", body: JSON.stringify(values) })
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors";
  const borderClass = (hasError: boolean) =>
    hasError
      ? "border-red-400 focus:ring-red-400/40"
      : "border-slate-200 dark:border-slate-700";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
        Send a Message
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        We usually reply within one business day.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="fullName" className="sr-only">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Full Name"
            {...register("fullName")}
            className={`${inputBase} ${borderClass(!!errors.fullName)}`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            {...register("email")}
            className={`${inputBase} ${borderClass(!!errors.email)}`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="sr-only">
            Subject
          </label>
          <select
            id="subject"
            defaultValue=""
            {...register("subject")}
            className={`${inputBase} appearance-none ${borderClass(!!errors.subject)}`}
          >
            <option value="" disabled>
              Select a subject
            </option>
            {contactSubjects.map((subject) => (
              <option key={subject} value={subject} className="text-slate-800">
                {subject}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Write your message..."
            {...register("message")}
            className={`${inputBase} resize-none ${borderClass(!!errors.message)}`}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.message ? (
              <p className="text-xs text-red-500">{errors.message.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-400">
              {messageLength}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </button>

        {status === "success" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 px-3.5 py-2.5 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your message has been sent. We&apos;ll get back to you soon.
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            Something went wrong. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
