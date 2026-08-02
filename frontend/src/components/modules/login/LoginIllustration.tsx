"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users } from "lucide-react";

export default function LoginIllustration() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">

      {/* Background Image */}
      {/* <Image
        src="/login/engineering.jpg"
        alt="School of Engineering"
        fill
        priority
        className="object-cover opacity-20"
      /> */}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex h-full w-full flex-col justify-center px-16 text-white"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">

          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
            <GraduationCap className="h-9 w-9" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              School of Engineering
            </h1>

            <p className="text-blue-100">
              Far Western University
            </p>
          </div>

        </div>

        {/* Heading */}
        <h2 className="max-w-xl text-5xl font-extrabold leading-tight">
          Welcome to the Engineering Management Portal
        </h2>

        <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
          Access notices, results, attendance, faculty information,
          academic resources, and administrative services from one
          secure platform.
        </p>

        {/* Features */}
        <div className="mt-12 space-y-6">

          <div className="flex items-center gap-4">
            <BookOpen className="h-7 w-7" />
            <span className="text-lg">
              Academic Resources
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Users className="h-7 w-7" />
            <span className="text-lg">
              Student & Faculty Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <GraduationCap className="h-7 w-7" />
            <span className="text-lg">
              Secure University Access
            </span>
          </div>

        </div>

      </motion.div>

      {/* Decorative Circles */}

      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

    </div>
  );
}