import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { createAdminSocket, type Socket } from "@/lib/socket";
import type {
  SendTeamMessagePayload,
  TeamDmNotice,
  TeamGroupNotice,
  GroupMembersUpdatedEvent,
} from "@/types/communication";
import { chatQueryKeys } from "@/modules/team-chat/team-chat.hooks";
import type { ChatGroupDetails } from "@/modules/team-chat/team-chat.api";
import { SocketContext } from "./socketContextInstance";

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const sock = createAdminSocket(accessToken);
    if (!sock) return;

    socketRef.current = sock;

    sock.on("connect", () => {
      console.log("[SocketContext] Connected to /admin namespace");
      setSocket(sock);
      setIsConnected(true);
      sock.emit("join_user_room");
    });

    sock.on("disconnect", (reason) => {
      console.log("[SocketContext] Disconnected from /admin:", reason);
      setIsConnected(false);
    });

    sock.on("connect_error", (err) => {
      console.warn("[SocketContext] connect_error:", err.message);
      setIsConnected(false);
    });

    // 1. DM Notice
    sock.on("new_team_dm_notice", (data: TeamDmNotice) => {
      console.log("[SocketContext] new_team_dm_notice", data);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      window.dispatchEvent(new CustomEvent("socket_team_dm_notice", { detail: data }));
    });

    // 2. Group Message Notice
    sock.on("new_team_group_message_notice", (data: TeamGroupNotice) => {
      console.log("[SocketContext] new_team_group_message_notice", data);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      window.dispatchEvent(new CustomEvent("socket_team_group_notice", { detail: data }));
    });

    // 3. New Group Created / Added
    sock.on("new_team_group", (data: { group: ChatGroupDetails }) => {
      console.log("[SocketContext] new_team_group", data);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      window.dispatchEvent(new CustomEvent("socket_new_team_group", { detail: data }));
    });

    // 4. Group Members Updated
    sock.on("group_members_updated", (data: GroupMembersUpdatedEvent) => {
      console.log("[SocketContext] group_members_updated", data);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      if (data?.groupId) {
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.groupDetails(data.groupId) });
      }
      window.dispatchEvent(new CustomEvent("socket_group_members_updated", { detail: data }));
    });

    // 5. Customer Direct Chat Updated Notice
    sock.on("customer_direct_chat_updated", (data: unknown) => {
      console.log("[SocketContext] customer_direct_chat_updated", data);
      queryClient.invalidateQueries({ queryKey: ["customer-direct-chat"] });
      window.dispatchEvent(
        new CustomEvent("socket_customer_direct_chat_updated", { detail: data })
      );
    });

    // 6. Customer Direct Message
    sock.on("customer_direct_message", (data: unknown) => {
      console.log("[SocketContext] customer_direct_message", data);
      queryClient.invalidateQueries({ queryKey: ["customer-direct-chat"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      window.dispatchEvent(
        new CustomEvent("socket_customer_direct_message", { detail: data })
      );
    });

    // 7. New Customer Message (Mirrored project / widget / lead message)
    sock.on("new_customer_message", (data: unknown) => {
      console.log("[SocketContext] new_customer_message", data);
      queryClient.invalidateQueries({ queryKey: ["customer-direct-chat"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const leadId = (data as { leadId?: string })?.leadId;
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", leadId] });
      }
      window.dispatchEvent(
        new CustomEvent("socket_new_customer_message", { detail: data })
      );
    });

    return () => {
      sock.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken, queryClient]);

  const joinChannel = useCallback((channelType: "direct" | "group", channelId: string) => {
    if (socketRef.current?.connected) {
      console.log(`[SocketContext] emit join_team_channel: ${channelType} -> ${channelId}`);
      socketRef.current.emit("join_team_channel", { channelType, channelId });
    }
  }, []);

  const leaveChannel = useCallback((channelType: "direct" | "group", channelId: string) => {
    if (socketRef.current?.connected) {
      console.log(`[SocketContext] emit leave_team_channel: ${channelType} -> ${channelId}`);
      socketRef.current.emit("leave_team_channel", { channelType, channelId });
    }
  }, []);

  const sendTypingStart = useCallback((channelType: "direct" | "group", channelId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("team_typing_start", { channelType, channelId });
    }
  }, []);

  const sendTypingStop = useCallback((channelType: "direct" | "group", channelId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("team_typing_stop", { channelType, channelId });
    }
  }, []);

  const sendMessage = useCallback((payload: SendTeamMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("team_message", payload);
    } else {
      console.warn("[SocketContext] cannot sendMessage: socket is not connected");
    }
  }, []);

  const joinCustomerDirect = useCallback((customerId: string) => {
    if (socketRef.current?.connected && customerId) {
      socketRef.current.emit("join_customer_direct", { customerId });
    }
  }, []);

  const leaveCustomerDirect = useCallback((customerId: string) => {
    if (socketRef.current?.connected && customerId) {
      socketRef.current.emit("leave_customer_direct", { customerId });
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChannel,
        leaveChannel,
        sendTypingStart,
        sendTypingStop,
        sendMessage,
        joinCustomerDirect,
        leaveCustomerDirect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
