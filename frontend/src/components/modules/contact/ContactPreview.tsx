"use client";

import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ContactPreview() {
  return (
    <section className="border-b border-border py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="overflow-hidden rounded-3xl border border-border bg-card">

          <div className="grid items-center gap-10 p-10 lg:grid-cols-2 lg:p-16">

            {/* Left */}
            <div>

              <span className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium">
                Contact Us
              </span>

              <h2 className="mt-6 text-4xl font-bold tracking-tight">
                Have Questions?
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Whether you're interested in admissions,
                academic programs, research opportunities,
                scholarships, or student services, our team is
                ready to assist you.
              </p>

            </div>

            {/* Right */}
            <div className="flex flex-col items-start justify-center gap-5 rounded-2xl border border-border bg-background p-8">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PhoneCall className="h-7 w-7" />
              </div>

              <h3 className="text-2xl font-semibold">
                Contact the School of Engineering
              </h3>

              <p className="text-muted-foreground">
                Visit our dedicated contact page to send an inquiry,
                find department contacts, office hours, and location
                details.
              </p>

              <Button size="lg">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
              </Button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}