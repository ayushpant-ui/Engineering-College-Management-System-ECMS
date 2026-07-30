// components/sidebar/navigation.ts

import {
  Home,
  Building2,
  GraduationCap,
  Users,
  Bell,
  CalendarDays,
  Image,
  Phone,
  LogIn,
} from "lucide-react";

export const navigation = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "About",
    url: "/about",
    icon: Building2,
  },
  {
    title: "Departments",
    url: "/departments",
    icon: GraduationCap,
  },
  {
    title: "Faculty",
    url: "/faculty",
    icon: Users,
  },
  {
    title: "Notices",
    url: "/notices",
    icon: Bell,
  },
  {
    title: "Events",
    url: "/events",
    icon: CalendarDays,
  },
  {
    title: "Gallery",
    url: "/gallery",
    icon: Image,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: Phone,
  },
];

export const secondaryNavigation = [
  {
    title: "Login",
    url: "/login",
    icon: LogIn,
  },
];