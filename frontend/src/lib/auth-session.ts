// Small helpers around the login data your LoginForm stores.
export const AUTH_EVENT = "auth-change";

export interface StudentSession {
  id: number | string;
  fullName: string;
  department: string;
  registrationNumber: string;
  semester: number;
  mustChangePassword?: boolean;
  photoUrl?: string | null;
}

export function isTokenExpired(token: string) {
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

// export function getStoredSession(): StudentSession | null {
//   for (const storage of [localStorage, sessionStorage]) {
//     const token = storage.getItem("accessToken");
//     const raw = storage.getItem("user");

//     if (!token || !raw) continue;

//     if (isTokenExpired(token)) {
//       storage.removeItem("accessToken");
//       storage.removeItem("user");
//       continue;
//     }

//     try {
//       return JSON.parse(raw) as StudentSession;
//     } catch {
//       storage.removeItem("user");
//     }
//   }

//   return null;
// }
export function getStoredSession(): StudentSession | null {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem("accessToken");
    const raw = storage.getItem("user");

    if (!token || !raw) continue;

    if (isTokenExpired(token)) {
      storage.removeItem("accessToken");
      storage.removeItem("user");
      continue;
    }

    try {
      return JSON.parse(raw) as StudentSession;
    } catch {
      storage.removeItem("user");
    }
  }

  return null;
}
// Merge new fields (e.g. a new photo) into the saved student and tell the navbar/sidebar to refresh.
export function updateStoredSession(patch: Partial<StudentSession>) {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem("accessToken");
    const raw = storage.getItem("user");

    if (!token || !raw) continue;

    try {
      const current = JSON.parse(raw);

      storage.setItem(
        "user",
        JSON.stringify({ ...current, ...patch })
      );

      notifyAuthChange();
      return;
    } catch {
      console.error("Could not update stored student session.");
      return;
    }
  }
}