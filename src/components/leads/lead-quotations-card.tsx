import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Eye, Loader2, PlusCircle, Search, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BuildingTypeSelector from "@/components/building-type-selector";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import {
  BUILDING_TYPE,
  ADMIN_STATUS,
  type AdminStatus,
  type Quotation,
  type GetQuotationsParams,
} from "@/modules/quotations/quotations.api";
import { useQuotationsQuery } from "@/modules/quotations/quotations.hooks";
import type { LeadDetailLead, LeadDetailCustomer } from "@/modules/leads/leads.api";

interface LeadQuotationsCardProps {
  leadId: string;
  lead?: LeadDetailLead;
  customer?: LeadDetailCustomer;
}

const STATUS_LABELS: Record<AdminStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  sent: "Sent",
  accepted: "Accepted",
};

const BUILDING_TYPE_OPTIONS = BUILDING_TYPE.map((type) => ({
  value: type,
  label: type,
}));

const statusColors: Record<string, { bg: string; text: string }> = {
  Approved: { bg: "bg-green-100", text: "text-green-700" },
  "Pending Approval": { bg: "bg-amber-100", text: "text-amber-800" },
  Pending: { bg: "bg-amber-100", text: "text-amber-800" },
  Rejected: { bg: "bg-rose-100", text: "text-rose-700" },
  Sent: { bg: "bg-blue-100", text: "text-blue-800" },
  Accepted: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Draft: { bg: "bg-slate-100", text: "text-slate-700" },
};

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(status?: string | null) {
  const raw = (status || "draft").trim().toLowerCase();

  switch (raw) {
    case "sent":
      return "Sent";
    case "approved":
      return "Approved";
    case "pending_approval":
      return "Pending Approval";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "accepted":
      return "Accepted";
    case "draft":
      return "Draft";
    default:
      return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function getStatusClassName(status: string) {
  return statusColors[status] ?? { bg: "bg-slate-100", text: "text-slate-700" };
}

function QuotationTableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-10 rounded bg-slate-200" />
      <div className="h-10 rounded bg-slate-200" />
      <div className="h-10 rounded bg-slate-200" />
    </div>
  );
}

function EmptyState({ createQuotationUrl }: { createQuotationUrl: string }) {
  return (
    <div className="p-8 text-center text-slate-600 space-y-3">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <p className="text-base font-medium text-slate-900">No quotations found</p>
        <p className="text-sm text-slate-500 mt-1">
          There are no quotations created for this lead yet.
        </p>
      </div>
      <Link to={createQuotationUrl} className="inline-block mt-2">
        <Button size="sm" className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white gap-2">
          <PlusCircle className="w-4 h-4" />
          Create Quotation
        </Button>
      </Link>
    </div>
  );
}

export default function LeadQuotationsCard({
  leadId,
  lead,
}: LeadQuotationsCardProps) {
  const [selectedFilters, setSelectedFilters] = useState({
    search: "",
    status: "",
    buildingType: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const queryParams = useMemo(() => {
    const params: GetQuotationsParams = {
      page: currentPage,
      limit: rowsPerPage,
      lead: leadId,
      leadId: leadId,
    };
    if (selectedFilters.search && selectedFilters.search.trim()) {
      params.search = selectedFilters.search.trim();
    }
    if (selectedFilters.status && selectedFilters.status !== "all") {
      params.status = selectedFilters.status;
    }
    if (selectedFilters.buildingType && selectedFilters.buildingType !== "all") {
      params.buildingType = selectedFilters.buildingType;
    }
    return params;
  }, [currentPage, rowsPerPage, leadId, selectedFilters]);

  const { data, isLoading, isError } = useQuotationsQuery(queryParams);

  const quotations: Quotation[] = useMemo(() => {
    return data?.data?.quotations ?? [];
  }, [data]);

  const totalQuotations = data?.data?.total ?? quotations.length;

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  };

  const createQuotationUrl = `/quotation/pemb/create?leadId=${encodeURIComponent(leadId)}`;

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Quotations</h2>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
              {totalQuotations} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            View and manage all quotations generated for this lead
            {lead?.jobId ? ` (${lead.jobId})` : ""}
          </p>
        </div>

        <Link to={createQuotationUrl}>
          <Button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Quotation</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            value={selectedFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-9 bg-white text-xs h-9"
          />
        </div>

        {/* Building Type Selector */}
        <BuildingTypeSelector
          value={selectedFilters.buildingType}
          onChange={(val) => handleFilterChange("buildingType", val)}
          options={BUILDING_TYPE_OPTIONS}
          includeAll
          allLabel="All Building Types"
          triggerClassName="w-full sm:w-44 bg-white text-xs h-9"
          placeholder="Building Types"
        />

        {/* Status Filter */}
        <Select
          value={selectedFilters.status}
          onValueChange={(v) => handleFilterChange("status", v)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-white text-xs h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ADMIN_STATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load quotations for this lead.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  QUOTE ID
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  BUILDING TYPE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  STATUS
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  QUOTATION VALUE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  VERSION
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  DATE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <QuotationTableSkeleton />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : quotations.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState createQuotationUrl={createQuotationUrl} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody className="divide-y divide-gray-200">
                {quotations.map((quotation) => {
                  const status = normalizeStatus(
                    quotation.status || quotation.workflowStatus
                  );
                  const colors = getStatusClassName(status);

                  return (
                    <TableRow key={quotation._id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4 text-sm font-medium">
                        <Link
                          to={`/leads/quotation-details/${quotation._id}`}
                          className="hover:underline text-blue-600"
                        >
                          {quotation.quoteNumber || "N/A"}
                        </Link>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-700">
                        {quotation.buildingType || "—"}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm">
                        <span
                          className={`px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {status}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatMoney(quotation.finalPrice)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-700">
                        v{quotation.versionNumber || 1}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(quotation.sentAt ?? quotation.createdAt)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-right">
                        <Link
                          to={`/leads/quotation-details/${quotation._id}`}
                          className="text-purple-500 hover:text-purple-700 inline-block p-1 rounded hover:bg-purple-50 transition-colors"
                          title="View Quotation Details"
                        >
                          <Eye className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </div>

        {totalQuotations > 0 && (
          <div className="bg-white">
            <Pagination
              totalItems={data?.data?.total || quotations.length}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
