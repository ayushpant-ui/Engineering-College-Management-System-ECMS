"use client";

import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Microscope,
  Trophy,
} from "lucide-react";

const statistics = [
  {
    title: "Students",
    value: "0+",
    icon: Users,
  },
  {
    title: "Faculty Members",
    value: "0+",
    icon: GraduationCap,
  },
  {
    title: "Departments",
    value: "0",
    icon: Building2,
  },
  {
    title: "Research Labs",
    value: "0+",
    icon: Microscope,
  },
  {
    title: "Programs",
    value: "0",
    icon: BookOpen,
  },
  {
    title: "Awards",
    value: "0+",
    icon: Trophy,
  },
];

export default function Statistics() {
  return (
    <section className="py-16 bg-muted/30 border-b border-border">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Our Numbers
          </h2>

          <p className="mt-3 text-muted-foreground">
            A glimpse of our academic excellence and institutional growth.
          </p>

        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {statistics.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.5,
                }}
                className="rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-4xl font-bold text-primary">
                      {item.value}
                    </h3>

                    <p className="mt-2 text-muted-foreground">
                      {item.title}
                    </p>

                  </div>

                  <div className="rounded-xl bg-primary/10 p-4">

                    <Icon className="h-8 w-8 text-primary" />

                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}