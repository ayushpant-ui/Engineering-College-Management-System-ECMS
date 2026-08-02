"use client";

import Logo from "./Logo";
import NavMain from "./NavMain";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    <Sidebar >

      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

    </Sidebar>
  );
}