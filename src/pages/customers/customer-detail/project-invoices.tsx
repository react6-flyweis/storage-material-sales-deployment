import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { useInvoicesQuery, useMarkInvoicePaidMutation } from "@/modules/invoices/invoices.hooks";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { InvoiceStatus } from "@/modules/invoices/invoices.api";

function formatCurrency(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "—";
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

function getDisplayStatus(status?: string | null) {
  if (!status) return "Pending";
  const s = status.toLowerCase();
  if (s === InvoiceStatus.PAID) return "Paid";
  if (s === InvoiceStatus.OVERDUE) return "Overdue";
  return "Pending";
}

export default function ProjectInvoicesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const projectNameFromState = location.state?.projectName;

  // Fallback to fetch lead detail if project name is not passed in state (e.g. direct page refresh)
  const { data: leadResponse } = useLeadDetailQuery(id, !projectNameFromState);
  const projectName = projectNameFromState || leadResponse?.data?.lead?.projectName || "Project";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: invoicesResponse, isLoading } = useInvoicesQuery({
    leadId: id,
    search: searchQuery,
    page: currentPage,
    limit: rowsPerPage,
  });

  const markPaidMutation = useMarkInvoicePaidMutation();

  const invoices = invoicesResponse?.data?.invoices ?? [];
  const totalItems = invoicesResponse?.data?.total ?? 0;

  // Fetch all invoices for stats calculation (or compute from visible if page limit covers it)
  // Since we want accurate stats for the project and a project has few invoices, we can calculate from current invoices if total fits,
  // or just compute based on the lead's loaded invoices.
  const paidAmount = invoices.reduce((sum, inv) => {
    const status = getDisplayStatus(inv.status || inv.invoice?.status);
    return status === "Paid" ? sum + (inv.amount ?? inv.invoice?.totalAmount ?? 0) : sum;
  }, 0);

  const pendingAmount = invoices.reduce((sum, inv) => {
    const status = getDisplayStatus(inv.status || inv.invoice?.status);
    return status === "Pending" ? sum + (inv.amount ?? inv.invoice?.totalAmount ?? 0) : sum;
  }, 0);

  const overdueAmount = invoices.reduce((sum, inv) => {
    const status = getDisplayStatus(inv.status || inv.invoice?.status);
    return status === "Overdue" ? sum + (inv.amount ?? inv.invoice?.totalAmount ?? 0) : sum;
  }, 0);

  const invoiceStats = [
    {
      title: "Total Invoices",
      value: `${totalItems} ${totalItems === 1 ? "Invoice" : "Invoices"}`,
      bg: "bg-[#1D51A4]",
      icon: CheckCircle2,
      iconColor: "text-[#1D51A4]",
    },
    {
      title: "Paid Amount",
      value: formatCurrency(paidAmount),
      bg: "bg-[#22C55E]",
      icon: CheckCircle2,
      iconColor: "text-[#22C55E]",
    },
    {
      title: "Pending Amount",
      value: formatCurrency(pendingAmount),
      bg: "bg-[#EAB308]",
      icon: DollarSign,
      iconColor: "text-[#EAB308]",
    },
    {
      title: "Overdue Amount",
      value: formatCurrency(overdueAmount),
      bg: "bg-[#FB923C]",
      icon: AlertTriangle,
      iconColor: "text-[#FB923C]",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="default"
          onClick={() => navigate(-1)}
          className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-[#1E293B]">
          {projectName} - Invoices
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {invoiceStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            color={stat.bg}
            icon={<stat.icon className={`h-5 w-5 ${stat.iconColor}`} />}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 text-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table Section */}
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="w-12 text-center py-4">
                <Checkbox className="border-slate-300" />
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Invoice
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-1">
                  Sent Date
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-1">
                  Items
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Status
              </TableHead>
              <TableHead className="w-40"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No invoices found for this project.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => {
                const invoiceId = inv.invoice?._id || "";
                const rawStatus = inv.status || inv.invoice?.status;
                const invoiceNo = inv.invoiceNumber || inv.invoice?.invoiceNumber || "—";
                const amount = inv.amount ?? inv.invoice?.totalAmount ?? 0;
                const sentDate = formatDisplayDate(inv.dueDate || inv.invoice?.date || inv.invoice?.createdAt);
                const itemsCount = inv.invoice?.lineItems?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
                const status = getDisplayStatus(rawStatus);

                return (
                  <TableRow key={inv.invoice?._id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center py-4">
                      <Checkbox className="border-slate-300" />
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {invoiceNo}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatCurrency(amount)}
                    </TableCell>
                    <TableCell className="text-slate-600">{sentDate}</TableCell>
                    <TableCell className="text-slate-600">
                      {itemsCount}
                    </TableCell>
                    <TableCell>
                      {status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A]">
                          <div className="w-2 h-2 rounded-full bg-[#EAB308]"></div>
                          Pending
                          <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                        </span>
                      )}
                      {status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                          <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                          Paid
                          <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                        </span>
                      )}
                      {status === "Overdue" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                          <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                          Overdue
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1 opacity-70"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(rawStatus === InvoiceStatus.SENT || rawStatus === InvoiceStatus.OVERDUE) && (
                          <Button
                            size="sm"
                            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8"
                            onClick={() => {
                              if (invoiceId) {
                                markPaidMutation.mutate(invoiceId);
                              }
                            }}
                            disabled={markPaidMutation.isPending}
                          >
                            {markPaidMutation.isPending && markPaidMutation.variables === invoiceId ? "Marking..." : "Mark as Paid"}
                          </Button>
                        )}
                        {status === "Overdue" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#4F46E5] text-[#4F46E5] hover:bg-indigo-50 rounded-md px-4 h-8"
                          >
                            Follow up
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      {totalItems > 0 && (
        <div className="flex items-center justify-between bg-white">
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(row) => {
              setRowsPerPage(row);
              setCurrentPage(1);
            }}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
