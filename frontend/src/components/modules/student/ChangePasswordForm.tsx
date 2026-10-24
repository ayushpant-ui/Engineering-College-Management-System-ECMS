"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must contain a letter.")
      .regex(/[0-9]/, "Password must contain a number."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Password input with a show/hide toggle
function PasswordField({
  id,
  label,
  error,
  autoComplete,
  registration,
}: {
  id: string;
  label: string;
  error?: string;
  autoComplete: string;
  registration: UseFormRegisterReturn;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          {...registration}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 pr-11 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function getSession() {
  const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
  const token = storage.getItem("accessToken");
  return token ? { storage, token } : null;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Must be logged in to change a password
  useEffect(() => {
    if (!getSession()) {
      router.replace("/login"); 
      return;
    }
    setReady(true);
  }, [router]);

  const newPassword = watch("newPassword") ?? "";
  const rules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "Contains a letter", ok: /[A-Za-z]/.test(newPassword) },
    { label: "Contains a number", ok: /[0-9]/.test(newPassword) },
  ];

  async function onSubmit({ currentPassword, newPassword }: ChangePasswordData) {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      let response: Response;
      try {
        
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/student/change-password`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          }
        );
      } catch {
        setServerError("Could not reach the server. Check your connection and try again.");
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (response.status === 401 && !result?.message) {
        // Session expired
        session.storage.removeItem("accessToken");
        session.storage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const message = Array.isArray(result.message) ? result.message[0] : result.message;
        setServerError(message || "Could not change password. Please try again.");
        return;
      }

      // It Clear the "must change password" flag so the dashboard warning disappears
      try {
        const user = JSON.parse(session.storage.getItem("user") ?? "{}");
        session.storage.setItem("user", JSON.stringify({ ...user, mustChangePassword: false }));
      } catch {
        /* ignore malformed stored user */
      }

      setSuccess(true);
      setTimeout(() => router.replace("/student/dashboard"), 1500);
    } catch (err) {
      console.error("Change password error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>;
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Change Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a new password for your account.
          </p>
        </div>
      </div>

      {success ? (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 px-3.5 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Password changed successfully. Redirecting to your dashboard...
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            autoComplete="current-password"
            registration={register("currentPassword")}
            error={errors.currentPassword?.message}
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            autoComplete="new-password"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
          />

          <ul className="space-y-1 text-xs">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={rule.ok ? "text-green-600 dark:text-green-400" : "text-slate-400"}
              >
                {rule.ok ? "✓" : "○"} {rule.label}
              </li>
            ))}
          </ul>

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>

          <Link
            href="/student/dashboard"
            className="block text-center text-sm text-slate-500 hover:text-primary dark:text-slate-400"
          >
            Back to dashboard
          </Link>
        </form>
      )}
    </div>
  );
}