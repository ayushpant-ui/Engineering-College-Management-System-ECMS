"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  House,
  Images,
  Phone,
  Users,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", href: "/", icon: House },
  { title: "About", href: "/about", icon: Building2 },
  { title: "Departments", href: "/departments", icon: GraduationCap },
  { title: "Faculty", href: "/faculty", icon: Users },
  { title: "Notices", href: "/notices", icon: Bell },
  { title: "Syllabus", href: "/syllabus", icon: BookOpen },
  { title: "Events", href: "/events", icon: CalendarDays },
  { title: "Gallery", href: "/gallery", icon: Images },
  { title: "Contact", href: "/contact", icon: Phone },
];

export default function NavMain() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ title, href, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                // The tooltip only appears while the sidebar is collapsed to icons
                tooltip={title}
                isActive={href === "/" ? pathname === "/" : pathname.startsWith(href)}
                onClick={() => router.push(href)}
              >
                <Icon />
                <span>{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}