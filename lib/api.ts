/**
 * Shared backend API base URL.
 *
 * Set NEXT_PUBLIC_API_URL in your environment (e.g. .env.local) to point at
 * the Core PHP API. Falls back to the local dev server.
 *
 * Production example:
 *   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl.replace(/\/$/, "")}${cleanPath}`;
}
