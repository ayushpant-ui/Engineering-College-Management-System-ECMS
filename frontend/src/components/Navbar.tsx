"use client"
import { useState } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 shadow ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Logo + College Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-400 rounded"></div> {/* Blank logo */}
        <span className="text-lg font-bold">My Engineering College</span>
      </div>

      {/* Dark/Light Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-3 py-1 rounded border"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </header>
  );
}
