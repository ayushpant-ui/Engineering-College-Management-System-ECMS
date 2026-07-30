// src/components/navbar/Logo.tsx

"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <motion.div
        whileHover={{
          rotate: -8,
          scale: 1.08,
        }}
        transition={{
          duration: 0.25,
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md"
      >
        <GraduationCap className="h-6 w-6" />
      </motion.div>

      <div>
        <h1 className="text-lg font-bold tracking-tight">
          School of Engineering
        </h1>

        <p className="text-xs text-muted-foreground">
          Far Western University
        </p>
      </div>
    </Link>
  );
}