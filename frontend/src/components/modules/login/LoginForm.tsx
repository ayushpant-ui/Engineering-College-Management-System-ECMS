"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import PasswordInput from "./PasswordInput";

const loginSchema = z.object({
  registrationNumber: z.string().trim().min(1, "Registration Number is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { registrationNumber: "", password: "", remember: false },
  });

  async function onSubmit({ registrationNumber, password, remember }: LoginFormData) {
    setLoading(true);
    setServerError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Nest sends { message: "Invalid credentials." } (or an array for validation errors)
        const message = Array.isArray(result.message) ? result.message[0] : result.message;
        setServerError(message || "Login failed. Please try again.");
        return;
      }

      // Backend wraps successful responses as { success: true, data: {...} }
      const { accessToken, user } = result.data;

      // "Remember me" keeps the session after the browser closes.
      // TODO: for production, prefer an httpOnly cookie set by the server.
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("accessToken", accessToken);
      storage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false); // always runs, so the button never gets stuck
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="registrationNumber" className="mb-2 block text-sm font-medium">
          Registration Number
        </label>
        <input
          id="registrationNumber"
          type="text"
          autoComplete="username"
          placeholder="Enter your Registration Number"
          {...register("registrationNumber")}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {errors.registrationNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.registrationNumber.message}</p>
        )}
      </div>

      <PasswordInput register={register} error={errors.password?.message} />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("remember")} />
          Remember Me
        </label>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot Password?
        </Link>
      </div>

      {/* Server error */}
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground transition hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}