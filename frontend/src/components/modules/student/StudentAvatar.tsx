"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/student-api";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Shows the student's photo, or their initials when there's no photo (or it fails to load).
export default function StudentAvatar({
  name,
  photoUrl,
  version,
  className = "h-8 w-8 text-xs",
}: {
  name: string;
  photoUrl?: string | null;
  version?: number; // change it to bypass the browser cache after a new upload
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoUrl, version]);

  const base = resolveMediaUrl(photoUrl);
  const src = base && version ? `${base}${base.includes("?") ? "&" : "?"}v=${version}` : base;

  if (src && !failed) {
    return (
      // Plain <img>: photo hosts vary, so next/image remotePatterns aren't needed
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white`}
    >
      {getInitials(name)}
    </span>
  );
}