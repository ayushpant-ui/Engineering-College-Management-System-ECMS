"use client";

import Link from "next/link";
import { Search, LogIn } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import Logo from "@/components/sidebar/Logo";
import ThemeToggle from "@/components/modules/navbar/ThemeToggle";

export default function Navbar() {
  return (
    // <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
<header className="sticky top-0  z-50 flex h-16 items-center justify-between border-b bg-background/80 text-foreground backdrop-blur">
      {/* Left */}
      <div className="flex items-center gap-3">

        <SidebarTrigger />

        <Logo />

      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className='cursor-pointer'
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme */}
        <ThemeToggle />

        {/* Login */}
<Link href="/login" 
className="cursor-pointer">
  <Button className='cursor-pointer'>
    <LogIn className="mr-2 h-4 w-4 " />
    Login
  </Button>
</Link>

      </div>

    </header>
  );
}