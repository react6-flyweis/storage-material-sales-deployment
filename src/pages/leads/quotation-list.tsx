import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Eye, Loader2, PlusCircle } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
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
import { useQuotationsQuery } from "@/modules/quotations/quotations.hooks";

interface QuotationRow {
  id: string;
  quoteNumber: string;
  customer: string;
  project: string;
  status: string;
  value: string;
  dateSent: string;
  statusClassName: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Approved: { bg: "bg-green-100", text: "text-green-700" },
  "Pending Approval": { bg: "bg-amber-100", text: "text-amber-800" },
  Rejected: { bg: "bg-rose-100", text: "text-rose-700" },
  Sent: { bg: "bg-blue-100", text: "text-blue-800" },
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
    case "rejected":
      return "Rejected";
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
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading, isError } = useQuotationsQuery(
    currentPage,
    rowsPerPage,
  );

  const quotations: QuotationRow[] = useMemo(() => {
    const items = data?.data.quotations ?? [];

    return items.map((quotation) => {
      const approvalStatus =
        quotation.approval?.status || quotation.approvalStatus;
      const status = normalizeStatus(
        quotation.status || quotation.workflowStatus,
      );
      const colors = getStatusClassName(status);

      return {
        id: quotation._id,
        quoteNumber: quotation.quoteNumber || "N/A",
        customer:
          (typeof quotation.customerId === "object"
            ? quotation.customerId?.firstName?.trim()
            : null) ||
          quotation.companyName ||
          "Unknown customer",
        project:
          (typeof quotation.leadId === "object"
            ? quotation.leadId?.projectName?.trim()
            : null) || "N/A",
        status,
        buildingType: quotation.buildingType || "",
        rawStatus: (
          quotation.status ||
          quotation.workflowStatus ||
          ""
        ).toLowerCase(),
        rawApprovalStatus: (approvalStatus || "").toLowerCase(),
        value: formatMoney(quotation.finalPrice),
        dateSent: formatDate(quotation.sentAt ?? quotation.createdAt),
        statusClassName: `${colors.bg} ${colors.text}`,
      };
    });
  }, [data]);

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const statBoxes = [
    {
      label: "Total Quotation",
      value: data?.data.total || "-",
      bgColor: "bg-blue-600",
    },
    {
      label: "Approved Quotation",
      value: "-",
      bgColor: "bg-green-500",
    },
    {
      label: "Pending Approval",
      value: "-",
      bgColor: "bg-yellow-400",
    },
    {
      label: "Rejected Quotation",
      value: "-",
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

      <div className="flex  items-center">
        <div className="flex gap-4">
          <Select
            value={selectedFilters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <TableHead className=" text-gray-600 text-xs">
                  QUOTE ID
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  CUSTOMER
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  PROJECT
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">STATUS</TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  QUOTATION VALUE
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  DATE SENT
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  ACTIONS
                </TableHead>
              </tr>
            </TableHeader>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <QuotationTableSkeleton />
                  </td>
                </tr>
              </tbody>
            ) : quotations.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              </tbody>
            ) : (
              <TableBody className="divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.quoteNumber}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.customer}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.project}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-0.5 whitespace-nowrap rounded-full text-xs ${quotation.statusClassName}`}
                      >
                        {quotation.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.value}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.dateSent}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm">
                      <Link
                        to={`/leads/quotation-details/${quotation.id}`}
                        className="text-purple-500 inline-block"
                      >
                        <Eye className="size-4 " />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>

      <div className="bg-white">
        <Pagination
          totalItems={data?.data.total || 0}
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
