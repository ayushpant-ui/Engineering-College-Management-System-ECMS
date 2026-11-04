"use client";

import Link from "next/link";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { ArrowUp, ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";

import { contactInfo } from "@/lib/contactdata"; 
import { departments } from "@/data/departments"; 

const year = new Date().getFullYear();

// TODO: replace with your real social pages
const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
  { label: "GitHub", href: "https://github.com/ayushpant-ui", icon: FaGithub },
];

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Faculty", href: "/faculty" },
  { label: "Notices", href: "/notices" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const studentLinks = [
  { label: "Student Login", href: "/login" },
  { label: "Syllabus", href: "/syllabus" },
];

// TODO: create these pages, or delete the links you don't need
const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

type FooterLink = { label: string; href: string };

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium text-foreground">{label}</p>
        <div className="mt-0.5 text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

export default function Footer() {
  const { address, phone, email, officeHours } = contactInfo;

  return (
    <footer className="mt-16 border-t border-border bg-background">
      {/* Call to action */}
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-muted/40 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Have a question for us?</h2>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Reach out about admissions, academics or student services, and our team will get back to you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Contact us
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/syllabus"
              className="inline-flex items-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              View syllabus
            </Link>
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-lg font-bold shadow-sm">
                SOE
              </span>
              <span className="leading-tight">
                <span className="block font-serif text-lg font-bold text-foreground">School of Engineering</span>
                <span className="block text-sm text-muted-foreground">Far Western University</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
              Educating future engineers through innovation, quality teaching and practical learning.
            </p>

            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <LinkColumn title="Explore" links={exploreLinks} />
          </div>

          <div className="lg:col-span-2">
            <LinkColumn title="Students" links={studentLinks} />
          </div>

          <div className="lg:col-span-2">
            <LinkColumn
              title="Departments"
              links={[
                ...departments.map((d) => ({ label: d.name, href: `/departments/${d.slug}` })),
                { label: "All departments", href: "/departments" },
              ]}
            />
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h3>
            <ul className="mt-5 space-y-5">
              <ContactRow icon={MapPin} label="Address">
                <p>{address.line2}</p>
                <p>{address.line3}</p>
              </ContactRow>

              <ContactRow icon={Phone} label="Phone">
                <a
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  className="transition-colors hover:text-primary"
                >
                  {phone}
                </a>
              </ContactRow>

              <ContactRow icon={Mail} label="Email">
                <a href={`mailto:${email}`} className="break-all transition-colors hover:text-primary">
                  {email}
                </a>
              </ContactRow>

              <ContactRow icon={Clock} label="Office Hours">
                {officeHours.map((slot) => (
                  <p key={slot.days}>
                    {slot.days}: {slot.hours}
                  </p>
                ))}
              </ContactRow>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} School of Engineering, Far Western University. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}