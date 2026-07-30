// src/components/navbar/Sidebar.tsx

"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";

import { navigationItems } from "./Navigation";
import NavItem from "./NavItem";
import Logo from "./Logo";

export default function Sidebar() {
  return (
    <Sheet>
<SheetTrigger
  render={
    <Button
      size="icon"
      variant="ghost"
      className="rounded-full"
    />
  }
>
  <Menu className="h-6 w-6" />
</SheetTrigger>

      <SheetContent
        side="right"
        className="w-[320px]"
      >
        <div className="mt-6 mb-8">
          <Logo />
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.title}
              item={item}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}