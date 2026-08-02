"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">

      {/* Top */}
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 lg:grid-cols-12">

          {/* ================= LEFT ================= */}

          <div className="lg:col-span-5">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border text-xl font-bold shadow-sm">
                SOE
              </div>

              <div>

                <h2 className="text-2xl font-bold text-foreground">
                  School of Engineering
                </h2>

                <p className="text-muted-foreground">
                  Far Western University
                </p>

              </div>

            </div>

            {/* <p className="mt-6 max-w-lg leading-8 text-muted-foreground">
              Empowering future engineers through innovation,
              research, quality education and practical learning.
              We prepare students with the knowledge and skills
              needed to solve real-world engineering challenges.
            </p> */}

            {/* Social */}

            <div className="mt-8 flex gap-3">

              {[
                FaFacebookF,
                FaLinkedinIn,
                FaYoutube,
                FaGithub,
              ].map((Icon, index) => (

                <Link
                  key={index}
                  href="#"
                  className="rounded-xl border border-border p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                </Link>

              ))}

            </div>

          </div>

          {/* ================= LINKS ================= */}

          <div className="lg:col-span-2">

            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Quick Links
            </h3>

            <div className="space-y-4">

              {[
                "Home",
                "About",
                "Departments",
                "Facilities",
                "Notices",
                "Contact",
              ].map((item) => (

                <Link
                  key={item}
                  href="#"
                  className="group flex items-center justify-between text-muted-foreground transition hover:text-primary"
                >
                  {item}

                  <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />

                </Link>

              ))}

            </div>

          </div>

          {/* ================= DEPARTMENTS ================= */}

          <div className="lg:col-span-2">

            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Departments
            </h3>

            <div className="space-y-4 text-muted-foreground">

              <p>Computer Engineering</p>

              <p>Civil Engineering</p>

              <p>Architecture</p>

            </div>

          </div>

          {/* ================= CONTACT ================= */}

          <div className="lg:col-span-3">

            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Contact
            </h3>

            <div className="space-y-6">

              <div className="flex gap-4">

                <MapPin className="mt-1 h-5 w-5 text-primary" />

                <div>

                  <p className="font-medium text-foreground">
                    Address
                  </p>

                  <p className="text-muted-foreground">
                    Kanchanpur, Nepal
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <Phone className="mt-1 h-5 w-5 text-primary" />

                <div>

                  <p className="font-medium text-foreground">
                    Phone
                  </p>

                  <p className="text-muted-foreground">
                    +977-9766987980
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <Mail className="mt-1 shrink-0 h-5 w-5 text-primary" />

                <div>

                  <p className="font-medium text-foreground">
                    Email
                  </p>

                  <p className="text-muted-foreground">
                    engineering@example.com
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <Clock className="mt-1 h-5 w-5 text-primary" />

                <div>

                  <p className="font-medium text-foreground">
                    Office Hours
                  </p>

                  <p className="text-muted-foreground">
                    Mon - Fri
                  </p>

                  <p className="text-muted-foreground">
                    9:00 AM - 5:00 PM
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-border bg-muted/40">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">

          <p className="text-sm text-muted-foreground">
            © 2026 School of Engineering. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm">

            <Link
              href="#"
              className="text-muted-foreground transition hover:text-primary"
            >
              Privacy Policy
            </Link>

            <Link
              href="#"
              className="text-muted-foreground transition hover:text-primary"
            >
              Terms of Service
            </Link>

            <Link
              href="#"
              className="text-muted-foreground transition hover:text-primary"
            >
              Accessibility
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}