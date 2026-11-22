/**
 * Shared backend API base URL.
 *
 * Set NEXT_PUBLIC_API_URL in your environment (e.g. .env.local) only when
 * the Core PHP API lives on a different origin.
 *
 * Default is an empty string, so API calls use same-origin relative URLs
 * ("/api/v1/..."). On Hostinger static hosting those are rewritten to the
 * PHP backend by the root .htaccess rule. Do NOT fall back to
 * http://localhost:8000 here: that address is baked into the built JS and
 * breaks login/register for every real visitor (their own machine has no
 * API server on port 8000).
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl.replace(/\/$/, "")}${cleanPath}`;
}
