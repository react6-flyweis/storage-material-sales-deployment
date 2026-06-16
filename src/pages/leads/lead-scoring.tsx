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
import LeadLifecycleStatusSelect from "@/components/leads/lead-lifecycle-status-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SuccessDialog from "@/components/success-dialog";
import {
  useScoredLeadsQuery,
  useUpdateLeadTemperatureMutation,
} from "@/modules/leads/leads.hooks";
import { getLeadProgress, getLeadProjectName } from "@/modules/leads/leads.utils";
import {
  getLeadLifecycleBadgeClassName,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lifecycle-statuses";

interface LeadScore {
  id: string;
  name: string;
  leadId: string;
  jobId: string;
  location: string;
  progress: number;
  lifecycleStatus: string;
  quoteValue: number;
  temperature: "hot" | "warm" | "cold";
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
  overrides: Record<string, LeadScore["temperature"]>,
  filters: LeadFilters,
) {
  const normalizedClient = filters.client.trim().toLowerCase();

  return leads
    .map((lead) => ({
      ...lead,
      temperature: overrides[lead.id] ?? lead.temperature,
    }))
    .filter((lead) => {
      if (
        filters.status !== "all" &&
        lead.lifecycleStatus !== filters.status
      ) {
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
  const [showSuccess, setShowSuccess] = useState(false);

  const isFilterApplied = dateFrom !== "" || dateTo !== "" || status !== "all" || client !== "";

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatus("all");
    setClient("");
  };

  const [overrides, setOverrides] = useState<
    Record<string, LeadScore["temperature"]>
  >({});

  const updateLeadTemperatureMutation = useUpdateLeadTemperatureMutation();

  const updateLeadTemperature = (
    id: string,
    newTemperature: LeadScore["temperature"],
  ) => {
    setOverrides((s) => ({ ...s, [id]: newTemperature }));

    updateLeadTemperatureMutation.mutate(
      { leadId: id, temperature: newTemperature },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onError: () => {
          setOverrides((current) => {
            const next = { ...current };
            delete next[id];
            return next;
          });
        },
      },
    );
  };

  // fetch scored leads from API
  const {
    data: scoredResp,
    isLoading,
    isError,
    refetch,
  } = useScoredLeadsQuery(1, 20, dateFrom, dateTo);

  const apiLeads: LeadScore[] = (scoredResp?.data?.leads || []).map((l) => {
    const scoreNum = l.score ?? 0;
    const temperatureValue: LeadScore["temperature"] = l.temperature ?? "cold";

    const lifecycle = l.lifecycleStatus || "initial_contact";
    const progress = getLeadProgress(lifecycle);

    return {
      id: l.leadId,
      name: getLeadProjectName(l),
      leadId: l.leadId,
      jobId: l.jobId,
      location: l.customerName || "",
      progress,
      lifecycleStatus: lifecycle,
      quoteValue: l.quoteValue || 0,
      temperature: temperatureValue,
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

  const getTemperatureBadgeClass = (temperature: string) => {
    switch (temperature) {
      case "hot":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "warm":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "cold":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatTemperatureLabel = (temperature: LeadScore["temperature"]) => {
    return temperature.charAt(0).toUpperCase() + temperature.slice(1);
  };

  const renderProgressDots = (progress: number) => {
    const normalizedProgress = Math.max(0, Math.min(4, progress));

    return (
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < normalizedProgress ? "bg-green-500" : "bg-gray-300"
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
              <LeadLifecycleStatusSelect
                value={status}
                onValueChange={setStatus}
                triggerClassName="bg-white w-full"
              />
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
          {isFilterApplied && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                Clear Filters
              </Button>
            </div>
          )}
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
                  <TableRow key={lead.leadId} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.jobId}
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
                      <Badge
                        className={getLeadLifecycleBadgeClassName(
                          lead.lifecycleStatus,
                        )}
                      >
                        {getLeadLifecycleStatusLabel(lead.lifecycleStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${lead.quoteValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.temperature}
                        onValueChange={(val) =>
                          updateLeadTemperature(
                            lead.id,
                            val as LeadScore["temperature"],
                          )
                        }
                        disabled={updateLeadTemperatureMutation.isPending}
                      >
                        <SelectTrigger
                          className={`${getTemperatureBadgeClass(
                            lead.temperature,
                          )} rounded-full px-4`}
                        >
                          <SelectValue
                            placeholder={formatTemperatureLabel(
                              lead.temperature,
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
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

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Lead scores updated"
      />
    </div>
  );
}
