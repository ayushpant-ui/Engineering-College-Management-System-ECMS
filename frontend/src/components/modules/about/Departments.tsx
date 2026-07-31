"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const departments = [
  {
    title: "Computer Engineering",
    image: "/departments/computer.jpg",
    description:
      "Develop software, intelligent systems and modern computing solutions.",
  },
  {
    title: "Civil Engineering",
    image: "/departments/civil.jpg",
    description:
      "Design sustainable buildings, bridges and transportation infrastructure.",
  },
//   {
//     title: "Electrical Engineering",
//     image: "/departments/electrical.jpg",
//     description:
//       "Learn power systems, renewable energy and electrical technologies.",
//   },
//   {
//     title: "Electronics Engineering",
//     image: "/departments/electronics.jpg",
//     description:
//       "Explore embedded systems, communication and semiconductor devices.",
//   },
//   {
//     title: "Mechanical Engineering",
//     image: "/departments/mechanical.jpg",
//     description:
//       "Study machines, manufacturing and industrial automation.",
//   },
  {
    title: "Architecture",
    image: "/departments/architecture.jpg",
    description:
      "Design innovative, sustainable and functional architectural spaces.",
  },
];

export default function Departments() {
  return (
    <section className="border-b border-border bg-muted/20 py-16">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Academic Departments
          </h2>

          <p className="mt-3 text-muted-foreground">
            Explore our engineering programs designed to prepare future
            professionals with strong technical knowledge and practical skills.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {departments.map((department, index) => (
            <motion.div
              key={department.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
              }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              {/* Image */}

              <div className="relative h-56 overflow-hidden">

                <Image
                  src={department.image}
                  alt={department.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />

              </div>

              {/* Content */}

              <div className="p-6">

                <h3 className="text-2xl font-semibold">
                  {department.title}
                </h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {department.description}
                </p>

                <button
                  className="mt-6 flex items-center gap-2 font-medium text-primary transition hover:gap-3"
                >
                  Learn More

                  <ArrowRight size={18} />

                </button>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}