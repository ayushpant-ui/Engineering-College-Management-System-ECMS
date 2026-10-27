// Admin session helpers. Admin tokens use their OWN storage keys and sessionStorage
// only (cleared when the tab closes), separate from the student login.

const TOKEN_KEY = "adminToken";
const USER_KEY = "adminUser";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: number; // ms timestamp
}

function decodePayload(token: string): { exp?: number; role?: string } | null {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// Returns null if there's no session, it's expired, or the token isn't an ADMIN token.
// NOTE: this is a convenience check for the UI. The backend is what really enforces roles.
export function getAdminSession(): AdminSession | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const rawUser = sessionStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  const payload = decodePayload(token);
  if (!payload?.exp || payload.role !== "ADMIN" || payload.exp * 1000 < Date.now()) {
    clearAdminSession();
    return null;
  }

// const payload = decodePayload(token);

// console.log("Admin JWT payload:", payload);

// if (!payload?.exp) {
//   console.error("Admin token is missing its expiration claim.");
//   clearAdminSession();
//   return null;
// }

// if (payload.role !== "ADMIN") {
//   console.error("Unexpected admin role:", payload.role);
//   clearAdminSession();
//   return null;
// }

if (payload.exp * 1000 < Date.now()) {
  console.error("Admin token has expired.");
  clearAdminSession();
  return null;
}

  try {
    return { token, user: JSON.parse(rawUser) as AdminUser, expiresAt: payload.exp * 1000 };
  } catch {
    clearAdminSession();
    return null;
  }
}