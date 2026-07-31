"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function PrincipalMessage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Principal Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">

              <Image
                src="/images/principal.jpeg"
                alt="Principal"
                width={380}
                height={500}
                className="h-[500px] w-[380px] object-cover transition duration-300 hover:scale-105"
                priority
              />

            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Quote className="mb-4 h-12 w-12 text-primary" />

            <h2 className="text-4xl font-bold">
              Message from the Principal
            </h2>

            <p className="mt-6 leading-8 text-muted-foreground">
              Welcome to the School of Engineering. Our institution is
              committed to providing quality engineering education through
              academic excellence, innovation, research, and practical
              learning.
            </p>

            <p className="mt-4 leading-8 text-muted-foreground">
              We strive to develop technically competent, ethical, and
              innovative engineers who are prepared to solve real-world
              challenges and contribute meaningfully to society.
            </p>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold">
                Ayush Pant
              </h3>

              <p className="text-muted-foreground">
                Principal, School of Engineering
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}