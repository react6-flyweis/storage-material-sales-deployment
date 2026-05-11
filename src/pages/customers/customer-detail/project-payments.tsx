import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Hammer,
  ShieldCheck,
  CircleDollarSign,
  LineChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";

const paymentsData = Array(9).fill({
  date: "Apr 02, 2024",
  amount: "$5,000",
  status: "Received",
});

const paymentStats = [
  {
    title: "Total Payments Received",
    value: "$980,000",
    bg: "bg-[#1D51A4]",
    icon: Hammer,
    iconColor: "text-[#1D51A4]",
  },
  {
    title: "Payment Completion",
    value: "82%",
    bg: "bg-[#22C55E]",
    icon: ShieldCheck,
    iconColor: "text-[#22C55E]",
  },
  {
    title: "Pending Amount",
    value: "$150,000",
    bg: "bg-[#EAB308]",
    icon: CircleDollarSign,
    iconColor: "text-[#EAB308]",
  },
  {
    title: "Overdue Amount",
    value: "$70,000",
    bg: "bg-[#FB923C]",
    icon: LineChart,
    iconColor: "text-[#FB923C]",
    alert: true,
  },
];

export default function ProjectPayments() {
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
          Project 1 - Payments
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {paymentStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/40" />
                {stat.title}
              </div>
            }
            value={stat.value}
            color={stat.bg}
            icon={<stat.icon className={`h-5 w-5 ${stat.iconColor}`} />}
            valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      {/* Table Section */}
      <Card className="p-6 mt-6 border-none shadow-sm bg-white">
        <h2 className="text-base font-semibold mb-6 text-slate-800">
          Payments
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                Date
              </TableHead>
              <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                Invoice
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((payment, index) => (
              <TableRow
                key={index}
                className="hover:bg-slate-50/50 border-b border-slate-50"
              >
                <TableCell className="text-slate-600 py-5">
                  {payment.date}
                </TableCell>
                <TableCell className="text-slate-600">
                  {payment.amount}
                </TableCell>
                <TableCell>
                  <span className="text-[#22C55E] font-medium text-sm">
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8 text-xs font-medium"
                  >
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
