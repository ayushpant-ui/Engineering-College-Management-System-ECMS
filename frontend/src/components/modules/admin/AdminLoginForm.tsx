"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";

import { getAdminSession, setAdminSession } from "@/lib/admin-session";

const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in? Skip the form.
  useEffect(() => {
    if (getAdminSession()) router.replace("/admin");
  }, [router]);

  async function onSubmit(values: AdminLoginData) {
    setLoading(true);
    setServerError("");

    try {
      let response: Response;
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } catch {
        setServerError("Could not reach the server. Check your connection and try again.");
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(result.message) ? result.message[0] : result.message;
        setServerError(
          response.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : message || "Login failed. Please try again."
        );
        return;
      }

      // Backend wraps successful responses as { success: true, data: {...} }
      const payload = result.data ?? result;
      const token = payload.accessToken ?? payload.accesstoken ?? payload.access_token ?? payload.token;

      if (!token || !payload.user) {
        console.error("Unexpected admin login response:", result);
        setServerError("Login succeeded but the server response was unexpected.");
        return;
      }

      setAdminSession(token, payload.user);
      router.replace("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Authorized administrators only.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            {...register("email")}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

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
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}