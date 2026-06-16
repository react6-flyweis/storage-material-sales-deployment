import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
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
  // Pen,
  AlertCircle,
} from "lucide-react";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
// import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import EscalateLeadDialog from "@/components/leads/escalate-lead-dialog";
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
import SuccessDialog from "@/components/success-dialog";
import ProgressDots from "@/components/ui/progress-dots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
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

  const [period, setPeriod] = useState<Period>();
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [buildingType, setBuildingType] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isFilterApplied =
    searchQuery !== "" ||
    buildingType !== "all" ||
    projectValue !== "all" ||
    statusFilter !== "all" ||
    startDate !== undefined ||
    endDate !== undefined;

  const handleClearFilters = () => {
    setSearchQuery("");
    setBuildingType("all");
    setProjectValue("all");
    setStatusFilter("all");
    setPeriod(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
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
    search: searchQuery ? searchQuery.trim() : undefined,
    buildingType: buildingType === "all" ? undefined : buildingType,
    lifecycleStatus: statusFilter === "all" ? undefined : statusFilter,
    startDate,
    endDate,
  });

  const leadsData = leadsResponse?.data.leads;
  const leads = useMemo(() => leadsData ?? [], [leadsData]);
  const totalItems = leadsResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  useEffect(() => {
    setSelectedLeads([]);
  }, [
    currentPage,
    rowsPerPage,
    buildingType,
    projectValue,
    statusFilter,
    searchQuery,
    startDate,
    endDate,
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
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900">Assigned Leads</h1>
          <p className="text-gray-500 mt-1">
            Manage your assigned leads and track their progress.
          </p>
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
          </div>

          <div className="flex flex-wrap gap-3 ">
            <div className="relative w-full lg:w-54">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white"
              />
            </div>
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
                    PROJECT NAME
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
                    NEXT FOLLOW UP
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
                {leadsLoading ? (
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
                          <span className="font-semibold text-gray-900 uppercase">
                            {getLeadProjectName(lead)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.jobId}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.buildingType || "-"} · {lead.location || "-"}
                          </span>
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

                      <TableCell className=" text-sm text-gray-600">
                        {formatFollowUpDate(lead.nextFollowUp?.followUpDate)}
                      </TableCell>

                      <TableCell className="">
                        <Link to={`/leads/${lead._id}?tab=chat`}>
                          <button className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">Chat</span>
                            {lead.isOnline ? (
                              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" title="Customer active in chat" />
                            ) : lead.customerId?.isOnline ? (
                              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" title="Customer online on site" />
                            ) : null}
                          </button>
                        </Link>
                      </TableCell>

                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <Link to={`/leads/${lead._id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className=" text-purple-600 stroke-2" />
                            </Button>
                          </Link>

                          {/* <CreateQuotationDialog
                            leadData={lead}
                            mode="edit"
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pen className=" text-green-600" />
                              </Button>
                            }
                          />

                          <CreateQuotationDialog
                            leadData={lead}
                            mode="create"
                            trigger={
                              <Button variant="ghost" size="icon">
                                <FileText className=" text-red-800" />
                              </Button>
                            }
                          /> */}

                          {!lead.isRaisedToPO && canCreatePO(lead.lifecycleStatus as LeadStatusType) && (
                            <MoveToOrdersDialog
                              leadId={lead._id}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Redo className=" text-red-500" />
                                </Button>
                              }
                            />
                          )}

                          <EscalateLeadDialog
                            leadId={lead._id}
                            leadName={getLeadProjectName(lead)}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <AlertCircle className=" text-gray-500" />
                              </Button>
                            }
                          />
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
                        <p className="text-lg font-medium">No leads found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
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
