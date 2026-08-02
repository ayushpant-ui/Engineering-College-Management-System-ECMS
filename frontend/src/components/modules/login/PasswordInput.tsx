"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

type LoginFormData = {
  email: string;
  password: string;
  remember?: boolean;
};

interface PasswordInputProps {
  register: UseFormRegister<LoginFormData>;
  error?: string;
}

export default function PasswordInput({
  register,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Password
      </label>

      <div className="relative">

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          {...register("password")}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>

      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}