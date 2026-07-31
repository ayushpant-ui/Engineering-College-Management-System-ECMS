"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10">

        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      </div>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6 }}
          >

            <span className="inline-flex rounded-full border px-4 py-1 text-sm font-medium">

              Engineering College Portal

            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-6xl">

              Welcome to
              <br />

              <span className="text-primary">
                School of Engineering
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-8">

              A centralized digital platform providing academic information,
              notices, events, departments, student services and secure
              access to institutional resources.

            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition hover:scale-105"
              >
                Login

                <ArrowRight size={18} />
              </Link>

              <Link
                href="/about"
                className="rounded-lg border px-6 py-3 transition hover:bg-muted"
              >
                Explore College
              </Link>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6 }}
            className="flex justify-center"
          >

            <div className="flex h-96 w-96 items-center justify-center rounded-3xl border bg-card shadow-xl">

              <div className="text-center">

                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">

                  <GraduationCap
                    className="text-primary"
                    size={60}
                  />

                </div>

                <h3 className="mt-6 text-2xl font-semibold">

                  FWU-Engineering

                </h3>

                <p className="mt-2 text-muted-foreground">


                </p>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}