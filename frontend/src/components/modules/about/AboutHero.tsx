"use client";

import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="border-b bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          className="text-5xl font-bold"
        >
          About Our College
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2 }}
          className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground"
        >
          Empowering future engineers through quality education,
          innovation, research and practical learning in a modern
          academic environment.
        </motion.p>

      </div>
    </section>
  );
}