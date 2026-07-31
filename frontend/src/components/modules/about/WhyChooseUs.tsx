"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  FlaskConical,
  Users,
  BriefcaseBusiness,
  Award,
  Microscope,
} from "lucide-react";

const features = [
  {
    title: "Quality Education",
    description:
      "Modern curriculum focused on practical engineering education.",
    icon: GraduationCap,
  },
  {
    title: "Modern Laboratories",
    description:
      "Well-equipped laboratories for research and innovation.",
    icon: FlaskConical,
  },
  {
    title: "Expert Faculty",
    description:
      "Experienced professors dedicated to student success.",
    icon: Users,
  },
  {
    title: "Industry Exposure",
    description:
      "Industrial visits, internships and real-world projects.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Scholarships",
    description:
      "Merit and need-based financial support for students.",
    icon: Award,
  },
  {
    title: "Research Culture",
    description:
      "Encouraging innovation, publications and technical development.",
    icon: Microscope,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Why Choose Our College
          </h2>

          <p className="mt-4 text-muted-foreground">
            We provide an environment where students learn,
            innovate and grow into future engineers.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.12,
                }}
                className="rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

                  <Icon className="text-primary" />

                </div>

                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}