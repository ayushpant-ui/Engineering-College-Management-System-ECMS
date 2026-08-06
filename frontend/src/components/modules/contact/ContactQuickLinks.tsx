import { Mail, MapPinned, Phone } from "lucide-react";
import { contactInfo } from "@/lib/contactdata";

const quickActions = [
  {
    label: "Call us",
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replace(/[^+\d]/g, "")}`,
    icon: Phone,
  },
  {
    label: "Email us",
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    icon: Mail,
  },
  {
    label: "Get directions",
    value: contactInfo.address.line3,
    href: `https://maps.google.com/?q=${encodeURIComponent(
      contactInfo.address.mapQuery
    )}`,
    icon: MapPinned,
  },
];

export default function ContactQuickLinks() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {quickActions.map(({ label, value, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={label === "Get directions" ? "_blank" : undefined}
          rel={label === "Get directions" ? "noreferrer" : undefined}
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </span>
            <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {value}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
