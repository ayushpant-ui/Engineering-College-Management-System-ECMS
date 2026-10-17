"use client";

import Logo from "./Logo";
import NavMain from "./NavMain";
import StudentNavLinks from "./StudentNavLinks";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <StudentNavLinks /> {/* only renders when a student is logged in */}
      </SidebarContent>
    </Sidebar>
  );
}