import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import { useScoredLeadsQuery } from "@/modules/leads/leads.hooks";
import {
  formatLifecycleStatus,
  getLeadProgress,
} from "@/modules/leads/leads.utils";

interface LeadScore {
  id: string;
  name: string;
  leadId: string;
  location: string;
  progress: number;
  status: string;
  quoteValue: number;
  score: "Hot" | "Warm" | "Cold";
  lastActivity: string;
  lastActivityDate?: string; // ISO date string for filtering
}

interface LeadFilters {
  status: string;
  client: string;
  dateFrom: string;
  dateTo: string;
}

function filterLeadScores(
  leads: LeadScore[],
  overrides: Record<string, LeadScore["score"]>,
  filters: LeadFilters,
) {
  const normalizedClient = filters.client.trim().toLowerCase();

  return leads
    .map((lead) => ({
      ...lead,
      score: overrides[lead.id] ?? lead.score,
    }))
    .filter((lead) => {
      if (filters.status !== "all" && lead.status !== filters.status) {
        return false;
      }

      if (
        normalizedClient &&
        !(
          lead.name.toLowerCase().includes(normalizedClient) ||
          lead.leadId.toLowerCase().includes(normalizedClient) ||
          lead.location.toLowerCase().includes(normalizedClient)
        )
      ) {
        return false;
      }

      if (filters.dateFrom && lead.lastActivityDate) {
        const from = new Date(filters.dateFrom);
        const activityDate = new Date(lead.lastActivityDate);

        if (activityDate < from) {
          return false;
        }
      }

      if (filters.dateTo && lead.lastActivityDate) {
        const to = new Date(filters.dateTo);
        const activityDate = new Date(lead.lastActivityDate);

        if (activityDate > to) {
          return false;
        }
      }

      return true;
    });
}

function LeadScoringSkeleton() {
  return (
    <div className="px-6 py-8 space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-4 rounded-lg border border-slate-100 p-4"
        >
          <div className="h-4 rounded bg-slate-200 col-span-1" />
          <div className="h-4 rounded bg-slate-200 col-span-1" />
          <div className="h-4 rounded bg-slate-200 col-span-1" />
          <div className="h-4 rounded bg-slate-200 col-span-1" />
          <div className="h-8 rounded-full bg-slate-200 col-span-1 w-20" />
          <div className="h-4 rounded bg-slate-200 col-span-1" />
        </div>
      ))}
    </div>
  );
}

function LeadScoringEmptyState() {
  return (
    <div className="px-6 py-10 text-center space-y-3">
      <p className="text-lg font-medium">No scored leads found</p>
      <p className="text-sm text-slate-600">
        Try adjusting filters or refresh.
      </p>
    </div>
  );
}

// initial sample removed — data comes from API

export default function LeadScoring() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("");

  const [overrides, setOverrides] = useState<
    Record<string, LeadScore["score"]>
  >({});

  const updateLeadScore = (id: string, newScore: LeadScore["score"]) => {
    setOverrides((s) => ({ ...s, [id]: newScore }));
  };

  // fetch scored leads from API
  const {
    data: scoredResp,
    isLoading,
    isError,
    refetch,
  } = useScoredLeadsQuery(1, 20);

  const apiLeads: LeadScore[] = (scoredResp?.data?.leads || []).map((l) => {
    const scoreNum = l.leadScoring?.score ?? 0;

    const scoreLabel: LeadScore["score"] =
      scoreNum >= 70 ? "Hot" : scoreNum >= 40 ? "Warm" : "Cold";

    const lifecycle = l.lifecycleStatus || "";
    const statusLabel = formatLifecycleStatus(lifecycle || "initial_contact");
    const progress = getLeadProgress(lifecycle || "initial_contact");

    return {
      id: l._id,
      name: l.customerId?.firstName || "",
      leadId: l._id,
      location: l.projectName || "",
      progress,
      status: statusLabel as LeadScore["status"],
      quoteValue: l.quoteValue || 0,
      score: scoreLabel,
      lastActivity: `${scoreNum} pts`,
      lastActivityDate: undefined,
    };
  });

  const filteredLeads = useMemo(
    () =>
      filterLeadScores(apiLeads, overrides, {
        status,
        client,
        dateFrom,
        dateTo,
      }),
    [apiLeads, overrides, status, client, dateFrom, dateTo],
  );

  const getScoreBadgeClass = (score: string) => {
    switch (score) {
      case "Hot":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "Warm":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "Cold":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Proposal sent":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "Quotation Sent":
        return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderProgressDots = (progress: number) => {
    const normalizedProgress = Math.max(0, Math.min(4, progress));

    return (
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < normalizedProgress ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-teal-400  px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Lead Scoring</h1>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <h2 className="text-lg font-semibold mb-4">Lead Scoring</h2>
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg space-y-4 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="dd-mm-yyyy"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="dd-mm-yyyy"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Proposal sent">Proposal sent</SelectItem>
                  <SelectItem value="Quotation Sent">Quotation Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isError ? (
            <div className="px-6 py-10 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Unable to load scored leads.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : isLoading ? (
            <LeadScoringSkeleton />
          ) : filteredLeads.length === 0 ? (
            <LeadScoringEmptyState />
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Lead Info
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Progress
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Quote Value
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Score
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                    Last Activity
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.leadId}
                        </div>
                        <div className="text-sm text-gray-400">
                          {lead.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {renderProgressDots(lead.progress)}
                        <span className="text-sm text-gray-600">
                          Step {lead.progress}/7
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${lead.quoteValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.score}
                        onValueChange={(val) =>
                          updateLeadScore(lead.id, val as LeadScore["score"])
                        }
                      >
                        <SelectTrigger
                          className={`${getScoreBadgeClass(
                            lead.score,
                          )} rounded-full px-4`}
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
                    <TableCell className="text-gray-600">
                      {lead.lastActivity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
