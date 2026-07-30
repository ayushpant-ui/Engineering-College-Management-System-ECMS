// src/components/navbar/Navbar.tsx

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Logo from "./Logo";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  return (
    <motion.header
      initial={{
        y: -70,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.6,
      }}
      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-300

        ${
          scrolled
            ? "border-b bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }
      `}
    >
      <div
        className="
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-6
        "
      >
        <Logo />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Sidebar />
        </div>
      </div>
    </motion.header>
  );
}