// src/components/navbar/navigation.ts

import {
  Home,
  Info,
  Building2,
  GraduationCap,
  Users,
  Bell,
  CalendarDays,
  Image,
  FileText,
  Phone,
  LogIn,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "About",
    href: "/about",
    icon: Info,
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Building2,
  },
  {
    title: "Programs",
    href: "/programs",
    icon: GraduationCap,
  },
  {
    title: "Faculty",
    href: "/faculty",
    icon: Users,
  },
  {
    title: "Notices",
    href: "/notices",
    icon: Bell,
  },
  {
    title: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Gallery",
    href: "/gallery",
    icon: Image,
  },
  {
    title: "Results",
    href: "/results",
    icon: FileText,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Phone,
  },
  {
    title: "Login",
    href: "/login",
    icon: LogIn,
  },
];