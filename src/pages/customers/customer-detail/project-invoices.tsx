import { useNavigate } from "react-router";
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

const invoicesData = [
  {
    id: "INV-1001",
    amount: "$30,000",
    date: "22 Feb 2025",
    items: 125,
    status: "Pending",
  },
  {
    id: "INV-1002",
    amount: "$30,000",
    date: "07 Feb 2025",
    items: 98,
    status: "Paid",
  },
  {
    id: "INV-1003",
    amount: "$30,000",
    date: "30 Jan 2025",
    items: 210,
    status: "Overdue",
  },
  {
    id: "INV-1004",
    amount: "$30,000",
    date: "17 Jan 2025",
    items: 125,
    status: "Pending",
  },
  {
    id: "INV-1005",
    amount: "$30,000",
    date: "04 Jan 2025",
    items: 98,
    status: "Paid",
  },
  {
    id: "INV-1006",
    amount: "$30,000",
    date: "09 Dec 2024",
    items: 210,
    status: "Overdue",
  },
];

const invoiceStats = [
  {
    title: "Total Invoices",
    value: "6 Invoices",
    bg: "bg-[#1D51A4]",
    icon: CheckCircle2,
    iconColor: "text-[#1D51A4]",
  },
  {
    title: "Paid Amount",
    value: "$100,000",
    bg: "bg-[#22C55E]",
    icon: CheckCircle2,
    iconColor: "text-[#22C55E]",
  },
  {
    title: "Pending Amount",
    value: "$20,000",
    bg: "bg-[#EAB308]",
    icon: DollarSign,
    iconColor: "text-[#EAB308]",
  },
  {
    title: "Overdue Amount",
    value: "$8,000",
    bg: "bg-[#FB923C]",
    icon: AlertTriangle,
    iconColor: "text-[#FB923C]",
  },
];

export default function ProjectInvoicesPage() {
  const navigate = useNavigate();

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
          Project 1 - Invoices
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
            // valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search"
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
            {invoicesData.map((invoice, index) => (
              <TableRow key={index} className="hover:bg-slate-50/50">
                <TableCell className="text-center py-4">
                  <Checkbox className="border-slate-300" />
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  {invoice.id}
                </TableCell>
                <TableCell className="text-slate-600">
                  {invoice.amount}
                </TableCell>
                <TableCell className="text-slate-600">{invoice.date}</TableCell>
                <TableCell className="text-slate-600">
                  {invoice.items}
                </TableCell>
                <TableCell>
                  {invoice.status === "Pending" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A]">
                      <div className="w-2 h-2 rounded-full bg-[#EAB308]"></div>
                      Pending
                      <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                    </span>
                  )}
                  {invoice.status === "Paid" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                      Paid
                      <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                    </span>
                  )}
                  {invoice.status === "Overdue" && (
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
                  {invoice.status === "Pending" && (
                    <Button
                      size="sm"
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8"
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {invoice.status === "Overdue" && (
                    <Button
                      size="sm"
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8"
                    >
                      Follow up
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="flex items-center justify-between  bg-white">
        <Pagination
          totalItems={invoicesData.length}
          currentPage={4}
          onPageChange={() => {}}
          onRowsPerPageChange={(row) => {
            console.log("Rows per page changed to:", row);
          }}
          rowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
