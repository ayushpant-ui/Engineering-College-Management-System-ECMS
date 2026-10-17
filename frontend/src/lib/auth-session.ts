
export const AUTH_EVENT = "auth-change";

export interface StudentSession {
  id: number | string;
  fullName: string;
  department: string;
  registrationNumber: string;
  semester: number;
  mustChangePassword?: boolean;
}

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // unreadable token = treat as expired
  }
}

export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("accessToken");
    storage.removeItem("user");
  }
  notifyAuthChange();
}

// Call after login / logout so the sidebar updates in the same tab.
// (The browser's "storage" event only fires in OTHER tabs.)
export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getStoredSession(): StudentSession | null {
  const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
  const token = storage.getItem("accessToken");
  const raw = storage.getItem("user");
  if (!token || !raw) return null;

  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }

  try {
    return JSON.parse(raw) as StudentSession;
  } catch {
    return null;
  }
}