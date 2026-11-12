import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Loader2, Phone, PhoneCall, ChevronLeft, ChevronRight } from "lucide-react";
import { useLeadCallsQuery, useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import { formatDuration, formatCallTime } from "@/lib/call-format";
import { cn } from "@/lib/utils";
import CallDetailDialog from "@/components/leads/call-detail-dialog";

export default function SingleLeadCalls() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedCallSessionId, setSelectedCallSessionId] = useState<string | null>(null);

  const { data: leadDetailResponse } = useLeadDetailQuery(leadId);
  const { data: callsResponse, isLoading } = useLeadCallsQuery(leadId, page, limit);

  const leadData = leadDetailResponse?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;
  const leadName = customer?.firstName || "Customer";
  const projectName = lead
    ? getLeadProjectName(lead as Record<string, unknown>, customer)
    : "Project Lead";

  const calls = callsResponse?.data?.calls ?? [];
  const totalCalls = callsResponse?.data?.total ?? 0;
  const totalPages = Math.ceil(totalCalls / limit) || 1;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3 shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Lead Voice Calls</h2>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <Card className="py-0 gap-0 rounded-xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Calls with {leadName}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 mt-1">
                  {projectName} {lead?.jobId ? `• ${lead.jobId}` : ""}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white text-slate-700">
                  {totalCalls} Total {totalCalls === 1 ? "Call" : "Calls"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-sm">Loading call history...</p>
              </div>
            ) : calls.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No Call Sessions</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  There are no voice call recordings or transcripts logged for this lead.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                {calls.map((call) => {
                  const isCompleted = call.status === "completed";
                  return (
                    <div
                      key={call.callSessionId}
                      onClick={() => setSelectedCallSessionId(call.callSessionId)}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
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
                            <h4 className="font-semibold text-sm text-slate-900 tracking-tight">
                              {call.fromNumber}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium capitalize px-2 py-0.2 rounded-full",
                                isCompleted
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-blue-200 bg-blue-50 text-blue-700"
                              )}
                            >
                              {call.status}
                            </Badge>

                            {call.isHandedToSales && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 rounded-full"
                              >
                                Handed to Sales
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{formatCallTime(call.startedAt)}</span>
                            {call.twilioCallSid ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {call.twilioCallSid}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {formatDuration(call.durationSeconds)}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-slate-300"
                        >
                          Review Turns
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Showing page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs gap-1"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CallDetailDialog
        callSessionId={selectedCallSessionId}
        open={Boolean(selectedCallSessionId)}
        onOpenChange={(open) => {
          if (!open) setSelectedCallSessionId(null);
        }}
      />
    </div>
  );
}
