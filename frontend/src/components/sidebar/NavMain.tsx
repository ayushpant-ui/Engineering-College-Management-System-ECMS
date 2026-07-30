"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { navigation } from "./navigation";

export default function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>

      <SidebarGroupContent>

        <SidebarMenu>

          {navigation.map((item) => (

            <SidebarMenuItem key={item.title}>

<SidebarMenuButton
  render={<Link href={item.url} />}
  isActive={pathname === item.url}
>
  <item.icon />
  <span>{item.title}</span>
</SidebarMenuButton>

            </SidebarMenuItem>

          ))}

        </SidebarMenu>

      </SidebarGroupContent>

    </SidebarGroup>
  );
}