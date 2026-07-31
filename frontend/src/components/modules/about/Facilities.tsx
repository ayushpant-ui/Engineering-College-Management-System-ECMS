"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const facilities = [
  {
    title: "Modern Library",
    image: "/facilities/library.jpg",
    description:
      "A well-equipped library with thousands of books, journals and digital resources.",
  },
  {
    title: "Advanced Laboratories",
    image: "/facilities/laboratory.jpg",
    description:
      "Modern laboratories supporting practical learning and engineering research.",
  },
//   {
//     title: "Hostel Facilities",
//     image: "/facilities/hostel.jpg",
//     description:
//       "Comfortable accommodation with a safe and student-friendly environment.",
//   },
  {
    title: "Sports Complex",
    image: "/facilities/sports.jpg",
    description:
      "Indoor and outdoor sports facilities promoting health and teamwork.",
  },
  {
    title: "Campus Wi-Fi",
    image: "/facilities/wifi.jpg",
    description:
      "High-speed internet connectivity across the entire campus.",
  },
//   {
//     title: "Transportation",
//     image: "/facilities/transportation.jpg",
//     description:
//       "Reliable transportation services connecting students with the campus.",
//   },
];

export default function Facilities() {
  return (
    <section className="border-b border-border py-16">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Campus Facilities
          </h2>

          <p className="mt-3 text-muted-foreground">
            Discover the facilities that support academic excellence,
            innovation, and student life.
          </p>

        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {facilities.map((facility, index) => (
            <motion.div
              key={facility.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-56">

                <Image
                  src={facility.image}
                  alt={facility.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />

              </div>

              <div className="p-6">

                <h3 className="text-2xl font-semibold">
                  {facility.title}
                </h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {facility.description}
                </p>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}