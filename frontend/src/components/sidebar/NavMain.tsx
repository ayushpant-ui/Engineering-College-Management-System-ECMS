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
  isActive={pathname === item.url}
>
  <Link
    href={item.url}
    className="flex w-full cursor-pointer items-center gap-2"
  >
    <item.icon />
    <span>{item.title}</span>
  </Link>
</SidebarMenuButton>

{/* <SidebarMenuButton
  className="cursor-pointer"
  render={<Link href={item.url} />}
  isActive={pathname === item.url}
>
  <item.icon />
  <span>{item.title}</span>
</SidebarMenuButton> */}

            </SidebarMenuItem>

          ))}

        </SidebarMenu>

      </SidebarGroupContent>

    </SidebarGroup>
  );
}