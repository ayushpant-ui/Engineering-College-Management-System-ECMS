// src/components/modules/footer/footer-data.ts


import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa"
import { FaLinkedin } from "react-icons/fa";

export const quickLinks = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Departments", href: "/departments" },
  { title: "Facilities", href: "/facilities" },
  { title: "Notices", href: "/notices" },
  { title: "Contact", href: "/contact" },
];

export const departments = [
  "Computer Engineering",
  "Civil Engineering",
  "Architecture",
];

export const services = [
  "Student Portal",
  "Results",
  "Attendance",
  "Library",
  "Academic Calendar",
  "Downloads",
];

export const socials = [
  {
    icon: FaFacebook,
    href: "#",
  },
  {
    icon: FaLinkedin,
    href: "#",
  },
  {
    icon: FaGithub,
    href: "#",
  },
];