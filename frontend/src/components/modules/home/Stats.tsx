"use client";

import { motion } from "framer-motion";

const stats = [
  {
    title: "Students",
    value: "0",
  },
  {
    title: "Faculty",
    value: "0",
  },
  {
    title: "Departments",
    value: "0",
  },
  {
    title: "Programs",
    value: "3",
  },
];

export default function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 border-b border-border mt-6">

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((item, index) => (

          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * .15,
            }}
            viewport={{ once: true }}
            className="rounded-2xl border bg-card p-8 text-center shadow-sm"
          >

            <h2 className="text-4xl font-bold text-primary">

              {item.value}

            </h2>

            <p className="mt-3 text-muted-foreground">

              {item.title}

            </p>

          </motion.div>

        ))}

      </div>

    </section>
  );
}