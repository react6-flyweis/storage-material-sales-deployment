import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DateRangeFilter from "@/components/ui/date-range-filter";
import type { DateRange } from "react-day-picker";
import {
  useLeadScoringQuery,
  useUpdateLeadTemperatureMutation,
} from "@/modules/leads/leads.hooks";
import {
  useFollowUpActivitySummaryQuery,
  useTemperatureTransitionSummaryQuery,
} from "@/modules/followups/followups.hooks";
import type { FollowUpKind } from "@/modules/followups/followups.api";
import { Loader2, History, RotateCcw } from "lucide-react";
import Pagination from "@/components/Pagination";
import { format } from "date-fns";
import { toast } from "sonner";
import LeadFollowUpDetailDialog from "@/components/leads/lead-followup-detail-dialog";

interface LeadRow {
  id: string;
  customerName: string;
  leadId: string;
  projectName?: string;
  location: string;
  progress: number;
  lifecycleStatus: string;
  quoteValue: number;
  score: number;
  temperature: string;
  scoreState?: string;
  lastActivity: string;
  activityType?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function LeadScoring() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("");
  const [activity, setActivity] = useState("all");
  const [scoreState, setScoreState] = useState("all");

  // History detail dialog state
  const [selectedDetailLead, setSelectedDetailLead] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const isDateRangeSelected = Boolean(dateFrom || dateTo);

  // Map Activity dropdown to API kind: "manual" vs "automatic" vs "all"
  const followUpKind: FollowUpKind | "all" =
    activity === "auto_activity"
      ? "automatic"
      : activity === "user_activity"
        ? "manual"
        : "all";

  const debouncedClient = useDebounce(client, 300);
  const isSearching = client !== debouncedClient;

  // 1. Follow-Up Activity Query (New Contract)
  const {
    data: activityResponse,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
    isError: isActivityError,
  } = useFollowUpActivitySummaryQuery({
    kind: followUpKind,
    startDate: dateFrom,
    endDate: dateTo,
    status: status !== "all" ? status : undefined,
    temperature: status !== "all" ? status : undefined,
    search: debouncedClient,
    page,
    limit,
  });

  // 2. Legacy Scoring Query (Safe fallback if activity endpoint is in progress)
  const {
    data: legacyScoringData,
    isLoading: isLegacyLoading,
    isFetching: isLegacyFetching,
  } = useLeadScoringQuery(page, limit, {
    startDate: dateFrom,
    endDate: dateTo,
    status,
    client: debouncedClient,
  });

  // 3. Summary API to fetch transition counts for the Score State dropdown
  const { data: transitionSummaryResponse } =
    useTemperatureTransitionSummaryQuery(dateFrom, dateTo, isDateRangeSelected);
  const transitionSummary = transitionSummaryResponse?.data;
  const transitions = transitionSummary?.transitions;

  const updateTemperatureMutation = useUpdateLeadTemperatureMutation();

  const updateLeadScore = (id: string, newScore: string) => {
    updateTemperatureMutation.mutate(
      { leadId: id, temperature: newScore.toLowerCase() },
      {
        onSuccess: () => toast.success("Lead status updated successfully!"),
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message || "Failed to update lead status",
          ),
      },
    );
  };

  const getScoreBadgeClass = (score: string) => {
    switch (score?.toLowerCase()) {
      case "hot":
        return "bg-[#ef4444] hover:bg-[#dc2626] text-white border-0 font-medium";
      case "warm":
        return "bg-[#f59e0b] hover:bg-[#d97706] text-white border-0 font-medium";
      case "cold":
        return "bg-[#10b981] hover:bg-[#059669] text-white border-0 font-medium";
      default:
        return "bg-gray-500 text-white border-0 font-medium";
    }
  };

  const getStatusBadgeClass = (statusStr: string) => {
    const s = statusStr?.toLowerCase() || "";
    if (s.includes("proposal")) {
      return "bg-[#f3e8ff] text-[#9333ea] hover:bg-[#ede9fe] border-0 rounded-full px-3 py-1 text-xs font-normal";
    }
    if (s.includes("quotation")) {
      return "bg-[#ffedd5] text-[#ea580c] hover:bg-[#fed7aa] border-0 rounded-full px-3 py-1 text-xs font-normal";
    }
    if (s.includes("initial")) {
      return "bg-[#e0f2fe] text-[#0284c7] hover:bg-[#bae6fd] border-0 rounded-full px-3 py-1 text-xs font-normal";
    }
    return "bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-normal";
  };

  const renderProgressDots = (progress: number) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < progress ? "bg-[#10b981]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium text-blue-600">
          Step {progress}/7
        </span>
      </div>
    );
  };

  const formatLastActivity = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return format(d, "MM/dd/yyyy hh:mm a");
    } catch {
      return dateStr;
    }
  };

  const hasActivityData =
    !isActivityError &&
    activityResponse?.success &&
    Array.isArray(activityResponse?.data?.leads);

  const isDataLoading =
    isSearching ||
    (hasActivityData
      ? isActivityLoading || isActivityFetching
      : isLegacyLoading || isLegacyFetching || isActivityLoading || isActivityFetching);

  // Map leads: prefer Follow-Up Activity API with safe fallbacks
  const baseLeads = useMemo<LeadRow[]>(() => {
    if (hasActivityData) {
      return (activityResponse?.data?.leads || []).map((item, idx) => {
        const lead = item.lead;
        const temp = (
          lead.leadScoring?.temperature ||
          lead.temperature ||
          "cold"
        ).toLowerCase();

        return {
          id: lead._id || String(idx),
          customerName: lead.customerName || lead.projectName || "N/A",
          leadId:
            lead.jobId || (lead._id ? `${lead._id.slice(0, 8)}...` : "N/A"),
          projectName: lead.projectName,
          location: lead.location || "N/A",
          progress: temp === "hot" ? 4 : temp === "warm" ? 3 : 2,
          lifecycleStatus: lead.lifecycleStatus || "initial_contact",
          quoteValue: lead.quoteValue ?? 0,
          score: lead.leadScoring?.score ?? lead.score ?? 50,
          temperature: temp,
          scoreState: "-",
          lastActivity: formatLastActivity(item.lastFollowUpAt),
          activityType: followUpKind,
        };
      });
    }

    // Fallback to legacy scoring data if activity API is not yet active
    const apiLeads = legacyScoringData?.data?.leads || [];
    return apiLeads.map((l: any, idx: number) => {
      const temp = (l.temperature || "warm").toLowerCase();
      return {
        id: l.leadId || l._id || String(idx),
        customerName: l.customerName || "N/A",
        leadId: l.projectId || l.leadId || "N/A",
        projectName: l.projectName,
        location: l.location || "N/A",
        progress: l.progress ?? (temp === "hot" ? 4 : temp === "warm" ? 3 : 2),
        lifecycleStatus: l.lifecycleStatus || l.status || "Pending",
        quoteValue: l.quoteValue ?? 0,
        score: l.score ?? 50,
        temperature: temp,
        scoreState:
          l.scoreState || l.transition || l.temperatureTransition || "-",
        lastActivity: formatLastActivity(l.updatedAt || l.lastActivity),
        activityType: l.activityType,
      };
    });
  }, [hasActivityData, activityResponse, legacyScoringData, followUpKind]);

  // Client-side filtering matching the filters row
  const filteredLeads = useMemo(() => {
    return baseLeads.filter((item) => {
      // Filter by Status (temperature)
      if (
        status !== "all" &&
        item.temperature.toLowerCase() !== status.toLowerCase()
      ) {
        return false;
      }
      // Filter by Client Search
      if (client.trim()) {
        const q = client.toLowerCase();
        const match =
          item.customerName.toLowerCase().includes(q) ||
          item.leadId.toLowerCase().includes(q) ||
          (item.projectName && item.projectName.toLowerCase().includes(q)) ||
          item.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Filter by Activity
      if (activity && activity !== "all") {
        if (activity === "user_activity" && item.activityType !== "manual") {
          return false;
        }
        if (activity === "auto_activity" && item.activityType !== "automatic") {
          return false;
        }
      }
      // Filter by Score State (when date range selected)
      if (isDateRangeSelected && scoreState !== "all") {
        if (item.scoreState !== scoreState) {
          return false;
        }
      }
      return true;
    });
  }, [baseLeads, status, client, activity, scoreState, isDateRangeSelected]);

  const totalLeadsCount = hasActivityData
    ? (activityResponse?.data?.pagination?.totalLeads ?? filteredLeads.length)
    : (legacyScoringData?.data?.total ?? filteredLeads.length);

  const hasActiveFilters = Boolean(
    dateFrom ||
    dateTo ||
    status !== "all" ||
    client.trim() ||
    activity !== "all" ||
    scoreState !== "all"
  );

  const handleClearFilters = () => {
    setDateRange(undefined);
    setDateFrom("");
    setDateTo("");
    setStatus("all");
    setClient("");
    setActivity("all");
    setScoreState("all");
    setPage(1);
  };

  return (
    <div className="">
      {/* Top Banner Header */}
      <div className="bg-teal-400 px-6 py-4 text-white flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lead Scoring</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Lead Scoring & Auto Follow-up
            </h1>
            {isDateRangeSelected && (
              <span className="text-gray-600 font-semibold text-sm sm:text-base flex items-center gap-2">
                Total Leads - {totalLeadsCount}
                {isDataLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-6 rounded-lg space-y-4 shadow">
          {hasActiveFilters && (
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 px-2.5 text-xs text-gray-500 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <DateRangeFilter
                value={dateRange}
                mode="dialog"
                past={true}
                future={false}
                onChange={(d) => {
                  setDateRange(d);
                  setDateFrom(d?.from ? d.from.toISOString().slice(0, 10) : "");
                  setDateTo(d?.to ? d.to.toISOString().slice(0, 10) : "");
                }}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white min-w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Search */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Client
              </label>
              <Input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Search client..."
                className="bg-white"
              />
            </div>

            {/* Activity Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Activity
              </label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="bg-white min-w-40">
                  <SelectValue placeholder="All Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                  <SelectItem value="auto_activity">Auto Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conditional Score State Filter (Placed below the filters card) */}
        {isDateRangeSelected && (
          <div className="flex flex-col gap-1.5 w-full sm:w-60 animate-in fade-in-50 duration-200">
            <label className="text-xs font-semibold text-gray-700">
              Score State
            </label>
            <Select value={scoreState} onValueChange={setScoreState}>
              <SelectTrigger className="bg-white min-w-48 shadow-sm border border-gray-200">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All
                  {transitionSummary?.totals?.totalTransitions !== undefined
                    ? ` (${transitionSummary.totals.totalTransitions})`
                    : ""}
                </SelectItem>
                <SelectItem value="Cold → Warm">
                  Cold → Warm
                  {transitions?.cold_to_warm !== undefined
                    ? ` (${transitions.cold_to_warm})`
                    : ""}
                </SelectItem>
                <SelectItem value="Cold → Hot">
                  Cold → Hot
                  {transitions?.cold_to_hot !== undefined
                    ? ` (${transitions.cold_to_hot})`
                    : ""}
                </SelectItem>
                <SelectItem value="Warm → Cold">
                  Warm → Cold
                  {transitions?.warm_to_cold !== undefined
                    ? ` (${transitions.warm_to_cold})`
                    : ""}
                </SelectItem>
                <SelectItem value="Warm → Hot">
                  Warm → Hot
                  {transitions?.warm_to_hot !== undefined
                    ? ` (${transitions.warm_to_hot})`
                    : ""}
                </SelectItem>
                <SelectItem value="Hot → Cold">
                  Hot → Cold
                  {transitions?.hot_to_cold !== undefined
                    ? ` (${transitions.hot_to_cold})`
                    : ""}
                </SelectItem>
                <SelectItem value="Hot → Warm">
                  Hot → Warm
                  {transitions?.hot_to_warm !== undefined
                    ? ` (${transitions.hot_to_warm})`
                    : ""}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  LEAD INFO
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  PROGRESS
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  STATUS
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  QUOTE VALUE
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  SCORE
                </TableHead>
                {/* Score State Column (Shown only when date range is selected) */}
                {isDateRangeSelected && (
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    SCORE STATE
                  </TableHead>
                )}
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  LAST ACTIVITY
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDataLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isDateRangeSelected ? 8 : 7}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      <span className="text-xs font-medium text-gray-500">
                        Updating leads...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isDateRangeSelected ? 8 : 7}
                    className="h-28 text-center text-gray-500 text-sm"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const displayScore =
                    lead.temperature.charAt(0).toUpperCase() +
                    lead.temperature.slice(1).toLowerCase();

                  return (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-[13px] text-gray-900">
                            {lead.customerName}
                          </div>
                          {lead.projectName &&
                            lead.projectName !== lead.customerName && (
                              <div className="text-[12px] text-gray-500 mt-0.5">
                                {lead.projectName}
                              </div>
                            )}
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {lead.leadId}
                          </div>
                          <div className="text-[12px] text-gray-400 mt-0.5">
                            {lead.location || "N/A"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {renderProgressDots(lead.progress)}
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge
                          className={getStatusBadgeClass(lead.lifecycleStatus)}
                        >
                          {lead.lifecycleStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 font-bold text-[13px] text-gray-900">
                        ${lead.quoteValue?.toLocaleString() || "0"}
                      </TableCell>

                      <TableCell className="py-4">
                        <Select
                          value={displayScore}
                          onValueChange={(val) => updateLeadScore(lead.id, val)}
                        >
                          <SelectTrigger
                            className={`${getScoreBadgeClass(
                              displayScore,
                            )} rounded-full px-4 h-7 text-xs w-24 justify-between`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hot">Hot</SelectItem>
                            <SelectItem value="Warm">Warm</SelectItem>
                            <SelectItem value="Cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Score State Value: Empty ("-") if data is not available */}
                      {isDateRangeSelected && (
                        <TableCell className="py-4 text-xs font-medium text-gray-700">
                          {lead.scoreState || "-"}
                        </TableCell>
                      )}

                      <TableCell className="py-4 text-xs text-gray-600">
                        {lead.lastActivity}
                      </TableCell>

                      {/* History Action Button */}
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedDetailLead({
                              id: lead.id,
                              name: lead.projectName || lead.customerName,
                            })
                          }
                          className="h-7 px-2.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm cursor-pointer inline-flex items-center gap-1.5 rounded-md"
                        >
                          <History className="w-3.5 h-3.5 text-gray-500" />
                          <span>History</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {totalLeadsCount > limit ? (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                totalItems={totalLeadsCount}
                currentPage={page}
                rowsPerPage={limit}
                onPageChange={setPage}
                onRowsPerPageChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Lead Follow-Up History Detail Dialog */}
      <LeadFollowUpDetailDialog
        open={Boolean(selectedDetailLead)}
        onOpenChange={(open) => !open && setSelectedDetailLead(null)}
        leadId={selectedDetailLead?.id || null}
        leadName={selectedDetailLead?.name}
        kind={followUpKind === "all" ? "manual" : followUpKind}
      />
    </div>
  );
}
