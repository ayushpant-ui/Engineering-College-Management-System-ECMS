"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-lg border-2 border-primary flex items-center justify-center font-bold">
        SOE
      </div>

      <div className="flex flex-col">
        <span className="font-semibold leading-none">
          School of Engineering
        </span>

        <span className="text-xs text-muted-foreground">
          Far Western University
        </span>
      </div>
    </Link>
  );
}