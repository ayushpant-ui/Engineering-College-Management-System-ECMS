
import { Clock, Facebook, Linkedin, Youtube ,type LucideIcon } from "lucide-react";

import { contactInfo } from "@/lib/contactdata";

const socialIcons: Record<string, LucideIcon> = {
  Facebook: Facebook,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

export default function ContactInfoCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
      {/* Map */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
        <iframe
          title="Campus location"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            contactInfo.address.mapQuery
          )}&z=15&output=embed`}
          className="h-full w-full grayscale contrast-125 dark:invert dark:contrast-100 dark:brightness-90"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Visit the campus
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {contactInfo.address.line1}
            <br />
            {contactInfo.address.line2}
            <br />
            {contactInfo.address.line3}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="h-4 w-4" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Office Hours
            </p>
            <ul className="mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
              {contactInfo.officeHours.map((slot) => (
                <li key={slot.days} className="flex justify-between gap-4">
                  <span>{slot.days}</span>
                  <span>{slot.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {contactInfo.socials.map((social) => {
            const Icon = socialIcons[social.label];
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
