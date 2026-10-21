/** Return only a path on this CRM's origin after login. */
export function getSafeRedirect(value: string, origin: string): string {
  try {
    const target = new URL(value, origin);
    if (target.origin === origin) {
      return target.pathname + target.search + target.hash;
    }
  } catch {
    // Malformed input uses the dashboard.
  }
  return "/dashboard";
}
