import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Download,
  Printer,
  Search,
  Eye,
  DollarSign,
  CheckCircle,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import DateRangePicker from "@/components/ui/date-range-picker";
import ClientSelector from "@/components/customers/client-selector";
import {
  useInvoiceStatsQuery,
  useInvoicesQuery,
} from "@/modules/invoices/invoices.hooks";
import { InvoiceStatus } from "@/modules/invoices/invoices.api";
import type { DateRange } from "react-day-picker";

type SelectedClient = {
  id: string;
  name: string;
  customer: string;
  customerId: string;
};

const statusOptions: Array<{ value: "All" | InvoiceStatus; label: string }> = [
  { value: "All", label: "All" },
  { value: InvoiceStatus.DRAFT, label: "Draft" },
  { value: InvoiceStatus.SENT, label: "Sent" },
  { value: InvoiceStatus.PAID, label: "Paid" },
  { value: InvoiceStatus.OVERDUE, label: "Overdue" },
  { value: InvoiceStatus.CANCELLED, label: "Cancelled" },
];

const statusBadgeStyles: Record<
  InvoiceStatus,
  { bg: string; text: string; label: string }
> = {
  [InvoiceStatus.DRAFT]: { bg: "bg-slate-600", text: "text-white", label: "Draft" },
  [InvoiceStatus.SENT]: { bg: "bg-blue-600", text: "text-white", label: "Sent" },
  [InvoiceStatus.PAID]: { bg: "bg-green-600", text: "text-white", label: "Paid" },
  [InvoiceStatus.OVERDUE]: { bg: "bg-red-600", text: "text-white", label: "Overdue" },
  [InvoiceStatus.CANCELLED]: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    label: "Cancelled",
  },
};

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusBadgeClasses(status: InvoiceStatus) {
  return statusBadgeStyles[status] ?? statusBadgeStyles.draft;
}

function InvoiceSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-md p-4 shadow flex items-center gap-4 border border-slate-200 animate-pulse"
        >
          <div className="w-10 h-10 rounded-md bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-6 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceTableSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
        >
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <div key={cellIndex} className="h-4 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-base font-medium text-gray-700">No invoices found</p>
      <p className="mt-2 text-sm">
        Adjust the filters or search criteria to see results.
      </p>
    </div>
  );
}

export default function InvoiceListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<"All" | InvoiceStatus>(
    "All",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { data: stats, isPending } = useInvoiceStatsQuery();
  const loadingStats = isPending && !stats;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const navigate = useNavigate();

  const startDate = dateRange?.from ? formatDateParam(dateRange.from) : "";
  const endDate = dateRange?.to ? formatDateParam(dateRange.to) : "";

  const {
    data: invoicesResponse,
    isLoading: loadingInvoices,
    isError: invoicesError,
  } = useInvoicesQuery({
    startDate,
    endDate,
    status: statusFilter === "All" ? "" : statusFilter,
    leadId: selectedClient?.id || "",
    search: searchQuery,
    page: currentPage,
    limit: rowsPerPage,
  });

  const invoices = invoicesResponse?.data.invoices ?? [];
  const totalItems = invoicesResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const hasActiveFilters =
    Boolean(dateRange?.from || dateRange?.to) ||
    Boolean(selectedClient) ||
    statusFilter !== "All" ||
    searchQuery.trim().length > 0;

  const current = Math.min(currentPage, totalPages);

  const summaryCards = [
    {
      key: "totalAmount",
      title: "Total Amount",
      value: stats?.totalAmount ?? 0,
      icon: DollarSign,
      iconClassName: "bg-green-500 text-white",
      borderClassName: "border-green-200",
    },
    {
      key: "totalPaid",
      title: "Total Paid",
      value: stats?.totalPaid ?? 0,
      icon: CheckCircle,
      iconClassName: "bg-blue-600 text-white",
      borderClassName: "border-blue-200",
    },
    {
      key: "totalUnpaid",
      title: "Total Unpaid",
      value: stats?.totalUnpaid ?? 0,
      icon: CreditCard,
      iconClassName: "bg-orange-500 text-white",
      borderClassName: "border-orange-200",
    },
    {
      key: "overdue",
      title: "Overdue",
      value: stats?.overdue ?? 0,
      icon: AlertCircle,
      iconClassName: "bg-red-600 text-white",
      borderClassName: "border-red-200",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoice Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dashboard &gt; Invoice Report
          </p>
        </div>
      </div>

      {loadingStats ? (
        <InvoiceSummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className={`bg-white rounded-md p-4 shadow flex items-center gap-4 border ${card.borderClassName}`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{card.title}</div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(card.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="w-full">
              <label className="text-xs text-gray-500">Choose Date</label>
              <div className="mt-1 space-y-2">
                <DateRangePicker
                  value={dateRange}
                  className="w-full"
                  onChange={(range) => {
                    setDateRange(range);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs text-gray-500">Project</label>
              <div className="mt-1">
                <ClientSelector
                  value={selectedClient?.id || ""}
                  placeholder="Search project/leads..."
                  onValueChange={(client) => {
                    setSelectedClient(client ?? null);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs text-gray-500">Status</label>
              <div className="mt-1">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as "All" | InvoiceStatus);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs text-gray-500">Search</label>
              <div className="mt-1 flex items-end gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search invoice, customer..."
                    className="pl-9"
                  />
                </div>
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setDateRange(undefined);
                      setSelectedClient(null);
                      setStatusFilter("All");
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="bg-orange-500 text-white px-6 py-2"
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Invoice List</h3>
            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-2 ">
              <button
                title="Export PDF"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-red-600 border"
              >
                <FileText className="size-4" />
              </button>
              <button
                title="Export Excel"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-green-600 border"
              >
                <Download className="size-4" />
              </button>
              <button
                title="Print"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-gray-600 border"
              >
                <Printer className="size-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border-t bg-white">
            <Table className="bg-white">
              <TableHeader>
                <tr className="bg-gray-50">
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Invoice Number
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Project
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Due Date
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Amount
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Actions
                  </TableHead>
                </tr>
              </TableHeader>
              {loadingInvoices ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <InvoiceTableSkeleton />
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : invoices.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {invoices.map((inv) => {
                    const status = getStatusBadgeClasses(inv.status);

                    return (
                      <TableRow key={inv.invoice._id}>
                        <TableCell className="text-orange-500 font-medium px-6 py-4">
                          {inv.invoiceNumber ||
                            inv.invoice.invoiceNumber ||
                            "—"}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {inv.projectName || "—"}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {formatDisplayDate(
                            inv.dueDate || inv.invoice.dueDate || "",
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {formatCurrency(
                            inv.amount ?? inv.invoice.totalAmount ?? 0,
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 ${status.bg} ${status.text} px-2 py-0.5 rounded-md text-sm font-medium`}
                          >
                            <span className="w-2 h-2 bg-white rounded-full" />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Button
                            title="View"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/invoice/${inv.invoice._id}`)
                            }
                          >
                            <Eye />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              )}
            </Table>
          </div>

          <Pagination
            totalItems={totalItems}
            currentPage={current}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[20, 50, 100]}
            onPageChange={(p) => setCurrentPage(p)}
            onRowsPerPageChange={(r) => {
              setRowsPerPage(r);
              setCurrentPage(1);
            }}
          />
          {invoicesError ? (
            <div className="px-4 pb-4 text-sm text-red-600">
              Failed to load invoices.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
