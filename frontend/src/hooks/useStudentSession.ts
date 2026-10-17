"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AUTH_EVENT, getStoredSession, type StudentSession } from "@/lib/auth-session";

export function useStudentSession() {
  const pathname = usePathname();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [ready, setReady] = useState(false); // false until storage has been checked on the client

  useEffect(() => {
    setStudent(getStoredSession());
    setReady(true);
  }, [pathname]);

  // Also react instantly to login/logout events and changes from other tabs
  useEffect(() => {
    const sync = () => setStudent(getStoredSession());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { student, isLoggedIn: !!student, ready };
}