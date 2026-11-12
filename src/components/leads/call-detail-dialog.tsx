import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Bot, User, Clock } from "lucide-react";
import { useCallDetailQuery } from "@/modules/leads/leads.hooks";
import { formatDuration, formatCallTime } from "@/lib/call-format";

type Props = {
  callSessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CallDetailDialog({
  callSessionId,
  open,
  onOpenChange,
}: Props) {
  const { data: response, isLoading, isError } = useCallDetailQuery(
    open && callSessionId ? callSessionId : undefined,
  );

  const detail = response?.data;
  const call = detail?.call;
  const turns = detail?.turns ?? [];
  const isCompleted = call?.status === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
              <Phone className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Call Session Dialogue
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {callSessionId ? `Session ID: ${callSessionId}` : "Detailed call review"}
              </DialogDescription>
            </div>
          </div>

          {call && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-600">
              <Badge
                variant="outline"
                className={`text-[11px] capitalize ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {call.status}
              </Badge>

              {call.isHandedToSales && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
                >
                  Handed to Sales
                </Badge>
              )}

              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-700">{call.fromNumber}</span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {formatDuration(call.durationSeconds)}
              </span>
              <span className="text-slate-400">•</span>
              <span>{formatCallTime(call.startedAt)}</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm">Loading call transcripts...</p>
            </div>
          ) : isError || !call ? (
            <div className="py-12 text-center text-sm text-red-600">
              Unable to load call session details.
            </div>
          ) : turns.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No speech turns recorded in this session.
            </div>
          ) : (
            <div className="space-y-3">
              {turns.map((turn, idx) => {
                const isAi = turn.role === "ai";
                return (
                  <div
                    key={turn.turnId || idx}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
