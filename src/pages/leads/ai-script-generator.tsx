import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Menu, MessageCircle, Copy, AlertCircle } from "lucide-react";
import MessageItem from "@/components/message-item";
import { cn } from "@/lib/utils";
// import FollowUpDialog from "@/components/follow-up/follow-up-dialog";
import SuccessDialog from "@/components/success-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { type Socket } from "socket.io-client";
import { createAdminSocket } from "@/lib/socket";
import { useAuthStore } from "@/modules/auth/auth.store";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ApiSession {
  _id: string;
  salesEmployeeId: string;
  leadId: { _id: string; projectName: string } | null;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AiScriptGeneratorPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [inputMessage, setInputMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [apiSessions, setApiSessions] = useState<ApiSession[]>([]);
  const [currentSessionMessages, setCurrentSessionMessages] = useState<
    Message[]
  >([]);
  const [assistantBuffer, setAssistantBuffer] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [currentSessionMessages.length, assistantBuffer, isAiTyping]);

  useEffect(() => {
    if (!isHydrated || !accessToken) return;

    const socket = createAdminSocket(accessToken);

    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setSocketError(null);

      // Load sessions list
      console.log("ai_script: requesting sessions list");
      socket.emit("ai_script:list");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setSocketError(err.message || "Connection error");
    });

    // Merge incoming sessions with existing local sessions to avoid
    // losing history if the server emits only a subset (e.g. last session).
    socket.on(
      "ai_script:sessions",
      ({ sessions }: { sessions?: ApiSession[] }) => {
        console.log("ai_script:sessions received", sessions);
        if (!sessions) return;
        setApiSessions((prev) => {
          const map = new Map<string, ApiSession>(prev.map((s) => [s._id, s]));
          sessions.forEach((s) => map.set(s._id, s));
          const merged = Array.from(map.values());
          console.log("apiSessions merged:", merged);
          return merged;
        });
      },
    );

    socket.on(
      "ai_script:session",
      ({
        sessionId,
        messages,
      }: {
        sessionId: string;
        messages: ApiSession["messages"];
      }) => {
        setActiveSessionId(sessionId);
        const mappedMessages: Message[] = messages.map((m, i) => ({
          id: `${m.timestamp || Date.now()}-${i}`,
          text: m.content,
          sender: m.role === "user" ? "user" : "ai",
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setCurrentSessionMessages(mappedMessages);
        setIsAiTyping(false);
        setAssistantBuffer("");
      },
    );

    socket.on("ai_script:typing", () => {
      setAssistantBuffer("");
      setIsAiTyping(true);
    });

    socket.on("ai_script:chunk", ({ delta }) => {
      setAssistantBuffer((prev) => prev + delta);
    });

    socket.on("ai_script:done", ({ reply }) => {
      setIsAiTyping(false);
      const newMsg: Message = {
        id: Date.now().toString(),
        text: reply,
        sender: "ai",
        timestamp: new Date(),
      };
      setCurrentSessionMessages((prev) => [...prev, newMsg]);
      setAssistantBuffer("");

      // Refresh session list
      socket.emit("ai_script:list");
    });

    socket.on("ai_script:error", ({ message }) => {
      setIsAiTyping(false);
      setAssistantBuffer("");
      setSocketError(message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Intentionally exclude `activeSessionId` so selecting a session doesn't
    // force a socket reconnect and potentially lose the sessions list.
  }, [isHydrated, accessToken]);

  // const handleSessionSelect = (sessionId: string) => {
  //   setActiveSessionId(sessionId);
  //   setSocketError(null);
  //   if (socketRef.current?.connected) {
  //     socketRef.current.emit("ai_script:start", { sessionId });
  //   }
  // };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current?.connected) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setCurrentSessionMessages((prev) => [...prev, newMessage]);
    setSocketError(null);

    socketRef.current.emit("ai_script:message", {
      ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      content: inputMessage,
    });

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const sessionHistory = [...apiSessions]
    .sort((left, right) => {
      const rightDate = new Date(right.updatedAt || right.createdAt).getTime();
      const leftDate = new Date(left.updatedAt || left.createdAt).getTime();
      return rightDate - leftDate;
    })
    .map((session) => {
      const lastMessage =
        session.messages[session.messages.length - 1] ?? session.messages[0];
      const leadName =
        session.leadId && typeof session.leadId === "object"
          ? (session.leadId.projectName ?? "Untitled lead")
          : session.leadId
            ? `Lead ${String(session.leadId)}`
            : "Generic Script";

      const snippet = (lastMessage?.content ?? "No messages yet")
        .split(/\s+/)
        .slice(0, 12)
        .join(" ");

      const fallbackTimestamp =
        session.updatedAt ||
        session.createdAt ||
        lastMessage?.timestamp ||
        new Date().toISOString();
      const safeDateStr = isNaN(new Date(fallbackTimestamp).getTime())
        ? new Date().toISOString()
        : fallbackTimestamp;

      return {
        id: session._id,
        leadName,
        snippet,
        time: new Date(safeDateStr).toLocaleString(),
        messageCount: session.messages.length,
        messages: session.messages,
      };
    });

  // Do not auto-resolve to an existing session; default to starting a new chat
  const resolvedActiveSessionId =
    activeSessionId &&
    sessionHistory.some((item) => item.id === activeSessionId)
      ? activeSessionId
      : null;

  const mappedApiMessages = currentSessionMessages;

  const isComposerDisabled = !isConnected;

  return (
    <div className="">
      <div className="bg-teal-400 text-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-medium">AI Follow-Up Script Generator</h1>
      </div>

      <div className="p-6">
        <Card className="bg-white shadow-sm mb-4 py-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-96 p-2 bg-white rounded-lg shadow-md">
                  <div className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Previous sessions
                  </div>
                  <div className="space-y-2">
                    {sessionHistory.length ? (
                      sessionHistory.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          className={cn(
                            "flex w-full cursor-pointer flex-col items-stretch rounded-lg border p-3 outline-none",
                            resolvedActiveSessionId === item.id
                              ? "border-blue-200 bg-blue-50"
                              : "border-gray-200 bg-white",
                          )}
                          onSelect={() => {
                            setActiveSessionId(item.id);
                            setSocketError(null);
                            if (socketRef.current?.connected) {
                              socketRef.current.emit("ai_script:start", {
                                sessionId: item.id,
                              });
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-3">
                              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                <MessageCircle className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-sm font-medium text-gray-900">
                                    {item.leadName}
                                  </h4>
                                  {resolvedActiveSessionId === item.id ? (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                      Open
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                  {item.snippet}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {item.messageCount}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                            <span>{item.time}</span>
                            <div className="flex items-center gap-2">
                              <button className="rounded p-1 hover:bg-gray-100">
                                <Copy className="h-4 w-4 text-gray-500" />
                              </button>
                              <button className="rounded p-1 hover:bg-gray-100">
                                <Send className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                        No chat history yet.
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <h2 className="font-medium text-gray-900">
                AI Follow-Up Script Generator
              </h2>
            </div>

            {/* <FollowUpDialog
              showClientSelector={true}
              onFollowUp={() => setShowSuccess(true)}
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Sparkles className="h-4 w-4" />
                Use Script
              </Button>
            </FollowUpDialog> */}
          </div>

          <div className="p-6 space-y-4 min-h-[50vh] max-h-[100vh-160px] overflow-y-auto">
            {!isConnected && !socketError && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Connecting to the script generator. This may take a moment...
              </div>
            )}

            {socketError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{socketError}</span>
              </div>
            )}

            {isConnected &&
              mappedApiMessages.length === 0 &&
              !isAiTyping &&
              !socketError && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="font-medium text-gray-700">
                    No messages yet
                  </div>
                  <div className="text-xs text-gray-400">
                    Start the conversation to generate a script.
                  </div>
                </div>
              )}

            {mappedApiMessages?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="rounded-lg px-4 py-3 bg-gray-100 text-gray-900 min-h-11">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {assistantBuffer}
                      {isAiTyping && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={
                  isComposerDisabled
                    ? "Connecting to socket..."
                    : "Type your message..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white"
                disabled={isComposerDisabled}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                disabled={isComposerDisabled}
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </Card>

        <SuccessDialog
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Script applied successfully!"
          okLabel="Done"
        />
      </div>
    </div>
  );
}
