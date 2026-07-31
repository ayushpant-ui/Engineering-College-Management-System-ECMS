"use client";

import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";

export default function VisionMission() {
  return (
    <section className="bg-muted/40 py-24">

      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-card p-8"
        >

          <Eye
            className="mb-5 text-primary"
            size={40}
          />

          <h3 className="text-2xl font-semibold">
            Our Vision
          </h3>

          <p className="mt-5 leading-8 text-muted-foreground">

            To become a leading engineering institution recognized
            for excellence in education, research and innovation.

          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: .2 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-card p-8"
        >

          <Target
            className="mb-5 text-primary"
            size={40}
          />

          <h3 className="text-2xl font-semibold">
            Our Mission
          </h3>

          <p className="mt-5 leading-8 text-muted-foreground">

            To provide quality engineering education,
            promote research, encourage innovation and
            develop ethical professionals who contribute
            to society.

          </p>

        </motion.div>

      </div>

    </section>
  );
}