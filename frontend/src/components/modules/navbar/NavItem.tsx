// src/components/navbar/NavItem.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import type { NavigationItem } from "./Navigation";

interface NavItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

export default function NavItem({
  item,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();

  const isActive = pathname === item.href;

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="block"
    >
      <motion.div
        whileHover={{
          x: 6,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className={`
          group relative flex items-center gap-3
          rounded-xl px-4 py-3
          transition-all duration-300
          ${
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-muted"
          }
        `}
      >
        <Icon className="h-5 w-5 shrink-0" />

        <span className="font-medium">
          {item.title}
        </span>

        <ChevronRight
          className="
            ml-auto
            h-4
            w-4
            opacity-0
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:opacity-100
          "
        />
      </motion.div>
    </Link>
  );
}