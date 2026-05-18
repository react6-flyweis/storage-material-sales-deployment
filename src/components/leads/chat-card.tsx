import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  chatCount?: number;
};

type Props = {
  lead: Lead;
  recentMessages?: Array<{
    _id: string;
    senderType: string;
    content: string;
    createdAt: string;
  }>;
};

export default function ChatCard({ lead, recentMessages }: Props) {
  const [messages, setMessages] = useState<
    Array<{ id: string | number; from: string; text: string; time: string }>
  >([
    {
      id: 1,
      from: "lead",
      text: "Hi, I'm interested in the workshop pricing.",
      time: "9:41 AM",
    },
    {
      id: 2,
      from: "you",
      text: "Thanks — I'll share a quick quote shortly.",
      time: "9:45 AM",
    },
    {
      id: 3,
      from: "lead",
      text: "That sounds great! Looking forward to it.",
      time: "9:46 AM",
    },
    {
      id: 4,
      from: "you",
      text: "Here's the pricing breakdown for the workshop. Let me know if you have any questions.",
      time: "10:15 AM",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (recentMessages && recentMessages.length > 0) {
      const mapped = recentMessages.map((m) => ({
        id: m._id,
        from: m.senderType === "customer" ? "lead" : "lead",
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      }));
      setMessages(mapped);
    }
  }, [recentMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "you", text: input.trim(), time },
    ]);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col p-0 rounded-lg bg-white shadow">
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            Lead ID-<span className="font-semibold">{lead.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gray-100">
            <AvatarFallback className="text-sm text-gray-600 font-medium">
              {lead.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold">Chat with {lead.name}</div>
            <div className="text-xs text-gray-500">{lead.id}</div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-center mb-4">
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Today
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${
                m.from === "you" ? "justify-end" : "justify-start"
              }`}
            >
              {m.from === "lead" && (
                <Avatar className="h-8 w-8 bg-gray-100 shrink-0">
                  <AvatarFallback className="text-xs text-gray-600">
                    {lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-1 max-w-[70%]">
                <div
                  className={`p-3 rounded-lg text-sm ${
                    m.from === "you"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <div
                  className={`text-xs text-gray-400 ${
                    m.from === "you" ? "text-right" : "text-left"
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-white"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
