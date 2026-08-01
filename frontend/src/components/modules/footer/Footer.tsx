"use client";

import Link from "next/link";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

import {
  quickLinks,
  departments,
  services,
  socials,
} from "./footerdata";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Logo */}

          <div className="lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border font-bold">
                SOE
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  School of Engineering
                </h2>

                <p className="text-sm text-muted-foreground">
                  FarWestern University
                </p>

              </div>

            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              School of Engineering is committed to excellence in engineering
              education, research, innovation and preparing future engineers
              capable of solving real-world problems.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="mb-4 font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3">

              {quickLinks.map((item) => (

                <li key={item.title}>

                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {item.title}
                  </Link>

                </li>

              ))}

            </ul>

          </div>

          {/* Departments */}

          <div>

            <h3 className="mb-4 font-semibold">
              Departments
            </h3>

            <ul className="space-y-3">

              {departments.map((dept) => (

                <li
                  key={dept}
                  className="text-sm text-muted-foreground"
                >
                  {dept}
                </li>

              ))}

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="mb-4 font-semibold">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-muted-foreground">

              <div className="flex gap-3">

                <MapPin className="mt-1 h-4 w-4 shrink-0" />

                <span>
                  Kanchanpur, Nepal
                </span>

              </div>

              <div className="flex gap-3">

                <Phone className="mt-1 h-4 w-4 shrink-0" />

                <span>
                  +977-9766987980
                </span>

              </div>

              <div className="flex gap-3">

                <Mail className="mt-1 h-4 w-4 shrink-0" />

                <span>
                  ayushpant2073@gmail.com
                </span>

              </div>

              <div className="flex gap-3">

                <Clock className="mt-1 h-4 w-4 shrink-0" />

                <span>
                  Mon - Fri : 10:00 AM - 5:00 PM
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-12 border-t border-border pt-6">

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            <p className="text-sm text-muted-foreground">
              © 2026 School of Engineering. All Rights Reserved.
            </p>

            <div className="flex items-center gap-3">

              {socials.map(({ icon: Icon, href }, index) => (

                <Link
                  key={index}
                  href={href}
                  className="rounded-full border p-2 transition hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>

              ))}

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}