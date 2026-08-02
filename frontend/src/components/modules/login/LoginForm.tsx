"use client";

import { useState } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import PasswordInput from "./PasswordInput";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email."),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),

  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);

    console.log(data);

    // Later we'll call backend API here

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}

      <div>

        <label className="mb-2 block text-sm font-medium">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}

      <PasswordInput
        register={register}
        error={errors.password?.message}
      />

      {/* Remember */}

      <div className="flex items-center justify-between">

        <label className="flex items-center gap-2 text-sm">

          <input
            type="checkbox"
            {...register("remember")}
          />

          Remember Me

        </label>

        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </Link>

      </div>

      {/* Button */}

      <button
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}