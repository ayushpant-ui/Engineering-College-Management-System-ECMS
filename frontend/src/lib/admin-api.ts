import { clearAdminSession, getAdminToken } from "@/lib/admin-session";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// One place that adds the admin token, parses JSON, handles expired sessions
// and turns failures into readable error messages. Use it on every admin page.
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();

  let response: Response;
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new AdminApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  // Expired or non-admin token: end the session and go back to the login page
  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
    window.location.assign("/admin/login");
    throw new AdminApiError("Your session has ended. Please sign in again.", response.status);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new AdminApiError(message || "Request failed. Please try again.", response.status);
  }

  return (body?.data ?? body) as T;
}