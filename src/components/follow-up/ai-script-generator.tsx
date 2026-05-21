import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  FileText,
  SparkleIcon,
  Copy,
  Send,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { type Socket } from "socket.io-client";
import { createAdminSocket } from "@/lib/socket";
import { useAuthStore } from "@/modules/auth/auth.store";

type ApiSession = {
  _id: string;
  leadId?: { _id: string; projectName?: string } | string | null;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export default function AiScriptGenerator() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [apiSessions, setApiSessions] = useState<ApiSession[]>([]);
  const [hasLoadedSessions, setHasLoadedSessions] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const showLoading = isHydrated && accessToken ? !hasLoadedSessions : false;

  useEffect(() => {
    if (!isHydrated || !accessToken) return;

    const socket = createAdminSocket(accessToken);
    if (!socket) {
      return;
    }

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("ai_script:list");
    });

    socket.on("ai_script:sessions", (payload: { sessions?: ApiSession[] }) => {
      setApiSessions(payload.sessions ?? []);
      setHasLoadedSessions(true);
    });

    socket.on("connect_error", () => {
      setHasLoadedSessions(true);
    });

    socket.on("disconnect", () => {
      setHasLoadedSessions(true);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, isHydrated]);

  const truncateSnippet = (text: string, wordCount: number = 8) => {
    const words = text.split(" ").slice(0, wordCount).join(" ");
    return text.split(" ").length > wordCount ? `${words}...` : words;
  };

  const items = apiSessions.map((session) => {
    const lastMsg =
      session.messages && session.messages.length
        ? session.messages[session.messages.length - 1]
        : (session.messages?.[0] ?? {});
    const fullText = lastMsg.content ?? "";
    const snippet = truncateSnippet(fullText);
    const tone: "professional" | "generated" =
      lastMsg.role === "user" ? "professional" : "generated";
    const name =
      session.leadId && typeof session.leadId === "object"
        ? (session.leadId.projectName ?? `Session ${session._id}`)
        : `Session ${session._id}`;
    const timestamp =
      session.updatedAt ??
      session.createdAt ??
      lastMsg.timestamp ??
      new Date(0).toISOString();
    const time = new Date(timestamp).toLocaleString();
    const icon = lastMsg.role === "user" ? MessageCircle : FileText;
    const bg =
      tone === "professional"
        ? "bg-blue-50 text-blue-600"
        : "bg-purple-50 text-purple-600";

    return {
      name,
      tone,
      snippet,
      time,
      icon,
      bg,
    };
  });

  return (
    <Card>
      <Link to="/leads/follow-up/script-generator">
        <CardHeader className="flex items-center justify-between border-b">
          <div>
            <CardTitle>✨ AI Script Generator</CardTitle>
            <CardDescription>Recent generated scripts</CardDescription>
          </div>

          <div className="flex items-center space-x-2" data-slot="card-action">
            <Link to="/leads/follow-up/script-generator">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <SparkleIcon />
                Generate
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="space-y-3">
        {showLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded-md p-4 animate-pulse"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="h-9 w-9 bg-gray-200 rounded-full shrink-0" />

                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          items.slice(-3).map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.name}
                className="flex items-center justify-between border rounded-md p-4"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className={`h-9 w-9 ${it.bg}`}>
                    <AvatarFallback className="text-sm">
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium text-foreground">{it.name}</div>
                    <div className="text-sm text-muted-foreground max-w-xl">
                      {it.snippet}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {it.time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      it.tone === "professional"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {it.tone}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 rounded hover:bg-muted/40"
                      aria-label="copy"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <button
                      className="p-1 rounded hover:bg-muted/40"
                      aria-label="send"
                      title="Send"
                    >
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/leads/follow-up/script-generator">
          <Button variant="link">
            View All Scripts
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
