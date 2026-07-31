"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Image from "next/image";

export default function AboutCollege() {
  return (
    <section className="py-16 border-b border-border">

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        {/* Image */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >

          <div className="flex h-96 w-full max-w-md items-center justify-center rounded-3xl border bg-card shadow">

            <div className="text-center">
                {/* <Image src ='/Engineeringpic.jpeg' /> */}
              <GraduationCap
                size={70}
                className="mx-auto text-primary"
              />

              <p className="mt-6 text-muted-foreground">
                FWU Engineering
              </p>

            </div>

          </div>

        </motion.div>

        {/* Content */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >

          <h2 className="text-4xl font-bold">
            School of Engineering
          </h2>

          <p className="mt-6 leading-8 text-muted-foreground">

            The School of Engineering is dedicated to producing
            competent engineers through academic excellence,
            innovation, research and industry-oriented education.

          </p>

          <p className="mt-4 leading-8 text-muted-foreground">

            Our institution offers modern laboratories,
            experienced faculty members, collaborative learning
            and opportunities that prepare students for successful
            engineering careers.

          </p>

        </motion.div>

      </div>

    </section>
  );
}