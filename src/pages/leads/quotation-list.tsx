import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Download, Eye, Upload, Loader2 } from "lucide-react";
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
  "Project Converted": { bg: "bg-green-100", text: "text-green-700" },
  Rejected: { bg: "bg-orange-100", text: "text-orange-700" },
  "Quote sent": { bg: "bg-purple-100", text: "text-purple-700" },
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
  switch (status) {
    case "sent":
      return "Quote sent";
    case "draft":
      return "Draft";
    case "approved":
    case "converted":
      return "Project Converted";
    case "rejected":
      return "Rejected";
    default:
      return status ?? "Unknown";
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
    buildingType: "",
    projectValue: "",
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
      const status = normalizeStatus(quotation.status);
      const colors = getStatusClassName(status);

      return {
        id: quotation._id,
        quoteNumber: quotation.quoteNumber || "N/A",
        customer: quotation.customerId?.firstName?.trim() || "Unknown customer",
        project: quotation.leadId?.projectName?.trim() || "N/A",
        status,
        value: formatMoney(quotation.finalPrice),
        dateSent: formatDate(quotation.sentAt ?? quotation.createdAt),
        statusClassName: `${colors.bg} ${colors.text}`,
      };
    });
  }, [data]);

  const quotationStats = useMemo(() => {
    const counts = {
      total: data?.data.total ?? 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };

    quotations.forEach((quotation) => {
      if (quotation.status === "Project Converted") {
        counts.approved += 1;
      }

      if (quotation.status === "Quote sent" || quotation.status === "Draft") {
        counts.pending += 1;
      }

      if (quotation.status === "Rejected") {
        counts.rejected += 1;
      }
    });

    return counts;
  }, [data?.data.total, quotations]);

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const statBoxes = [
    {
      label: "Total Quotation",
      value: quotationStats.total,
      bgColor: "bg-blue-600",
    },
    {
      label: "Approved Quotation",
      value: quotationStats.approved,
      bgColor: "bg-green-500",
    },
    {
      label: "Pending Approval",
      value: quotationStats.pending,
      bgColor: "bg-yellow-400",
    },
    {
      label: "Rejected Quotation",
      value: quotationStats.rejected,
      bgColor: "bg-orange-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <TitleSubtitle
        title={
          <div className="flex items-center gap-2">
            <span>Quotation List</span>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            ) : (
              <span>- {quotationStats.total}</span>
            )}
          </div>
        }
        subtitle="Manage your assigned leads and track their progress."
        action={
          <Link to="/leads/new-inquiry">
            <Button>Create New Inquiry</Button>
          </Link>
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

      <div className="flex justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        <div className="flex gap-4 ">
          <Select
            value={selectedFilters.buildingType}
            onValueChange={(v) => handleFilterChange("buildingType", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Building Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedFilters.projectValue}
            onValueChange={(v) => handleFilterChange("projectValue", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Project Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10000">$0 - $10,000</SelectItem>
              <SelectItem value="10000-50000">$10,000 - $50,000</SelectItem>
              <SelectItem value="50000+">$50,000+</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedFilters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="converted">Project Converted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="quote-sent">Quote sent</SelectItem>
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
          totalItems={quotationStats.total}
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
