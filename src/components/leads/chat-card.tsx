import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Loader2, Paperclip, Send } from "lucide-react";
import { type Socket } from "socket.io-client";
import { apiClient } from "@/modules/auth/auth.api";
import { createAdminSocket } from "@/lib/socket";
import { useAuthStore } from "@/modules/auth/auth.store";
import type {
  LeadDetailCustomer,
  LeadDetailLead,
  LeadDetailMessage,
  ChatStatusResponse,
} from "@/modules/leads/leads.api";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import ChatDropOffDialog from "@/components/leads/chat-drop-off-dialog";
import ChannelBadge from "@/components/leads/channel-badge";
import { toast } from "sonner";
import {
  getMessageSource,
  getMessageSourceLabel,
  resolveChatChannel,
  type ChatChannel,
  type MessageSource,
} from "@/lib/chat-source";

function getInitials(value?: string | null, fallback = "?") {
  const initials = (value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || fallback;
}

function formatLastSeen(timestamp?: string | null) {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

type ChatMessage = {
  id: string;
  senderType: "customer" | "ai" | "sales" | "admin";
  senderId?: string | null;
  senderName?: string | null;
  content: string;
  createdAt: string;
  source: MessageSource;
  sourceLabel: string;
};

// type Lead = {
//   id: string;
//   name: string;
//   customerId?: string;
//   assignedSalesName?: string;
//   chatCount?: number;
// };

type Props = {
  lead: LeadDetailLead;
  customer: LeadDetailCustomer;
  recentMessages?: LeadDetailMessage[];
};

type PublicChatHistoryResponse = {
  success?: boolean;
  messages?: LeadDetailMessage[];
  chat?: {
    messageCount?: number;
    messages?: LeadDetailMessage[];
  };
  call?: {
    sessionCount?: number;
    turnCount?: number;
    sessions?: unknown[];
  };
  summary?: {
    text?: string;
    updatedAt?: string;
  };
  data?: {
    messages?: LeadDetailMessage[];
    chat?: {
      messageCount?: number;
      messages?: LeadDetailMessage[];
    };
  };
};

type LeadChatMessagePayload = {
  _id?: string;
  senderType?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  sender?: string | null;
  content?: string;
  text?: string;
  createdAt?: string;
  origin?: "chat" | "messenger" | "call";
  source?: "website" | "facebook" | "phone";
  sourceLabel?: string | null;
  leadId?: string;
  callSessionId?: string | null;
  channel?: string | null;
};

type ChatStatusSocketPayload = {
  leadId?: string;
  isCustomerOnline: boolean;
  canStaffSend?: boolean;
  channel?: "website" | "facebook";
  leadLastSeenAt?: string | null;
  customerOnline?: {
    isOnline: boolean;
    lastSeenAt?: string | null;
  } | null;
};

function formatMessageTime(value?: string) {
  return new Date(value ?? Date.now()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}


function toChatMessage(
  message: LeadDetailMessage | LeadChatMessagePayload,
): ChatMessage | null {
  // Exclude voice call transcript turns from the widget chat feed
  if (message.origin === "call" || message.channel === "call" || message.callSessionId) {
    return null;
  }

  const content = message.content ?? message.text ?? "";

  if (!content.trim()) {
    return null;
  }

  return {
    id: message._id ?? `${message.createdAt ?? Date.now()}-${content}`,
    senderType: (message.senderType ?? "customer") as "customer" | "ai" | "sales" | "admin",
    senderId: message.senderId ?? null,
    senderName:
      "senderName" in message
        ? (message.senderName ?? message.sender ?? null)
        : (message.sender ?? null),
    content,
    createdAt: message.createdAt ?? new Date().toISOString(),
    source: getMessageSource(message),
    sourceLabel: getMessageSourceLabel(message),
  } satisfies ChatMessage;
}

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();

  for (const message of existing) {
    byId.set(message.id, message);
  }

  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return Array.from(byId.values()).sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export default function ChatCard({ lead, customer, recentMessages }: Props) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  const [customerOnline, setCustomerOnline] = useState<boolean>(
    customer.isOnline ?? false
  );
  const [leadOnline, setLeadOnline] = useState<boolean>(
    lead.isOnline ?? false
  );
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(
    lead.lastSeenAt ?? customer.lastSeenAt ?? null
  );
  const [statusChannel, setStatusChannel] = useState<string | null>(null);
  const [canStaffSend, setCanStaffSend] = useState<boolean | null>(null);

  const channel: ChatChannel = resolveChatChannel(statusChannel, lead);
  const isFacebook = channel === "facebook";

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lead._id || !accessToken) return;

    let isMounted = true;

    async function fetchChatStatus() {
      try {
        const path = role === "admin"
          ? `/api/admin/leads/${lead._id}/chat-status`
          : `/api/sales/leads/${lead._id}/chat-status`;
        const response = await apiClient.get<ChatStatusResponse>(path);
        if (isMounted && response.data.success) {
          const status = response.data.data;
          setLeadOnline(status.isCustomerOnline);
          if (status.customerOnline) {
            setCustomerOnline(status.customerOnline.isOnline);
          }
          setLastSeenAt(status.leadLastSeenAt ?? status.customerOnline?.lastSeenAt ?? null);
          setStatusChannel(status.channel ?? null);
          setCanStaffSend(
            typeof status.canStaffSend === "boolean" ? status.canStaffSend : null,
          );
        }
      } catch (err) {
        console.error("Failed to fetch chat status", err);
      }
    }

    void fetchChatStatus();

    return () => {
      isMounted = false;
    };
  }, [lead._id, accessToken, role]);

  useEffect(() => {
    if (!recentMessages || recentMessages.length === 0) {
      return;
    }

    const mappedRecentMessages = recentMessages
      .map(toChatMessage)
      .filter((message): message is ChatMessage => message !== null);

    setMessages((current) => mergeMessages(current, mappedRecentMessages));
  }, [recentMessages]);

  useEffect(() => {
    let isActive = true;

    // If the component already received initial messages via props,
    // don't load the full public history to avoid duplicate fetches.
    if (recentMessages && recentMessages.length > 0) {
      setIsLoadingHistory(false);
      return () => {
        isActive = false;
      };
    }

    async function loadFullHistory() {
      if (!lead._id) {
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);

      try {
        const response = await apiClient.get<PublicChatHistoryResponse>(
          `/api/public/chat/history/${lead._id}`,
        );

        const resData = response.data;
        const rawList =
          resData?.messages ??
          resData?.data?.messages ??
          resData?.chat?.messages ??
          resData?.data?.chat?.messages ??
          [];

        const historyMessages = rawList
          .map(toChatMessage)
          .filter((message): message is ChatMessage => message !== null);

        if (!isActive) {
          return;
        }

        setMessages((current) => mergeMessages(current, historyMessages));
      } catch (err) {
        console.error("Failed to load chat history:", err);
        if (!isActive) {
          return;
        }

        setStatusMessage("Unable to load the full chat history.");
      } finally {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadFullHistory();

    return () => {
      isActive = false;
    };
  }, [lead._id, recentMessages]);

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!socket?.connected) {
      return;
    }

    socket.emit("sales_typing_stop", { leadId: lead._id });
  }, [lead._id]);

  const markMessagesRead = useCallback(() => {
    const socket = socketRef.current;

    if (!socket?.connected) {
      return;
    }

    socket.emit("mark_messages_read", { leadId: lead._id });
  }, [lead._id]);

  function emitTypingStart() {
    const socket = socketRef.current;

    if (!socket?.connected) {
      return;
    }

    socket.emit("sales_typing_start", { leadId: lead._id });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("sales_typing_stop", { leadId: lead._id });
      typingTimeoutRef.current = null;
    }, 1200);
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    markMessagesRead();
  }, [messages, markMessagesRead]);

  useEffect(() => {
    if (!isHydrated || !lead._id || !accessToken) {
      return;
    }

    const socket = createAdminSocket(accessToken);

    if (!socket) return;

    socketRef.current = socket;

    const joinLeadChat = () => {
      socket.emit("join_lead_chat", { leadId: lead._id });
      socket.emit("mark_messages_read", { leadId: lead._id });
    };

    const handleConnect = () => {
      setIsConnected(true);
      setStatusMessage(null);
      setCustomerTyping(false);
      joinLeadChat();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (payload: LeadChatMessagePayload) => {
      const nextMessage = toChatMessage(payload);

      if (!nextMessage) {
        return;
      }

      setMessages((current) => mergeMessages(current, [nextMessage]));
    };

    const handleCustomerTyping = (payload: { isTyping?: boolean }) => {
      setCustomerTyping(Boolean(payload.isTyping));
    };

    const handleError = (payload: { message?: string }) => {
      // e.g. "Saved in the CRM, but Facebook did not accept the reply"
      toast.error(payload.message ?? "An unexpected chat error occurred.");
    };

    const handleChatStatus = (payload: ChatStatusSocketPayload) => {
      if (payload.leadId && payload.leadId !== lead._id) {
        return;
      }
      if (payload.channel) {
        setStatusChannel(payload.channel);
      }
      if (typeof payload.canStaffSend === "boolean") {
        setCanStaffSend(payload.canStaffSend);
      }
      setLeadOnline(payload.isCustomerOnline);
      if (payload.customerOnline) {
        setCustomerOnline(payload.customerOnline.isOnline);
      }
      setLastSeenAt(payload.leadLastSeenAt ?? payload.customerOnline?.lastSeenAt ?? null);
    };

    const handleCustomerOnlineStatus = (payload: {
      customerId: string;
      leadId: string;
      isOnline: boolean;
      scope: "lead" | "customer";
      lastSeenAt: string;
      customerIsOnline: boolean;
      leadIsOnline: boolean;
    }) => {
      if (payload.leadId !== lead._id) {
        return;
      }
      setLeadOnline(payload.leadIsOnline);
      setCustomerOnline(payload.customerIsOnline);
      setLastSeenAt(payload.lastSeenAt);
    };

    const handleNewCustomerMessage = (payload: {
      leadId?: string;
      message?: LeadChatMessagePayload;
    }) => {
      if (payload?.leadId === lead._id && payload.message) {
        handleNewMessage(payload.message);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("new_customer_message", handleNewCustomerMessage);
    socket.on("customer_typing", handleCustomerTyping);
    socket.on("chat_status", handleChatStatus);
    socket.on("customer_online_status", handleCustomerOnlineStatus);
    socket.on("error", handleError);
    socket.on("connect_error", (error) => {
      setStatusMessage(error.message);
      setIsConnected(false);
    });

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      stopTyping();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("new_customer_message", handleNewCustomerMessage);
      socket.off("customer_typing", handleCustomerTyping);
      socket.off("chat_status", handleChatStatus);
      socket.off("customer_online_status", handleCustomerOnlineStatus);
      socket.off("error", handleError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, isHydrated, lead._id, stopTyping, role]);



  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = () => {
    const content = input.trim();

    if (!content) {
      return;
    }

    const socket = socketRef.current;

    if (!socket?.connected || !lead.customerId) {
      setStatusMessage(
        "Chat is still connecting. Please try again in a moment.",
      );
      return;
    }

    socket.emit("sales_message", {
      leadId: lead._id,
      content,
    });

    setInput("");
    stopTyping();
  };

  // Website: the composer closes when the customer leaves the site.
  // Facebook: Messenger delivers replies while the customer is away, so only
  // lock when the backend says staff cannot send (e.g. chat ended).
  const isComposerLocked =
    messages.length > 0 &&
    (isFacebook ? canStaffSend === false : !customerOnline);
  const lockedMessage = isFacebook
    ? "Replies are disabled for this chat."
    : "Customer is offline. Chat is closed.";
  const showFacebookAwayHint =
    isFacebook && messages.length > 0 && !isComposerLocked && !leadOnline;

  const canSend = Boolean(
    isHydrated && lead._id && lead.customerId && input.trim() && !isComposerLocked,
  );

  return (
    <div className="flex-1 flex flex-col p-0 rounded-lg bg-white shadow">
      <div className="px-6 py-4 border-b">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {/* Lead ID- */}
            <span className="font-semibold">{lead.jobId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Connecting
              </span>
            )}
            {isLoadingHistory ? (
              <span className="text-gray-400">Loading history...</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gray-100">
                <AvatarFallback className="text-sm text-gray-600 font-medium">
                  {getInitials(customer.firstName)}
                </AvatarFallback>
              </Avatar>
              {leadOnline ? (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              ) : customerOnline && !isFacebook ? (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              ) : null}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">
                  Chat with {customer.firstName || "Customer"}
                </span>
                <ChannelBadge
                  source={channel}
                  label={isFacebook ? "Facebook Messenger" : "Website chat"}
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{getLeadProjectName(lead as Record<string, unknown>, customer)}</span>
                <span>•</span>
                {leadOnline ? (
                  <span className="text-emerald-600 font-medium">
                    {isFacebook ? "Active on Facebook" : "Active now"}
                  </span>
                ) : customerOnline && !isFacebook ? (
                  <span className="text-emerald-500 font-medium">Online on site</span>
                ) : lastSeenAt ? (
                  <span>Last seen {formatLastSeen(lastSeenAt)}</span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setFollowUpOpen(true)}
          >
            Follow-up
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {statusMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-center text-sm text-gray-500">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
              💬
            </div>
            <div className="font-medium text-gray-700">No messages yet</div>
            <div className="text-xs text-gray-400">
              The chat cannot be initiated from here. The customer must start the conversation first.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              // Staff replies (sales or admin) render on the right.
              const isSalesMessage =
                message.senderType === "sales" || message.senderType === "admin";
              const isAiMessage = message.senderType === "ai";
              const senderLabel = isAiMessage
                ? (message.senderName ?? "Assistant")
                : isSalesMessage
                  ? message.senderId === currentUser?._id
                    ? "You"
                    : (message.senderName ??
                      (message.senderType === "admin" ? "Admin" : "Another Sales"))
                  : message.senderType === "customer"
                    ? (message.senderName ?? customer.firstName)
                    : "";
              // : lead.projectName;

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isSalesMessage ? "justify-end" : "justify-start"}`}
                >
                  {!isSalesMessage ? (
                    <Avatar
                      className={`h-8 w-8 shrink-0 ${isAiMessage ? "bg-blue-50" : "bg-gray-100"}`}
                    >
                      <AvatarFallback
                        className={`text-xs ${isAiMessage ? "text-blue-700" : "text-gray-600"}`}
                      >
                        {isAiMessage
                          ? "AI"
                          : message.senderType === "customer"
                            ? getInitials(customer.firstName)
                            : getInitials(
                              getLeadProjectName(lead as Record<string, unknown>, customer),
                              "",
                            )}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div className="flex max-w-[70%] flex-col gap-1">
                    <div
                      className={`text-sm font-medium text-gray-700 ${isSalesMessage ? "text-right" : "text-left"
                        }`}
                    >
                      {senderLabel}
                    </div>
                    <div
                      className={`whitespace-pre-wrap rounded-lg p-3 text-sm ${isSalesMessage
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : isAiMessage
                          ? "rounded-bl-sm bg-blue-50 text-blue-950"
                          : "rounded-bl-sm bg-gray-100 text-gray-900"
                        }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-xs text-gray-400 ${isSalesMessage ? "justify-end" : "justify-start"
                        }`}
                    >
                      <ChannelBadge source={message.source} label={message.sourceLabel} />
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                  </div>

                  {isSalesMessage ? (
                    <Avatar className="h-8 w-8 shrink-0 bg-blue-100">
                      <AvatarFallback className="text-xs text-blue-600">
                        {message.senderType === "admin" ? "AD" : "SL"}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {customerTyping ? (
        <div className="px-6 pb-2 text-xs text-gray-500">
          Customer is typing...
        </div>
      ) : null}

      {/* Input Area */}
      <div className="relative px-6 py-4 border-t bg-gray-50">
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${isComposerLocked
            ? "blur-[1.5px] pointer-events-none select-none opacity-50"
            : ""
            }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-500 hover:text-gray-700"
            disabled={messages.length === 0 || !lead.customerId}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => {
              setInput((e.target as HTMLInputElement).value);
              emitTypingStart();
            }}
            onBlur={stopTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              messages.length > 0
                ? "Type a message..."
                : "Chat cannot be initiated from here..."
            }
            className="flex-1 bg-white"
            disabled={messages.length === 0 || !lead.customerId}
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
            disabled={!canSend}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {showFacebookAwayHint ? (
          <div className="mt-2 text-xs text-gray-500">
            Customer is away on Facebook — they&apos;ll see your reply in Messenger.
          </div>
        ) : null}

        {isComposerLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/20">
            <span className="text-sm font-medium text-gray-500 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-100">
              {lockedMessage}
            </span>
          </div>
        )}
      </div>

      <ChatDropOffDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        leadId={lead._id}
        customerName={customer.firstName}
      />
    </div>
  );
}
