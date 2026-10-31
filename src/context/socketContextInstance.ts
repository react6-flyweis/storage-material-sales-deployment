import { createContext } from "react";
import type { Socket } from "@/lib/socket";
import type { SendTeamMessagePayload } from "@/types/communication";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelType: "direct" | "group", channelId: string) => void;
  leaveChannel: (channelType: "direct" | "group", channelId: string) => void;
  sendTypingStart: (channelType: "direct" | "group", channelId: string) => void;
  sendTypingStop: (channelType: "direct" | "group", channelId: string) => void;
  sendMessage: (payload: SendTeamMessagePayload) => void;
  joinCustomerDirect: (customerId: string) => void;
  leaveCustomerDirect: (customerId: string) => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);
