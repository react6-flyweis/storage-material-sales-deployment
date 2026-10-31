import type { Location } from "react-router";

export interface RedirectState {
  from?:
    | string
    | {
        pathname?: string;
        search?: string;
        hash?: string;
      };
}

/**
 * Resolves the destination path after authentication.
 * Checks for router state (`location.state.from`), URL query params (`?redirect=`, `?returnUrl=`, or `?from=`),
 * and falls back to a default path while preventing open redirects and auth loops.
 */
export function getAuthRedirectPath(
  location: Location,
  fallback = "/dashboard",
): string {
  let nextPath = fallback;
  const state = location.state as RedirectState | null;

  if (typeof state?.from === "string") {
    nextPath = state.from;
  } else if (state?.from?.pathname) {
    nextPath = `${state.from.pathname}${state.from.search || ""}${state.from.hash || ""}`;
  } else {
    const searchParams = new URLSearchParams(location.search);
    const redirectParam =
      searchParams.get("redirect") ||
      searchParams.get("returnUrl") ||
      searchParams.get("from");

    if (redirectParam) {
      nextPath = redirectParam;
    }
  }

  const isSafeRelativePath =
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//") &&
    !nextPath.startsWith("/\\");

  const isAuthPage =
    nextPath.startsWith("/sign-in") ||
    nextPath.startsWith("/login") ||
    nextPath.startsWith("/forgot-password") ||
    nextPath.startsWith("/reset-password");

  if (!isSafeRelativePath || isAuthPage) {
    return fallback;
  }

  return nextPath;
}

// Export alias for flexible naming
export const getRedirectPath = getAuthRedirectPath;
