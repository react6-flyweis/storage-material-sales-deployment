import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Eye, Loader2, PlusCircle, Search } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
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
} from "@/modules/quotations/quotations.api";
import {
  useQuotationsQuery,
  useQuotationStatsQuery,
} from "@/modules/quotations/quotations.hooks";

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

function EmptyState() {
  return (
    <div className="p-8 text-center text-slate-600">
      <p className="text-lg font-medium">No quotations found</p>
      <p className="text-sm mt-2">There are no quotations to display.</p>
    </div>
  );
}

export default function QuotationListPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    search: "",
    status: "",
    buildingType: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      buildingType?: string;
    } = {
      page: currentPage,
      limit: rowsPerPage,
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
  }, [currentPage, rowsPerPage, selectedFilters]);

  const { data, isLoading, isError } = useQuotationsQuery(queryParams);
  const { data: statsResponse } = useQuotationStatsQuery();

  const quotations: Quotation[] = useMemo(() => {
    return data?.data?.quotations ?? [];
  }, [data]);

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  };

  const stats = statsResponse?.data;

  const statBoxes = [
    {
      label: "Total Quotation",
      value: stats?.total ?? data?.data?.total ?? "-",
      bgColor: "bg-blue-600",
    },
    {
      label: "Approved Quotation",
      value: stats?.approved ?? "-",
      bgColor: "bg-green-500",
    },
    {
      label: "Pending Approval",
      value: stats?.pendingApproval ?? stats?.pending_approval ?? "-",
      bgColor: "bg-yellow-400",
    },
    {
      label: "Rejected Quotation",
      value: stats?.rejected ?? "-",
      bgColor: "bg-orange-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <TitleSubtitle
        title={
          <div className="flex items-center gap-2">
            <span>Quotation</span>
            {isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            )}
          </div>
        }
        subtitle="Manage your assigned leads and track their progress."
        action={
          <div className="flex items-center gap-3">
            <Link to="/leads/new-inquiry">
              <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium rounded-lg px-4 py-2">
                Create New Inquiry
              </Button>
            </Link>
            <Link to="/quotation/pemb/create">
              <Button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Create New Quotation
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statBoxes.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 text-white shadow-md`}
          >
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

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

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load quotations.
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <tr>
                <TableHead className="">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  QUOTE ID
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  LEAD DETAILS
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
                <TableHead className="text-gray-600 text-xs font-semibold">
                  ACTIONS
                </TableHead>
              </tr>
            </TableHeader>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={9}>
                    <QuotationTableSkeleton />
                  </td>
                </tr>
              </tbody>
            ) : quotations.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9}>
                    <EmptyState />
                  </td>
                </tr>
              </tbody>
            ) : (
              <TableBody className="divide-y divide-gray-200">
                {quotations.map((quotation) => {
                  const status = normalizeStatus(
                    quotation.status || quotation.workflowStatus
                  );
                  const colors = getStatusClassName(status);

                  // Lead & Customer information extraction
                  const customerObj =
                    typeof quotation.customerId === "object" &&
                    quotation.customerId !== null
                      ? quotation.customerId
                      : null;
                  const leadObj =
                    typeof quotation.leadId === "object" &&
                    quotation.leadId !== null
                      ? quotation.leadId
                      : null;
                  const projectName =
                    quotation.projectName ||
                    leadObj?.projectName ||
                    quotation.companyName ||
                    customerObj?.company ||
                    "";
                  const jobId =
                    quotation.jobId ||
                    quotation.projectId ||
                    leadObj?.jobId ||
                    "";
                  const customerName =
                    quotation.customerName ||
                    [customerObj?.firstName, customerObj?.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() ||
                    "";
                  const customerEmail =
                    quotation.customerEmail ||
                    quotation.defaultToEmail ||
                    customerObj?.email ||
                    quotation.sentTo ||
                    "";

                  return (
                    <TableRow key={quotation._id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <Link
                          to={`/leads/quotation-details/${quotation._id}`}
                          className="hover:underline text-blue-600"
                        >
                          {quotation.quoteNumber || "N/A"}
                        </Link>
                      </TableCell>

                      {/* LEAD DETAILS CELL */}
                      <TableCell className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {projectName || customerName || "—"}
                          </span>
                          {jobId && (
                            <span className="text-xs text-gray-500">
                              {jobId}
                            </span>
                          )}
                          {customerName && customerName !== projectName && (
                            <span className="text-xs text-gray-600">
                              {customerName}
                            </span>
                          )}
                          {customerEmail && (
                            <span className="text-xs text-gray-400">
                              {customerEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Building Type */}
                      <TableCell className="px-6 py-4 text-sm text-gray-700">
                        {quotation.buildingType || "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-0.5 whitespace-nowrap rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {status}
                        </span>
                      </TableCell>

                      {/* Quotation Value */}
                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatMoney(quotation.finalPrice)}
                      </TableCell>

                      {/* Version Number */}
                      <TableCell className="px-6 py-4 text-sm text-gray-700">
                        v{quotation.versionNumber || 1}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(quotation.sentAt ?? quotation.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-6 py-4 text-sm">
                        <Link
                          to={`/leads/quotation-details/${quotation._id}`}
                          className="text-purple-500 hover:text-purple-700 inline-block"
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
      </div>

      <div className="bg-white">
        <Pagination
          totalItems={data?.data?.total || 0}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
