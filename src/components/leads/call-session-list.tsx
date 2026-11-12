import { useState } from "react";
import {
  Phone,
  PhoneCall,
  Clock,
  ChevronDown,
  Bot,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CallSession } from "@/modules/leads/leads.api";
import { formatDuration, formatCallTime } from "@/lib/call-format";
import { cn } from "@/lib/utils";

type Props = {
  sessions?: CallSession[];
  leadId?: string;
};

export default function CallSessionList({
  sessions = [],
}: Props) {
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  const toggleExpand = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="py-8 gap-0 flex flex-col items-center justify-center px-6 text-center bg-white shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Phone className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Call Sessions Recorded</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          Calls placed by or to the customer through Twilio will be logged here with complete AI speech transcripts.
        </p>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
      {sessions.map((session, index) => {
        const isExpanded = Boolean(expandedSessions[session.callSessionId]);
        const turns = session.turns ?? [];
        const isCompleted = session.status === "completed";

        return (
          <div key={session.callSessionId || index} className="group">
            {/* Accordion Row Header */}
            <div
              onClick={() => turns.length > 0 && toggleExpand(session.callSessionId)}
              className={cn(
                "p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors",
                isExpanded ? "bg-slate-50/70" : "hover:bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs transition-colors",
                    isCompleted
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  )}
                >
                  <PhoneCall className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 tracking-tight">
                      {session.fromNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium capitalize px-2 py-0.2 rounded-full",
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      )}
                    >
                      {session.status}
                    </Badge>

                    {session.isHandedToSales && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 rounded-full"
                      >
                        Handed to Sales
                      </Badge>
                    )}
                  </div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {formatCallTime(session.startedAt)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Duration: {formatDuration(session.durationSeconds)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{session.turnCount || turns.length} turns</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center shrink-0 self-end sm:self-center pr-1">
                {turns.length > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 group-hover:text-slate-700 transition-colors">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180 text-slate-900"
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Accordion Expanded Dialogue Content */}
            {isExpanded && turns.length > 0 && (
              <div className="bg-slate-50/60 p-4 sm:p-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                    Call Dialogue ({turns.length} turns)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click header to collapse
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {turns.map((turn, tIdx) => {
                    const isAi = turn.role === "ai";
                    return (
                      <div
                        key={turn.turnId || tIdx}
                        className={`flex gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
                      >
                        {isAi && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs shadow-2xs">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] rounded-lg p-3 text-xs shadow-2xs ${
                            isAi
                              ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                              : "bg-blue-600 text-white rounded-tr-xs"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-3 text-[10px] opacity-75">
                            <span className="font-semibold uppercase tracking-wide">
                              {isAi ? "AI Voice Assistant" : "Customer"}
                            </span>
                            <span>{formatCallTime(turn.createdAt)}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{turn.transcript}</p>
                        </div>

                        {!isAi && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs shadow-2xs">
                            <User className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
