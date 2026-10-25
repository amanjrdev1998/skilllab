export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== "object" || value === null) return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    Number.isFinite(user.id) &&
    typeof user.name === "string" &&
    user.name.trim().length > 0 &&
    typeof user.email === "string" &&
    user.email.trim().length > 0 &&
    (user.role === undefined || typeof user.role === "string")
  );
}

function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("secret_key");
  localStorage.removeItem("user");
  localStorage.removeItem("userData");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("user_id");
  localStorage.removeItem("isAuthenticated");
}

export function readAuthenticatedUser(): AuthenticatedUser | null {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) return null;

  const expiresAt = localStorage.getItem("expires_at");
  if (expiresAt !== null) {
    const expiry = Number(expiresAt);
    if (!Number.isFinite(expiry) || Date.now() >= expiry) {
      clearAuthSession();
      return null;
    }
  }

  try {
    const parsedUser: unknown = JSON.parse(userData);
    if (!isAuthenticatedUser(parsedUser)) {
      throw new Error("Invalid user data in authentication session");
    }
    return parsedUser;
  } catch (error) {
    console.error("Failed to read authenticated user:", error);
    clearAuthSession();
    return null;
  }
}
