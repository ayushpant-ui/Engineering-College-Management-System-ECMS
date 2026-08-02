"use client";

import { motion } from "framer-motion";
import LoginForm from "./LoginForm";
import ThemeToggle from "@/components/modules/navbar/ThemeToggle";

export default function LoginCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl">

        {/* Header */}

        <div className="mb-8 flex items-start justify-between">

          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access the School of Engineering Portal.
            </p>
          </div>

          <ThemeToggle />

        </div>

        {/* Login Form */}

        <LoginForm />

        {/* Divider */}

        <div className="my-8 flex items-center gap-4">

          <div className="h-px flex-1 bg-border" />

          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            OR
          </span>

          <div className="h-px flex-1 bg-border" />

        </div>

        {/* Future Google Login */}

        <button
          disabled
          className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border bg-muted text-sm font-medium text-muted-foreground"
        >
          Continue with Google (Coming Soon)
        </button>

        {/* Footer */}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Having trouble signing in?
          <button className="ml-2 font-medium text-primary hover:underline">
            Contact Administrator
          </button>
        </p>

      </div>
    </motion.div>
  );
}