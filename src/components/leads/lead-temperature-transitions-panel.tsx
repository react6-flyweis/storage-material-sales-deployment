import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  X,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  useTemperatureTransitionSummaryQuery,
  useTemperatureTransitionsQuery,
} from "@/modules/followups/followups.hooks";
import type { LeadTemperature } from "@/modules/followups/followups.api";
import Pagination from "@/components/Pagination";

interface LeadTemperatureTransitionsPanelProps {
  startDate?: string;
  endDate?: string;
}

type TransitionKey =
  | "hot_to_warm"
  | "hot_to_cold"
  | "warm_to_hot"
  | "warm_to_cold"
  | "cold_to_hot"
  | "cold_to_warm";

const TRANSITION_CONFIG: {
  key: TransitionKey;
  from: LeadTemperature;
  to: LeadTemperature;
  label: string;
  type: "upgrade" | "downgrade";
}[] = [
  {
    key: "warm_to_hot",
    from: "warm",
    to: "hot",
    label: "Warm → Hot",
    type: "upgrade",
  },
  {
    key: "cold_to_hot",
    from: "cold",
    to: "hot",
    label: "Cold → Hot",
    type: "upgrade",
  },
  {
    key: "cold_to_warm",
    from: "cold",
    to: "warm",
    label: "Cold → Warm",
    type: "upgrade",
  },
  {
    key: "hot_to_warm",
    from: "hot",
    to: "warm",
    label: "Hot → Warm",
    type: "downgrade",
  },
  {
    key: "hot_to_cold",
    from: "hot",
    to: "cold",
    label: "Hot → Cold",
    type: "downgrade",
  },
  {
    key: "warm_to_cold",
    from: "warm",
    to: "cold",
    label: "Warm → Cold",
    type: "downgrade",
  },
];

export default function LeadTemperatureTransitionsPanel({
  startDate,
  endDate,
}: LeadTemperatureTransitionsPanelProps) {
  const [selectedKey, setSelectedKey] = useState<TransitionKey | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const isFilterActive = Boolean(startDate || endDate);

  const { data: summaryResponse, isLoading: isSummaryLoading } =
    useTemperatureTransitionSummaryQuery(startDate, endDate, isFilterActive);

  const transitions = summaryResponse?.data?.transitions || {
    hot_to_warm: 0,
    hot_to_cold: 0,
    warm_to_hot: 0,
    warm_to_cold: 0,
    cold_to_hot: 0,
    cold_to_warm: 0,
  };

  const totals = summaryResponse?.data?.totals;

  const activeConfig = TRANSITION_CONFIG.find(
    (c) => c.key === selectedKey && (transitions[c.key] ?? 0) > 0
  );

  const { data: drilldownResponse, isLoading: isDrilldownLoading } =
    useTemperatureTransitionsQuery(
      {
        from: activeConfig?.from,
        to: activeConfig?.to,
        startDate,
        endDate,
        page,
        limit,
      },
      Boolean(activeConfig)
    );

  const drilldownRows = drilldownResponse?.data?.rows || [];
  const drilldownTotal =
    drilldownResponse?.data?.pagination?.total || drilldownRows.length;

  if (!isFilterActive) {
    return null;
  }

  const handlePillClick = (key: TransitionKey, count: number) => {
    if (count <= 0) return;
    if (selectedKey === key) {
      setSelectedKey(null);
    } else {
      setSelectedKey(key);
      setPage(1);
    }
  };

  const formatSource = (source?: string) => {
    switch (source) {
      case "manual_override":
        return "Manual Override";
      case "ai_scoring":
        return "AI Scoring";
      case "system":
        return "System";
      default:
        return source || "Unknown";
    }
  };

  const getTempBadge = (temp: LeadTemperature) => {
    switch (temp) {
      case "hot":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium px-2 py-0.5">
            Hot
          </Badge>
        );
      case "warm":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[11px] font-medium px-2 py-0.5">
            Warm
          </Badge>
        );
      case "cold":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5">
            Cold
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
      {/* Pills Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Temperature Movement
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Lead transition metrics for the selected date range
            {totals && ` (${totals.totalTransitions ?? 0} transitions across ${totals.leadTouchedCount ?? 0} leads)`}
          </p>
        </div>
        {selectedKey && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedKey(null)}
            className="h-8 px-2.5 text-xs text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Hide drill down
          </Button>
        )}
      </div>

      {/* Pills Strip */}
      {isSummaryLoading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Calculating transitions for date range...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {TRANSITION_CONFIG.map((item) => {
            const count = transitions[item.key] ?? 0;
            const isSelected = selectedKey === item.key;
            const isUpgrade = item.type === "upgrade";
            const isDisabled = count <= 0;

            return (
              <button
                key={item.key}
                type="button"
                disabled={isDisabled}
                onClick={() => handlePillClick(item.key, count)}
                title={
                  isDisabled
                    ? "No transitions recorded for this period"
                    : `View drilldown for ${item.label}`
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : isUpgrade
                      ? "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {isUpgrade ? (
                  <TrendingUp
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-white" : "text-green-600"
                    }`}
                  />
                ) : (
                  <TrendingDown
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-white" : "text-gray-500"
                    }`}
                  />
                )}
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : isUpgrade
                        ? "bg-green-200/70 text-green-900"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Drill Down Table (Shown only when a pill is selected) */}
      {selectedKey && activeConfig && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>Transition Drill Down:</span>
              <span className="text-blue-600 font-semibold">{activeConfig.label}</span>
              <span className="text-gray-400 font-normal">
                ({drilldownTotal} {drilldownTotal === 1 ? "record" : "records"})
              </span>
            </h4>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-[#f8fafc]">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Lead ID
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Transition
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Source
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Score Change
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Reason
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-700 uppercase h-9 px-4">
                    Changed At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDrilldownLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-xs text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading transitions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : drilldownRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-xs text-gray-500">
                      No transition events found for {activeConfig.label} in this date range.
                    </TableCell>
                  </TableRow>
                ) : (
                  drilldownRows.map((row) => (
                    <TableRow key={row._id} className="hover:bg-gray-50/70 text-xs">
                      <TableCell className="font-mono text-gray-700 px-4 py-2.5">
                        {row.leadId ? `${row.leadId.slice(0, 10)}...` : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {getTempBadge(row.fromTemperature)}
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          {getTempBadge(row.toTemperature)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-normal capitalize bg-slate-100 text-slate-700"
                        >
                          {formatSource(row.source)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {row.metadata?.scoreBefore !== undefined &&
                        row.metadata?.scoreAfter !== undefined ? (
                          <span className="text-gray-900 font-semibold">
                            {row.metadata.scoreBefore} → {row.metadata.scoreAfter}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-gray-600 max-w-xs truncate">
                        {row.metadata?.reason || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-gray-500">
                        {row.changedAt
                          ? format(new Date(row.changedAt), "MM/dd/yyyy hh:mm a")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {drilldownTotal > limit && (
            <div className="pt-1">
              <Pagination
                currentPage={page}
                totalItems={drilldownTotal}
                rowsPerPage={limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
