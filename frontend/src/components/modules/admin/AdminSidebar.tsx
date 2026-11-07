"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Images,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sections = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, enabled: true }],
  },
  {
    label: "People",
    items: [
      { label: "Students", href: "/admin/students", icon: GraduationCap, enabled: true },
      { label: "Faculty", href: "/admin/faculty", icon: Users, enabled: false },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Departments", href: "/admin/departments", icon: Building2, enabled: false },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen, enabled: false },
      { label: "Results", href: "/admin/results", icon: FileText, enabled: true },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Notices", href: "/admin/notices", icon: Bell, enabled: true },
      { label: "Events", href: "/admin/events", icon: CalendarDays, enabled: false },
      { label: "Gallery", href: "/admin/gallery", icon: Images, enabled: false },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare, enabled: false },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">School of Engineering</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(({ label, href, icon: Icon, enabled }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      tooltip={label}
                      disabled={!enabled}
                      isActive={href === "/admin" ? pathname === href : pathname.startsWith(href)}
                      onClick={() => router.push(href)}
                    >
                      <Icon />
                      <span>{label}</span>
                      {!enabled && (
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
                          Soon
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}