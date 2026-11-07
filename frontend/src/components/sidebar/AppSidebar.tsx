"use client";

import Logo from "./Logo";
import NavMain from "./NavMain";
import StudentNavLinks from "@/components/sidebar/StudentNavLinks"; 

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    // collapsible="icon": collapsing shrinks the sidebar to an icon strip
    // (the default, "offcanvas", hides it completely).
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <StudentNavLinks />
      </SidebarContent>
    </Sidebar>
  );
}