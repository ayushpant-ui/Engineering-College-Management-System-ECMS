import { clearSession, getStoredSession } from "@/lib/auth-session";

export class StudentApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface StudentProfile {
  id: number | string;
  fullName: string;
  registrationNumber: string;
  department: string | { name: string } | null;
  semester: number;
  photoUrl?: string | null;
  mustChangePassword?: boolean;
  // Optional extras: shown only if your backend returns them
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
}

export function departmentLabel(department: StudentProfile["department"]) {
  if (!department) return "—";
  return typeof department === "string" ? department : department.name;
}

// Photo URLs can be absolute (Cloudinary, S3...) or paths served by your backend ("/uploads/x.jpg")
export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return new URL(url, new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin).toString();
  } catch {
    return url;
  }
}

function getToken() {
  if (!getStoredSession()) return null;
  return localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
}

function goToLogin() {
  clearSession();
  window.location.assign("/login"); // change if your login route is different
}

// Like fetch, but adds the student token, handles expired sessions and returns readable errors.
// have to Pass a FormData body for file uploads (the browser sets the right Content-Type itself).
export async function studentFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) {
    goToLogin();
    throw new StudentApiError("Please sign in again.", 401);
  }

  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new StudentApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  const body = await response.json().catch(() => null);

  if (response.status === 401) {
    goToLogin();
    throw new StudentApiError("Your session has ended. Please sign in again.", 401);
  }

  if (!response.ok) {
    const message: string | undefined = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new StudentApiError(
      response.status === 413
        ? "That image is too large. Please choose a smaller one."
        : message || "Request failed. Please try again.",
      response.status
    );
  }

  return (body?.data ?? body) as T;
}