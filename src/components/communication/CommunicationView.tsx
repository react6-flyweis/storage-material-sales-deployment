import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSocket } from "@/context/useSocket";
import {
  useChatUsersQuery,
  useChatConversationsQuery,
  useDirectMessagesQuery,
  useGroupMessagesQuery,
  useGroupDetailsQuery,
  chatQueryKeys,
} from "@/modules/team-chat/team-chat.hooks";
import {
  useCustomerDirectConversationsQuery,
  useCustomerDirectMessagesQuery,
  useSendCustomerDirectMessageMutation,
  customerDirectChatQueryKeys,
} from "@/modules/customer-direct-chat/customer-direct-chat.hooks";
import type { CustomerDirectMessage } from "@/modules/customer-direct-chat/customer-direct-chat.types";
import { useSalesCustomerDetailQuery } from "@/modules/customers/customers.hooks";
import { uploadFileToS3 } from "@/lib/upload";
import type {
  TeamMessage,
  TeamAttachment,
  TeamTypingEvent,
  TeamMessagesReadEvent,
} from "@/types/communication";

import { type ActiveChatState } from "./types";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBar } from "./ChatInputBar";
import { ChatDrawer } from "./ChatDrawer";
import { ChatEmptyState } from "./ChatEmptyState";
import { NewChatModal } from "./NewChatModal";

export const CommunicationView: React.FC = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");

  const {
    socket,
    isConnected,
    joinChannel,
    leaveChannel,
    sendTypingStart,
    sendTypingStop,
    sendMessage,
    joinCustomerDirect,
    leaveCustomerDirect,
  } = useSocket();

  // Navigation tab states
  const [activeMainTab, setActiveMainTab] = useState<"Customers" | "Team">("Team");
  const [activeTeamTab, setActiveTeamTab] = useState<"Departments" | "Direct">("Departments");
  const [activeChat, setActiveChat] = useState<ActiveChatState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"Members" | "Files">("Members");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // File upload state
  const [pendingAttachments, setPendingAttachments] = useState<TeamAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time local message list & typing users map
  const [liveMessages, setLiveMessages] = useState<TeamMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { isTyping: boolean; name: string }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queries - Team chat
  const { data: usersData, isLoading: isLoadingUsers } = useChatUsersQuery();
  const { data: conversationsData, isLoading: isLoadingConversations } = useChatConversationsQuery();

  // Queries - Customer chat
  const {
    data: customerConversationsData,
    isLoading: isLoadingCustomerConversations,
  } = useCustomerDirectConversationsQuery();

  // Query customer details if urlCustomerId exists (for fallback metadata)
  const { data: customerDetailData } = useSalesCustomerDetailQuery(urlCustomerId || "");

  const sendCustomerMessageMutation = useSendCustomerDirectMessageMutation();

  // Handle URL customerId deep linking
  useEffect(() => {
    if (!urlCustomerId) return;

    setActiveMainTab("Customers");

    const cust = customerDetailData?.data?.customer;
    const resolvedDbId = cust?._id || urlCustomerId;

    // Check if conversation already exists in conversationsData
    if (customerConversationsData && customerConversationsData.length > 0) {
      const existing = customerConversationsData.find(
        (c) =>
          c.customerId === urlCustomerId ||
          (cust?._id && c.customerId === cust._id)
      );
      if (existing) {
        setActiveChat({
          type: "customer",
          id: existing.customerId,
          name: existing.customerName || "Customer",
          email: existing.email,
          phone: existing.phone,
          category: "Customer",
          color: "bg-emerald-600",
        });
        return;
      }
    }

    // Otherwise use customer detail query data or fallback
    const cName = cust
      ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim()
      : "";
    setActiveChat({
      type: "customer",
      id: resolvedDbId,
      name: cName || "Customer",
      email: cust?.email,
      phone: cust?.phone?.number,
      category: "Customer",
      color: "bg-emerald-600",
    });
  }, [urlCustomerId, customerConversationsData, customerDetailData]);

  // Active chat message history queries
  const isDirectActive = activeChat?.type === "direct" && Boolean(activeChat.id);
  const isGroupActive = activeChat?.type === "group" && Boolean(activeChat.id);
  const isCustomerActive = activeChat?.type === "customer" && Boolean(activeChat.id);

  const {
    data: directHistoryData,
    isLoading: isLoadingDirectHistory,
  } = useDirectMessagesQuery(activeChat?.id || "", {
    page: 1,
    limit: 50,
    enabled: isDirectActive,
  });

  const {
    data: groupHistoryData,
    isLoading: isLoadingGroupHistory,
  } = useGroupMessagesQuery(activeChat?.id || "", {
    page: 1,
    limit: 50,
    enabled: isGroupActive,
  });

  const {
    data: customerMessagesData,
    isLoading: isLoadingCustomerHistory,
  } = useCustomerDirectMessagesQuery(
    isCustomerActive ? activeChat.id : "",
    { page: 1, limit: 50 },
    { enabled: isCustomerActive }
  );

  const {
    data: groupDetails,
    isLoading: isLoadingGroupDetails,
  } = useGroupDetailsQuery(activeChat?.id || "", isGroupActive);

  // Merge historical messages with live socket messages
  const displayedMessages = useMemo(() => {
    let history: TeamMessage[] = [];
    if (isDirectActive) {
      history = directHistoryData?.messages || [];
    } else if (isGroupActive) {
      history = groupHistoryData?.messages || [];
    } else if (isCustomerActive) {
      history = (customerMessagesData || []).map((m): TeamMessage => {
        const isMsgFromMe = Boolean(
          (m.senderId && currentUser?._id && m.senderId === currentUser._id) ||
          (m.senderName &&
            currentUser?.name &&
            m.senderName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
        );

        const senderRole =
          m.senderType === "customer"
            ? "Customer"
            : m.senderType === "admin"
            ? "Admin"
            : isMsgFromMe
            ? currentUser?.role || "Sales"
            : "Other Employee";

        const senderName =
          m.senderName ||
          (m.senderType === "customer"
            ? activeChat?.name || "Customer"
            : isMsgFromMe
            ? currentUser?.name || "You"
            : m.senderType === "admin"
            ? "Admin"
            : "Sales Colleague");

        return {
          _id: m._id || m.messageId || `cmsg-${m.createdAt}-${Math.random()}`,
          channelType: "customer",
          customerId: m.customerId,
          senderType: m.senderType,
          senderId:
            m.senderId ||
            (m.senderType === "customer"
              ? m.customerId
              : isMsgFromMe
              ? currentUser?._id || "sales"
              : "other-staff"),
          senderName,
          senderRole,
          content: m.content,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          isReadByCustomer: m.isReadByCustomer,
          isReadByStaff: m.isReadByStaff,
          mirroredFrom: m.mirroredFrom,
          leadId: m.leadId,
          channel: m.channel,
        };
      });
    }

    const map = new Map<string, TeamMessage>();
    history.forEach((m) => map.set(m._id, m));
    liveMessages.forEach((m) => {
      // replace optimistic or append
      const existingTempKey = Array.from(map.keys()).find(
        (k) =>
          k.startsWith("temp-") &&
          map.get(k)?.content === m.content &&
          map.get(k)?.senderId === m.senderId
      );
      if (existingTempKey) {
        map.delete(existingTempKey);
      }
      map.set(m._id, m);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [
    isDirectActive,
    isGroupActive,
    isCustomerActive,
    directHistoryData,
    groupHistoryData,
    customerMessagesData,
    liveMessages,
    activeChat?.name,
    currentUser?._id,
    currentUser?.name,
    currentUser?.role,
  ]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [activeChat?.id]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [displayedMessages]);

  // Join / Leave channel lifecycle
  useEffect(() => {
    if (!activeChat) return;

    if (activeChat.type === "customer") {
      const custId = activeChat.id;
      joinCustomerDirect(custId);
      return () => {
        leaveCustomerDirect(custId);
      };
    } else {
      const channelType = activeChat.type;
      const channelId = activeChat.id;
      joinChannel(channelType, channelId);
      return () => {
        leaveChannel(channelType, channelId);
      };
    }
  }, [activeChat, joinChannel, leaveChannel, joinCustomerDirect, leaveCustomerDirect]);

  // Listen to live socket events for current chat
  useEffect(() => {
    if (!socket || !activeChat) return;

    // 1. new_team_message
    const handleNewMessage = (msg: TeamMessage) => {
      console.log("[CommunicationView] new_team_message:", msg);

      const isCurrentGroup =
        activeChat.type === "group" &&
        msg.channelType === "group" &&
        msg.groupId === activeChat.id;

      const isCurrentDirect =
        activeChat.type === "direct" &&
        msg.channelType === "direct" &&
        (msg.senderId === activeChat.id ||
          (msg.senderId === currentUser?._id && msg.participants?.includes(activeChat.id)));

      if (isCurrentGroup || isCurrentDirect) {
        setLiveMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;

          const filtered = prev.filter(
            (m) =>
              !(
                m.isOptimistic &&
                m.content === msg.content &&
                m.senderId === msg.senderId
              )
          );
          return [...filtered, msg];
        });
      }

      // Always invalidate conversations and unread count
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
    };

    // 2. customer_direct_message
    const handleCustomerDirectMessage = (msg: CustomerDirectMessage) => {
      console.log("[CommunicationView] customer_direct_message:", msg);

      if (activeChat.type === "customer" && msg.customerId === activeChat.id) {
        const isMsgFromMe = Boolean(
          (msg.senderId && currentUser?._id && msg.senderId === currentUser._id) ||
          (msg.senderName &&
            currentUser?.name &&
            msg.senderName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
        );

        const senderRole =
          msg.senderType === "customer"
            ? "Customer"
            : msg.senderType === "admin"
            ? "Admin"
            : isMsgFromMe
            ? currentUser?.role || "Sales"
            : "Other Employee";

        const senderName =
          msg.senderName ||
          (msg.senderType === "customer"
            ? activeChat.name
            : isMsgFromMe
            ? currentUser?.name || "You"
            : msg.senderType === "admin"
            ? "Admin"
            : "Sales Colleague");

        const formatted: TeamMessage = {
          _id: msg._id || msg.messageId || `cmsg-${Date.now()}`,
          channelType: "customer",
          customerId: msg.customerId,
          senderType: msg.senderType,
          senderId:
            msg.senderId ||
            (msg.senderType === "customer"
              ? msg.customerId
              : isMsgFromMe
              ? currentUser?._id || "sales"
              : "other-staff"),
          senderName,
          senderRole,
          content: msg.content,
          createdAt: msg.createdAt,
          isReadByCustomer: msg.isReadByCustomer,
          isReadByStaff: msg.isReadByStaff,
          mirroredFrom: msg.mirroredFrom,
          leadId: msg.leadId,
          channel: msg.channel,
        };

        setLiveMessages((prev) => {
          const exists = prev.some((m) => m._id === formatted._id);
          if (exists) return prev;

          const filtered = prev.filter(
            (m) => !(m.isOptimistic && m.content === formatted.content)
          );
          return [...filtered, formatted];
        });
      }

      queryClient.invalidateQueries({
        queryKey: customerDirectChatQueryKeys.all,
      });
    };

    // 2b. customer_direct_chat_updated
    const handleCustomerDirectChatUpdated = (data: { customerId?: string }) => {
      console.log("[CommunicationView] customer_direct_chat_updated:", data);
      queryClient.invalidateQueries({
        queryKey: customerDirectChatQueryKeys.all,
      });
      if (
        activeChat?.type === "customer" &&
        data?.customerId &&
        activeChat.id === data.customerId
      ) {
        queryClient.invalidateQueries({
          queryKey: customerDirectChatQueryKeys.messages(activeChat.id),
        });
      }
    };

    // 2c. new_customer_message (mirrored project message)
    const handleNewCustomerMsg = (data: {
      leadId?: string;
      message?: CustomerDirectMessage;
    }) => {
      console.log("[CommunicationView] new_customer_message:", data);
      queryClient.invalidateQueries({
        queryKey: customerDirectChatQueryKeys.all,
      });
      if (
        activeChat?.type === "customer" &&
        data?.message?.customerId &&
        activeChat.id === data.message.customerId
      ) {
        queryClient.invalidateQueries({
          queryKey: customerDirectChatQueryKeys.messages(activeChat.id),
        });
      }
    };

    // 3. team_typing
    const handleTyping = (data: TeamTypingEvent) => {
      console.log("[CommunicationView] team_typing:", data);
      if (
        data.channelType === activeChat.type &&
        data.channelId === activeChat.id &&
        data.userId !== currentUser?._id
      ) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return { ...prev, [data.name]: { isTyping: true, name: data.name } };
          }
          const next = { ...prev };
          delete next[data.name];
          return next;
        });
      }
    };

    // 4. team_messages_read
    const handleMessagesRead = (data: TeamMessagesReadEvent) => {
      console.log("[CommunicationView] team_messages_read:", data);
      if (
        data.channelType === activeChat.type &&
        data.channelId === activeChat.id
      ) {
        setLiveMessages((prev) =>
          prev.map((msg) => {
            if (!msg.readBy?.includes(data.by)) {
              return { ...msg, readBy: [...(msg.readBy || []), data.by] };
            }
            return msg;
          })
        );
      }
    };

    // 5. team_chat_error
    const handleChatError = (data: { message: string }) => {
      console.error("[CommunicationView] team_chat_error:", data);
      setErrorBanner(data.message || "Failed to deliver message");
    };

    socket.on("new_team_message", handleNewMessage);
    socket.on("customer_direct_message", handleCustomerDirectMessage);
    socket.on("customer_direct_chat_updated", handleCustomerDirectChatUpdated);
    socket.on("new_customer_message", handleNewCustomerMsg);
    socket.on("team_typing", handleTyping);
    socket.on("team_messages_read", handleMessagesRead);
    socket.on("team_chat_error", handleChatError);

    return () => {
      socket.off("new_team_message", handleNewMessage);
      socket.off("customer_direct_message", handleCustomerDirectMessage);
      socket.off("customer_direct_chat_updated", handleCustomerDirectChatUpdated);
      socket.off("new_customer_message", handleNewCustomerMsg);
      socket.off("team_typing", handleTyping);
      socket.off("team_messages_read", handleMessagesRead);
      socket.off("team_chat_error", handleChatError);
    };
  }, [socket, activeChat, currentUser, queryClient]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (!activeChat || activeChat.type === "customer") return;

    const channelType = activeChat.type;
    const channelId = activeChat.id;

    sendTypingStart(channelType, channelId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(channelType, channelId);
    }, 2500);
  };

  // Handle file uploads to presigned S3
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorBanner(null);

    try {
      const uploaded: TeamAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = await uploadFileToS3(file, "chat-attachments");

        uploaded.push({
          url: fileUrl,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }

      setPendingAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload file attachment";
      console.error("[CommunicationView] File upload error:", err);
      setErrorBanner(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChat) return;

    const trimmed = messageInput.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (activeChat.type !== "customer") {
      sendTypingStop(activeChat.type, activeChat.id);
    }

    const tempId = `temp-${Date.now()}`;

    if (activeChat.type === "customer") {
      // Optimistic message for customer direct chat
      const optimisticMsg: TeamMessage = {
        _id: tempId,
        channelType: "customer",
        customerId: activeChat.id,
        senderType: "sales",
        senderId: currentUser?._id || "sales",
        senderName: currentUser?.name || "You",
        content: trimmed,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        status: "pending",
      };

      setLiveMessages((prev) => [...prev, optimisticMsg]);
      setMessageInput("");
      setPendingAttachments([]);

      sendCustomerMessageMutation.mutate(
        { customerId: activeChat.id, content: trimmed },
        {
          onError: (err: unknown) => {
            const msg =
              err instanceof Error ? err.message : "Failed to send message to customer";
            setErrorBanner(msg);
            setLiveMessages((prev) =>
              prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
            );
          },
          onSuccess: (saved) => {
            if (saved?._id) {
              setLiveMessages((prev) =>
                prev.map((m) =>
                  m._id === tempId
                    ? {
                        ...m,
                        _id: saved._id || tempId,
                        status: "sent",
                        isOptimistic: false,
                      }
                    : m
                )
              );
            }
          },
        }
      );
      return;
    }

    // Team direct / group chat
    const optimisticMsg: TeamMessage = {
      _id: tempId,
      channelType: activeChat.type,
      groupId: activeChat.type === "group" ? activeChat.id : undefined,
      senderId: currentUser?._id || "me",
      senderName: currentUser?.name || "You",
      senderRole: currentUser?.role,
      content: trimmed,
      attachments: [...pendingAttachments],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      status: "pending",
    };

    setLiveMessages((prev) => [...prev, optimisticMsg]);

    sendMessage({
      channelType: activeChat.type,
      channelId: activeChat.id,
      content: trimmed,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    });

    setMessageInput("");
    setPendingAttachments([]);
  };

  // Active typing list string
  const typingText = useMemo(() => {
    const names = Object.keys(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.slice(0, 2).join(", ")} and others are typing...`;
  }, [typingUsers]);

  // Extract shared files from messages for the Files drawer
  const sharedFiles = useMemo(() => {
    const files: TeamAttachment[] = [];
    displayedMessages.forEach((msg) => {
      if (msg.attachments && msg.attachments.length > 0) {
        files.push(...msg.attachments);
      }
    });
    return files;
  }, [displayedMessages]);

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 1. Left Contact Sidebar */}
      <ChatSidebar
        currentUser={currentUser}
        isConnected={isConnected}
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        activeTeamTab={activeTeamTab}
        setActiveTeamTab={setActiveTeamTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeChat={activeChat}
        onSelectChat={(chat) => {
          setActiveChat(chat);
          setLiveMessages([]);
          setTypingUsers({});
          setErrorBanner(null);
          setIsDrawerOpen(false);
        }}
        conversations={conversationsData || []}
        isLoadingConversations={isLoadingConversations}
        customerConversations={customerConversationsData || []}
        isLoadingCustomerConversations={isLoadingCustomerConversations}
        onOpenNewChat={() => setIsNewChatModalOpen(true)}
      />

      {/* 2. Right Chat Main Area */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] relative min-w-0">
        {activeChat ? (
          <>
            <ChatHeader
              activeChat={activeChat}
              typingText={typingText}
              errorBanner={errorBanner}
              setErrorBanner={setErrorBanner}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
            />

            <ChatMessageList
              messages={displayedMessages}
              isLoadingHistory={
                isLoadingDirectHistory ||
                isLoadingGroupHistory ||
                isLoadingCustomerHistory
              }
              currentUserId={currentUser?._id}
              currentUserName={currentUser?.name}
              currentUserRole={currentUser?.role}
              messagesEndRef={messagesEndRef}
            />

            <ChatInputBar
              chatName={activeChat.name}
              messageInput={messageInput}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              pendingAttachments={pendingAttachments}
              onRemoveAttachment={removePendingAttachment}
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          </>
        ) : (
          <ChatEmptyState />
        )}
      </div>

      {/* 3. Right Sidebar Details Drawer */}
      {activeChat && (
        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeChat={activeChat}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          groupDetails={groupDetails}
          isLoadingGroupDetails={isLoadingGroupDetails}
          sharedFiles={sharedFiles}
        />
      )}

      {/* 4. New Direct Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        users={usersData || []}
        isLoadingUsers={isLoadingUsers}
        onSelectUser={(chat) => {
          setActiveChat(chat);
          setActiveMainTab("Team");
          setActiveTeamTab("Direct");
          setLiveMessages([]);
          setTypingUsers({});
          setErrorBanner(null);
          setIsDrawerOpen(false);
        }}
        currentUserId={currentUser?._id}
      />
    </div>
  );
};

export default CommunicationView;
