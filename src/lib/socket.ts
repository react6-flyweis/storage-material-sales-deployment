import { io, type Socket } from "socket.io-client";

export function getSocketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  return (apiBase || "").replace(/\/$/, "");
}

export function createAdminSocket(
  accessToken: string | null | undefined,
  transports: string[] = ["polling"],
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
