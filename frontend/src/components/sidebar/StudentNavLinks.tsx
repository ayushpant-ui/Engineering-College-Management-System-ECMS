"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useStudentSession } from "@/hooks/useStudentSession";
import { clearSession } from "@/lib/auth-session";

const studentLinks = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Results", href: "/student/results", icon: FileText },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Class Routine", href: "/student/routine", icon: ClipboardList },
  { label: "Change Password", href: "/student/change-password", icon: KeyRound },
];

export default function StudentNavLinks() {
  const { isLoggedIn, ready } = useStudentSession();
  const pathname = usePathname();
  const router = useRouter();

  // Nothing for visitors who aren't logged in (and nothing during server render)
  if (!ready || !isLoggedIn) return null;

  function logout() {
    clearSession(); // also tells the sidebar to hide this group
    router.replace("/login"); // change if your login route is different
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {studentLinks.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                tooltip={label}
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
                onClick={() => router.push(href)}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={logout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}