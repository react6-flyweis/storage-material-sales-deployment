import { useState } from "react";
import { MessageSquare, Phone, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeadTranscriptsQuery } from "@/modules/leads/leads.hooks";
import type {
  LeadDetailCustomer,
  LeadDetailLead,
  LeadDetailMessage,
} from "@/modules/leads/leads.api";
import ChatCard from "@/components/leads/chat-card";
import CallSessionList from "@/components/leads/call-session-list";
import AiSummaryCard from "@/components/leads/ai-summary-card";

type Props = {
  lead: LeadDetailLead;
  customer: LeadDetailCustomer;
  recentMessages?: LeadDetailMessage[];
};

type SubTab = "chat" | "call" | "summary";

export default function LeadTranscriptsCard({
  lead,
  customer,
  recentMessages,
}: Props) {
  const { data: response } = useLeadTranscriptsQuery(lead._id, "all");
  const transcripts = response?.data;

  const [selectedTab, setSelectedTab] = useState<SubTab | null>(null);

  const defaultTab: SubTab = "chat";

  const activeTab: SubTab = selectedTab ?? defaultTab;

  const chatCount = transcripts?.chat?.messageCount ?? 0;
  const callCount = transcripts?.call?.sessionCount ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tab Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-lg">
          {/* Chat Tab */}
          <button
            type="button"
            onClick={() => setSelectedTab("chat")}
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat</span>
            {chatCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] bg-slate-100 text-slate-700"
              >
                {chatCount}
              </Badge>
            ) : null}
          </button>

          {/* Calls Tab */}
          <button
            type="button"
            onClick={() => setSelectedTab("call")}
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "call"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Voice Calls</span>
            {callCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] bg-blue-50 text-blue-700"
              >
                {callCount}
              </Badge>
            ) : null}
          </button>

          {/* AI Summary Tab */}
          <button
            type="button"
            onClick={() => setSelectedTab("summary")}
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Summary</span>
            {transcripts?.summary?.text ? (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            ) : null}
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-2">
          {activeTab === "chat" && "Live chat with customer"}
          {activeTab === "call" && "Twilio voice calls & speech transcripts"}
          {activeTab === "summary" && "AI-extracted project scope and details"}
        </div>
      </div>

      {/* Sub-tab Content Area */}
      <div>
        {activeTab === "chat" && (
          <ChatCard
            lead={lead}
            customer={customer}
            recentMessages={recentMessages}
          />
        )}

        {activeTab === "call" && (
          <CallSessionList
            sessions={transcripts?.call?.sessions ?? []}
            leadId={lead._id}
          />
        )}

        {activeTab === "summary" && (
          <AiSummaryCard
            summary={transcripts?.summary}
            projectName={lead.projectName}
          />
        )}
      </div>
    </div>
  );
}
