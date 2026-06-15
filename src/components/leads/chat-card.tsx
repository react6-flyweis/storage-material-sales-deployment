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
} from "@/modules/leads/leads.api";

type ChatMessage = {
  id: string;
  senderType: "customer" | "ai" | "sales" | "admin";
  senderId?: string | null;
  senderName?: string | null;
  content: string;
  createdAt: string;
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
  success: boolean;
  data: {
    messages: LeadDetailMessage[];
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

        const historyMessages = response.data.data.messages
          .map(toChatMessage)
          .filter((message): message is ChatMessage => message !== null);

        if (!isActive) {
          return;
        }

        setMessages((current) => mergeMessages(current, historyMessages));
      } catch {
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
      setStatusMessage(payload.message ?? "An unexpected chat error occurred.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("customer_typing", handleCustomerTyping);
    socket.on("error", handleError);
    socket.on("connect_error", (error) => {
      setStatusMessage(error.message);
      setIsConnected(false);
    });

    return () => {
      stopTyping();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("customer_typing", handleCustomerTyping);
      socket.off("error", handleError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, isHydrated, lead._id, stopTyping]);



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

  const canSend = Boolean(
    isHydrated && lead._id && lead.customerId && input.trim(),
  );

  return (
    <div className="flex-1 flex flex-col p-0 rounded-lg bg-white shadow">
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {/* Lead ID- */}
            <span className="font-semibold">{lead.jobId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {messages.length === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                Offline
              </span>
            ) : isConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Connecting
              </span>
            )}
            {isLoadingHistory ? (
              <span className="text-gray-400">Loading history...</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gray-100">
            <AvatarFallback className="text-sm text-gray-600 font-medium">
              {customer.firstName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold">
              Chat with {customer.firstName}
            </div>
            <div className="text-xs text-gray-500">
              {lead.projectName ?? "Untitled Lead"}
            </div>
          </div>
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
              const isSalesMessage = message.senderType === "sales";
              const isAiMessage = message.senderType === "ai";
              const senderLabel = isAiMessage
                ? "Assistant"
                : isSalesMessage
                   ? message.senderId === currentUser?._id
                    ? "You"
                    : (message.senderName ?? "Another Sales")
                  : message.senderType === "customer"
                    ? customer.firstName
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
                            ? customer.firstName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                            : (lead.projectName || "")
                              .split(" ")
                              .map((value) => value[0])
                              .join("")}
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
                      className={`text-xs text-gray-400 ${isSalesMessage ? "text-right" : "text-left"
                        }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>

                  {isSalesMessage ? (
                    <Avatar className="h-8 w-8 shrink-0 bg-blue-100">
                      <AvatarFallback className="text-xs text-blue-600">
                        SL
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
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
