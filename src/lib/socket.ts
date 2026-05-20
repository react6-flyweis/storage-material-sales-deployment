import { io, type Socket } from "socket.io-client";
import { FALLBACK_BASE_URL } from "@/modules/auth/auth.api";

export function getSocketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? FALLBACK_BASE_URL;

  try {
    return new URL(apiBase).origin;
  } catch {
    return apiBase;
  }
}

export function createAdminSocket(
  accessToken: string | null | undefined,
  transports: string[] = ["websocket", "polling"],
  namespace = "/admin",
): Socket | null {
  if (!accessToken) return null;

  const base = getSocketBaseUrl();
  return io(`${base}${namespace}`, {
    auth: { token: accessToken },
    transports,
  });
}

export type { Socket };
