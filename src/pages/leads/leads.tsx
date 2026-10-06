import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  UserPlus,
  Download,
  MessageSquare,
  Eye,
  UserCheck,
  FileText,
  Redo,
  TrendingUp,
  Search,
  Edit,
  AlertCircle,
  Archive,
  RotateCcw,
} from "lucide-react";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
// import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import EscalateLeadDialog from "@/components/leads/escalate-lead-dialog";
import ArchiveLeadDialog from "@/components/leads/archive-lead-dialog";
import RestoreLeadDialog from "@/components/leads/restore-lead-dialog";
import Pagination from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import MoveToOrdersDialog from "@/components/leads/move-to-orders-dialog";
import LeadLifecycleStatusSelect from "@/components/leads/lead-lifecycle-status-select";
import BuildingTypeSelector from "@/components/building-type-selector";
import BusinessUnitSelector from "@/components/business-unit-selector";
import { formatBusinessUnit } from "@/modules/leads/business-unit";
import SuccessDialog from "@/components/success-dialog";
import ProgressDots from "@/components/ui/progress-dots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsQuery, useArchivedLeadsQuery } from "@/modules/leads/leads.hooks";
import {
  exportLeadsProvider,
} from "@/modules/leads/leads.api";
import { useLeadsStatsQuery } from "@/lib/metrics";
import {
  canCreatePO,
  formatLifecycleStatus,
  getStatusBadgeClassName,
  getLeadProjectName,
  type LeadStatusType,
} from "@/modules/leads/leads.utils";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const createCsvFilename = () => {
  const date = new Date().toISOString().slice(0, 10);

  return `leads-export-${date}.csv`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatFollowUpDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export default function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "archived" ? "archived" : "active";
  const isArchived = activeTab === "archived";

  const [period, setPeriod] = useState<Period>();
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [buildingType, setBuildingType] = useState("all");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isFilterApplied = isArchived
    ? searchQuery !== "" || businessUnit !== "all"
    : searchQuery !== "" ||
      buildingType !== "all" ||
      businessUnit !== "all" ||
      projectValue !== "all" ||
      statusFilter !== "all" ||
      startDate !== undefined ||
      endDate !== undefined;

  const handleClearFilters = () => {
    setSearchQuery("");
    setBuildingType("all");
    setBusinessUnit("all");
    setProjectValue("all");
    setStatusFilter("all");
    setPeriod(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "active" | "archived") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "archived") {
        next.set("tab", "archived");
      } else {
        next.delete("tab");
      }
      return next;
    });
    setCurrentPage(1);
    setSelectedLeads([]);
  };

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const [exporting, setExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  const { data: metrics, isPending } = useLeadsStatsQuery();
  const loading = isPending && !metrics;

  const { data: leadsResponse, isPending: leadsLoading } = useLeadsQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: !isArchived && searchQuery ? searchQuery.trim() : undefined,
    buildingType: buildingType === "all" ? undefined : buildingType,
    businessUnit: businessUnit === "all" ? undefined : businessUnit,
    lifecycleStatus: statusFilter === "all" ? undefined : statusFilter,
    startDate,
    endDate,
  });

  const { data: archivedResponse, isPending: archivedLoading } = useArchivedLeadsQuery(
    {
      page: isArchived ? currentPage : 1,
      limit: isArchived ? rowsPerPage : 1,
      search: isArchived && searchQuery ? searchQuery.trim() : undefined,
      businessUnit: isArchived && businessUnit !== "all" ? businessUnit : undefined,
    },
  );

  const activeLeads = useMemo(
    () => leadsResponse?.data.leads ?? [],
    [leadsResponse?.data.leads],
  );
  const archivedLeads = useMemo(
    () => archivedResponse?.data.leads ?? [],
    [archivedResponse?.data.leads],
  );

  const leads = isArchived ? archivedLeads : activeLeads;
  const totalItems = isArchived
    ? (archivedResponse?.data.total ?? 0)
    : (leadsResponse?.data.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const isTableLoading = isArchived ? archivedLoading : leadsLoading;

  useEffect(() => {
    setSelectedLeads([]);
  }, [
    currentPage,
    rowsPerPage,
    buildingType,
    businessUnit,
    projectValue,
    statusFilter,
    searchQuery,
    startDate,
    endDate,
    activeTab,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, id]);
    } else {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const csv = await exportLeadsProvider({
        search: searchQuery ? searchQuery.trim() : undefined,
        buildingType: buildingType === "all" ? undefined : buildingType,
        businessUnit: businessUnit === "all" ? undefined : businessUnit,
        lifecycleStatus: statusFilter === "all" ? undefined : statusFilter,
        startDate,
        endDate,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = createCsvFilename();
      link.click();
      URL.revokeObjectURL(url);

      setShowExportSuccess(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod, range) => {
          setPeriod(newPeriod);
          setStartDate(range.startDate?.toISOString());
          setEndDate(range.endDate?.toISOString());
          setCurrentPage(1);
        }}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header with Top Tab List */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 font-semibold">
              {isArchived ? "Archived Leads" : "Assigned Leads"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isArchived
                ? "Review non-viable leads removed from the active pipeline and restore them if needed."
                : "Manage your assigned leads and track their progress."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg w-fit self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
                !isArchived
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              Active Leads
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("archived")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                isArchived
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Archive className="h-4 w-4" />
              <span>Archived Leads</span>
              {archivedResponse?.data?.total !== undefined && archivedResponse.data.total > 0 && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                    isArchived
                      ? "bg-amber-100 text-amber-800 font-semibold"
                      : "bg-gray-200 text-gray-700",
                  )}
                >
                  {archivedResponse.data.total}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Leads in Pipeline"
            value={metrics?.totalLeads ?? 0}
            color="bg-blue-600"
            icon={<UserPlus className="h-5 w-5 text-blue-600" />}
            loading={loading}
          />
          <StatCard
            title="Leads Closed"
            value={metrics?.leadsClosed ?? 0}
            color="bg-green-500"
            icon={<UserCheck className="h-5 w-5 text-green-500" />}
            loading={loading}
          />
          <StatCard
            title="Follow-ups Pending"
            value={metrics?.followUpPending ?? 0}
            color="bg-yellow-500"
            icon={<FileText className="h-5 w-5 text-yellow-500" />}
            loading={loading}
          />
          <StatCard
            title="AI Escalations"
            value={metrics?.escalationsPending ?? 0}
            color="bg-orange-400"
            icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
            loading={loading}
          />
        </div>

        {/* Action Buttons and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {!isArchived && (
              <>
                <Link to="/leads/add" className="inline-block">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="" />
                    Add Lead
                  </Button>
                </Link>

                <ImportLeadsDialog />

                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? "Exporting..." : "Export Data"}
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative w-full lg:w-54">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isArchived ? "Search archived leads..." : "Search leads..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white"
              />
            </div>

            {!isArchived && (
              <>
                <BuildingTypeSelector
                  value={buildingType}
                  onChange={(val) => {
                    setBuildingType(val);
                    setCurrentPage(1);
                  }}
                  includeAll
                  allLabel="All"
                  placeholder="Building types"
                  triggerClassName="w-full sm:w-40 bg-white"
                />

                <BusinessUnitSelector
                  value={businessUnit}
                  onChange={(val) => {
                    setBusinessUnit(val);
                    setCurrentPage(1);
                  }}
                  includeAll
                  allLabel="All Business Units"
                  includeNone
                  noneLabel="Not set"
                  placeholder="Business Unit"
                  triggerClassName="w-full sm:w-40 bg-white"
                />

                <Select
                  value={projectValue}
                  onValueChange={(val) => {
                    setProjectValue(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="Project value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="small">
                      Small projects (&lt;$50,000)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium ($50,000 - $200,000)
                    </SelectItem>
                    <SelectItem value="large">Large (&gt;$200,000)</SelectItem>
                  </SelectContent>
                </Select>

                <LeadLifecycleStatusSelect
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  triggerClassName="w-full sm:w-40 bg-white"
                  placeholder="All Status"
                  allLabel="All Status"
                />
              </>
            )}

            {isFilterApplied && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedLeads.length === leads.length &&
                        leads.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUSTOMER / PROJECT
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROGRESS
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROJECT VALUE
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArchived ? "ARCHIVE INFO" : "NEXT FOLLOW UP"}
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CHAT
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTableLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell className="">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead._id)}
                          onChange={(e) =>
                            handleSelectLead(lead._id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>

                      <TableCell className="">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {lead.customerId?.firstName ?? ""}
                          </span>
                          <span className="text-sm text-gray-700">
                            {getLeadProjectName(lead)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lead.jobId}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal px-1.5 py-0 border-slate-300 text-slate-700 bg-slate-50"
                            >
                              {lead.businessUnitLabel || (lead.businessUnit ? formatBusinessUnit(lead.businessUnit) : "Not set")}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              · {lead.buildingType || "-"} · {lead.location || "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <ProgressDots rawStatus={lead.lifecycleStatus} />
                      </TableCell>

                      <TableCell className="">
                        <Badge
                          className={`${getStatusBadgeClassName(lead.lifecycleStatus)} rounded-full px-4 py-1 text-sm`}
                          variant="secondary"
                        >
                          {formatLifecycleStatus(lead.lifecycleStatus as LeadStatusType)}
                        </Badge>
                      </TableCell>

                      <TableCell className="">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(lead.quoteValue)}
                        </span>
                      </TableCell>

                      <TableCell className="text-sm text-gray-600">
                        {isArchived ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {formatFollowUpDate(lead.archivedAt)}
                            </span>
                            {lead.archiveReason && (
                              <span
                                className="text-xs text-gray-500 italic truncate max-w-40 block"
                                title={lead.archiveReason}
                              >
                                {lead.archiveReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          formatFollowUpDate(lead.nextFollowUp?.followUpDate)
                        )}
                      </TableCell>

                      <TableCell className="">
                        <Link to={`/leads/${lead._id}?tab=chat`}>
                          <button className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">Chat</span>
                            {lead.isOnline ? (
                              <span
                                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"
                                title="Customer active in chat"
                              />
                            ) : lead.customerId?.isOnline ? (
                              <span
                                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"
                                title="Customer online on site"
                              />
                            ) : null}
                          </button>
                        </Link>
                      </TableCell>

                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <Link to={`/leads/${lead._id}`}>
                            <Button variant="ghost" size="icon" title="View Lead">
                              <Eye className="text-purple-600 stroke-2" />
                            </Button>
                          </Link>

                          <Link to={`/leads/${lead._id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit Lead">
                              <Edit className="text-green-600 stroke-2" />
                            </Button>
                          </Link>

                          {!isArchived && !lead.isRaisedToPO && canCreatePO(lead.lifecycleStatus as LeadStatusType) && (
                            <MoveToOrdersDialog
                              leadId={lead._id}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Redo className="text-red-500" />
                                </Button>
                              }
                            />
                          )}

                          <EscalateLeadDialog
                            leadId={lead._id}
                            leadName={getLeadProjectName(lead)}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <AlertCircle className="text-gray-500" />
                              </Button>
                            }
                          />

                          {isArchived ? (
                            <RestoreLeadDialog
                              leadId={lead._id}
                              leadName={getLeadProjectName(lead)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Restore Lead"
                                >
                                  <RotateCcw className="text-blue-600 stroke-2" />
                                </Button>
                              }
                            />
                          ) : (
                            <ArchiveLeadDialog
                              leadId={lead._id}
                              leadName={getLeadProjectName(lead)}
                              jobId={lead.jobId}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Archive Lead"
                                >
                                  <Archive className="text-gray-500 hover:text-red-600 stroke-2" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">
                          {isArchived ? "No archived leads found" : "No leads found"}
                        </p>
                        <p className="text-sm">
                          {isArchived
                            ? "Non-viable leads archived from the pipeline will appear here."
                            : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      </div>
      <SuccessDialog
        open={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export completed"
        okLabel="Great"
      />
    </div>
  );
}
