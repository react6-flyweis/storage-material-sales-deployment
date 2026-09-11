import { useContext } from "react";
import { SocketContext, type SocketContextType } from "./socketContextInstance";

export function useSocket(): SocketContextType {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}
