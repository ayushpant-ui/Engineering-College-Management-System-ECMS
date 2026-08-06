import { MessageCircleMore } from "lucide-react";
import ContactQuickLinks from "./ContactQuickLinks";
import ContactInfoCard from "./ContactInfoCard";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section className="w-full">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <MessageCircleMore className="h-3.5 w-3.5" />
          Contact Us
        </span>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Have questions regarding admissions, academics, departments, or
          student services? Reach out and our team will respond as soon as
          possible.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <ContactQuickLinks />
      </div>

      {/* Info + Form */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2 items-start">
        <ContactInfoCard />
        <ContactForm />
      </div>
    </section>
  );
}
