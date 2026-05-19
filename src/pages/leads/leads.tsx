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
  Pen,
  AlertCircle,
} from "lucide-react";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
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
import ChatDialog from "@/components/leads/chat-dialog";
import MoveToOrdersDialog from "@/components/leads/move-to-orders-dialog";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { exportLeadsProvider } from "@/modules/leads/leads.api";
import { useLeadsStatsQuery } from "@/lib/metrics";

type LeadRow = {
  id: string;
  name: string;
  workshop: string;
  category: string;
  assignedTo: string | null;
  assignedToName: string;
  progress: number;
  progressStep: string;
  status: string;
  statusClassName: string;
  quoteValue: string;
  quoteValueNumber: number;
  chatCount: number;
  nextFollowUp: string;
  searchText: string;
  rawStatus: string;
};

const PAGE_SIZE = 20;

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

const formatLifecycleStatus = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusBadgeClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("sent_to_admin")) {
    return "bg-slate-100 text-slate-700";
  }

  if (normalized.includes("converted_to_po")) {
    return "bg-violet-100 text-violet-700";
  }

  if (normalized.includes("payment")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("deal_closed")) {
    return "bg-green-100 text-green-700";
  }

  if (normalized.includes("proposal")) {
    return "bg-purple-100 text-purple-700";
  }

  if (normalized.includes("quotation")) {
    return "bg-orange-100 text-orange-700";
  }

  if (normalized.includes("negotiation")) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-700";
};

const getLeadProgress = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("closed")) return 7;
  if (normalized.includes("proposal")) return 4;
  if (normalized.includes("quotation")) return 3;
  if (normalized.includes("negotiation")) return 5;

  return 2;
};

const mapLeadToRow = (lead: {
  _id: string;
  projectName: string;
  customerId: { firstName: string; email: string };
  lifecycleStatus: string;
  quoteValue: number;
  buildingType: string;
  location: string;
  nextFollowUp: { followUpDate: string } | null;
}): LeadRow => {
  const status = formatLifecycleStatus(lead.lifecycleStatus);
  const progress = getLeadProgress(lead.lifecycleStatus);

  return {
    id: lead._id,
    name: lead.projectName || lead.customerId.firstName || "Untitled Lead",
    workshop: lead.buildingType || "-",
    category: lead.location || "-",
    assignedTo: null,
    assignedToName: "",
    progress,
    progressStep: `Step ${Math.min(progress, 8)}/8`,
    status,
    statusClassName: getStatusBadgeClassName(lead.lifecycleStatus),
    quoteValue: formatCurrency(lead.quoteValue),
    quoteValueNumber: lead.quoteValue,
    chatCount: 0,
    nextFollowUp: formatFollowUpDate(lead.nextFollowUp?.followUpDate),
    searchText: [
      lead._id,
      lead.projectName,
      lead.customerId.firstName,
      lead.customerId.email,
      lead.lifecycleStatus,
      lead.buildingType,
      lead.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    rawStatus: lead.lifecycleStatus,
  };
};

export default function LeadsPage() {
  const [buildingType, setBuildingType] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const { data: metrics, isPending } = useLeadsStatsQuery();
  const loading = isPending && !metrics;
  const { data: leadsResponse, isPending: leadsLoading } = useLeadsQuery(
    currentPage,
    rowsPerPage,
  );

  const leadsData = leadsResponse?.data.leads;
  const leads = useMemo(() => leadsData ?? [], [leadsData]);
  const totalItems = leadsResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const leadRows = useMemo(() => leads.map(mapLeadToRow), [leads]);

  useEffect(() => {
    setSelectedLeads([]);
  }, [
    currentPage,
    rowsPerPage,
    buildingType,
    projectValue,
    statusFilter,
    searchQuery,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Filter leads based on all criteria
  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return leadRows.filter((lead) => {
      if (normalizedSearch && !lead.searchText.includes(normalizedSearch)) {
        return false;
      }

      if (buildingType !== "all") {
        const typeMatch = lead.workshop
          .toLowerCase()
          .includes(buildingType.toLowerCase());
        if (!typeMatch) return false;
      }

      if (projectValue !== "all") {
        const matchesValue =
          (projectValue === "small" && lead.quoteValueNumber < 50000) ||
          (projectValue === "medium" &&
            lead.quoteValueNumber >= 50000 &&
            lead.quoteValueNumber <= 200000) ||
          (projectValue === "large" && lead.quoteValueNumber > 200000);

        if (!matchesValue) return false;
      }

      if (statusFilter !== "all") {
        const statusMatch = lead.rawStatus
          .toLowerCase()
          .includes(statusFilter.toLowerCase());
        if (!statusMatch) return false;
      }

      return true;
    });
  }, [leadRows, searchQuery, buildingType, projectValue, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
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

  const getProgressDots = (progress: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < progress ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const csv = await exportLeadsProvider(currentPage, rowsPerPage);
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
    <>
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
          {/* 
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div> */}

          <div className="flex flex-wrap gap-3 ">
            <Select value={buildingType} onValueChange={setBuildingType}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="Building types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="garages">Garages</SelectItem>
                <SelectItem value="workshops">Workshops</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="sales-storage">Sales Storage</SelectItem>
                <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectValue} onValueChange={setProjectValue}>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="proposal">Proposal sent</SelectItem>
                <SelectItem value="quotation">Quotation Sent</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
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
                        selectedLeads.length === filteredLeads.length &&
                        filteredLeads.length > 0
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
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>

                      <TableCell className="">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 uppercase">
                            {lead.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.id}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.workshop} · {lead.category}
                          </span>
                          {lead.assignedTo && (
                            <span className="text-sm text-gray-700 mt-1">
                              Assigned to {lead.assignedToName}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <div className="flex flex-col gap-1">
                          {getProgressDots(lead.progress)}
                          <a className="text-sm text-blue-600" href="#">
                            {lead.progressStep}
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <Badge
                          className={`${lead.statusClassName} rounded-full px-4 py-1 text-sm`}
                          variant="secondary"
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="">
                        <span className="font-medium text-gray-900">
                          {lead.quoteValue}
                        </span>
                      </TableCell>

                      <TableCell className=" text-sm text-gray-600">
                        {lead.nextFollowUp}
                      </TableCell>

                      <TableCell className="">
                        <ChatDialog
                          lead={lead}
                          trigger={
                            <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">Chat</span>
                              {lead.chatCount > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                                  {lead.chatCount}
                                </span>
                              )}
                            </button>
                          }
                        />
                      </TableCell>

                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <Link to={`/leads/${lead.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className=" text-purple-600 stroke-2" />
                            </Button>
                          </Link>

                          <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.id }}
                            mode="edit"
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pen className=" text-green-600" />
                              </Button>
                            }
                          />

                          <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.id }}
                            mode="create"
                            trigger={
                              <Button variant="ghost" size="icon">
                                <FileText className=" text-red-800" />
                              </Button>
                            }
                          />

                          <MoveToOrdersDialog
                            leadId={lead.id}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Redo className=" text-red-500" />
                              </Button>
                            }
                          />

                          <EscalateLeadDialog
                            leadId={lead.id}
                            leadName={lead.name}
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
    </>
  );
}
