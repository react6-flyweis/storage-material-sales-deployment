import { io, type Socket } from "socket.io-client";

export function getSocketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  return apiBase || "";

  // try {
  //   return new URL(apiBase).origin;
  // } catch {
  //   return apiBase;
  // }
}

export function createAdminSocket(
  accessToken: string | null | undefined,
  transports: string[] = ["polling"],
  namespace = "/admin",
): Socket | null {
  if (!accessToken) return null;

  const base = getSocketBaseUrl();
  console.log("base", base);
  return io(`${base}${namespace}`, {
    auth: { token: accessToken },
    transports,
  });
}

export type { Socket };
