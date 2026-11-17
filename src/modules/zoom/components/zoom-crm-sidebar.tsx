import type React from "react";
import { useState } from "react";
import {
  X,
  FileText,
  User,
  Building,
  DollarSign,
  Phone,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Check,
  // Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ZoomMeetingMetadata,
  ZoomParticipant,
  ZoomChatMessage,
} from "../zoom.types";

interface ZoomCrmSidebarProps {
  activeTab: "crm" | "chat" | "participants";
  metadata: ZoomMeetingMetadata;
  participants: ZoomParticipant[];
  chatMessages: ZoomChatMessage[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onSendMessage: (msg: string) => void;
  onClose: () => void;
}

export const ZoomCrmSidebar: React.FC<ZoomCrmSidebarProps> = ({
  activeTab,
  metadata,
  participants,
  chatMessages,
  notes: _notes,
  onNotesChange: _onNotesChange,
  onSendMessage,
  onClose,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  // const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/meetings/room/${metadata.meetingId}`,
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // const handleAiNoteSuggestion = () => {
  //   setIsAiGenerating(true);
  //   setTimeout(() => {
  //     const summaryBullet = `\n• [AI Summary]: Client agreed on structural specifications for PEMB phase 1.\n• Delivery requested for next month.\n• Requested final revision on freight discounts.`;
  //     onNotesChange(notes ? notes + summaryBullet : summaryBullet.trim());
  //     setIsAiGenerating(false);
  //   }, 800);
  // };

  return (
    <aside className="w-80 sm:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-30 transition-all">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
        <div className="flex items-center gap-2">
          {activeTab === "crm" && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Lead & Call Context</h3>
            </div>
          )}
          {activeTab === "chat" && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">In-Meeting Chat</h3>
            </div>
          )}
          {activeTab === "participants" && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Participants ({participants.length})</h3>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Close Sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab 1: CRM Lead & Deal Intelligence */}
      {activeTab === "crm" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Client Card */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/40 border border-blue-100 p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{metadata.leadName || "Johnathan Smith"}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                  <Building className="h-3.5 w-3.5 text-gray-400" />
                  <span>{metadata.company || "Apex Warehousing Ltd."}</span>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                Active Lead
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1 text-xs text-gray-600">
              {metadata.customerEmail && (
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="truncate">{metadata.customerEmail}</span>
                </div>
              )}
              {metadata.customerPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                  <span>{metadata.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Deal Snapshot */}
            <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">Quotation Value:</span>
              <span className="font-bold text-blue-700 flex items-center">
                <DollarSign className="h-3.5 w-3.5" />
                {metadata.quoteAmount || "$48,500.00"}
              </span>
            </div>
          </div>

          {/* Quick CRM Navigation Link */}
          {metadata.leadId && (
            <a
              href={`/leads/${metadata.leadId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Open Lead Overview in New Tab</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Temporarily commented out: Live Call Notes & AI Summary */}
          {/*
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="meeting-notes" className="text-xs font-semibold text-gray-700">
                Live Call Notes & Commitments
              </label>
              <button
                type="button"
                onClick={handleAiNoteSuggestion}
                disabled={isAiGenerating}
                className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 transition-colors"
                title="Summarize key points with AI"
              >
                <Sparkles className="h-3 w-3" />
                <span>{isAiGenerating ? "Generating..." : "AI Assistant"}</span>
              </button>
            </div>

            <Textarea
              id="meeting-notes"
              placeholder="Take notes during the meeting (auto-saved to lead activity)..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={8}
              className="text-xs resize-none border-gray-300 focus:border-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
            <p className="text-[10px] text-gray-400">
              Notes are automatically synchronized with the customer's CRM communication timeline.
            </p>
          </div>
          */}

          {/* Meeting Invite Link Copy */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
            <span className="text-xs font-medium text-gray-700">Invite Customer / Co-worker</span>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/meetings/room/${metadata.meetingId}`}
                className="text-xs h-8 bg-white text-gray-900 border-gray-300"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyMeetingLink}
                className="h-8 px-2.5 shrink-0"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: In-Meeting Chat */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                No messages yet. Send a message to participants.
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderRole === "host";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-xl px-3 py-2 text-xs",
                      isMe
                        ? "ml-auto bg-blue-600 text-white rounded-br-none"
                        : "mr-auto bg-gray-100 text-gray-800 rounded-bl-none",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={cn("font-bold text-[10px]", isMe ? "text-blue-100" : "text-gray-500")}>
                        {msg.senderName}
                      </span>
                      <span className={cn("text-[9px]", isMe ? "text-blue-200" : "text-gray-400")}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
            <Input
              placeholder="Send message to everyone..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="text-xs h-9 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300"
            />
            <Button type="submit" size="sm" className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Tab 3: Participants List */}
      {activeTab === "participants" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.role === "host" && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-normal">
                          Host (You)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">{p.company || "Participant"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  {p.isMuted ? (
                    <span className="text-red-500 text-[10px]">Muted</span>
                  ) : (
                    <span className="text-emerald-500 text-[10px]">Audio On</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={copyMeetingLink}
              className="w-full text-xs flex items-center justify-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Copy Meeting Invite Link"}</span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
