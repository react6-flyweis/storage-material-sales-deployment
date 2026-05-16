import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LeadDetailPayments } from "@/modules/leads/leads.api";
import { formatLeadCurrency, formatLeadDate } from "@/modules/leads/leads.utils";

type Payment = {
  invoice: string;
  date: string;
  amount: string;
  status: "Pending" | "Confirmed" | "Failed";
};

type Props = {
  leadId?: string;
  paymentsData?: LeadDetailPayments;
};

const defaultPayments: Payment[] = [
  {
    invoice: "INV 2024-001",
    date: "27-01-2025",
    amount: "$12,500",
    status: "Pending",
  },
  {
    invoice: "INV 2024-002",
    date: "27-01-2025",
    amount: "$12,500",
    status: "Confirmed",
  },
  {
    invoice: "INV 2024-003",
    date: "27-01-2025",
    amount: "$12,500",
    status: "Confirmed",
  },
  {
    invoice: "INV 2024-004",
    date: "27-01-2025",
    amount: "$12,500",
    status: "Confirmed",
  },
];

function mapPayments(data: LeadDetailPayments): Payment[] {
  return data.invoices.map((invoice) => ({
    invoice: invoice.invoiceNumber,
    date: formatLeadDate(invoice.date ?? invoice.createdAt),
    amount: formatLeadCurrency(invoice.totalAmount),
    status: invoice.paidAt ? "Confirmed" : "Pending",
  }));
}

export default function PaymentsCard({ leadId, paymentsData }: Props) {
  const payments =
    paymentsData && paymentsData.invoices.length > 0
      ? mapPayments(paymentsData)
      : defaultPayments;
  const total = paymentsData
    ? formatLeadCurrency(paymentsData.totalPaid + paymentsData.totalPending)
    : "$15,000";
  const paid = paymentsData
    ? formatLeadCurrency(paymentsData.totalPaid)
    : "$0";
  const outstanding = paymentsData
    ? formatLeadCurrency(paymentsData.totalPending)
    : "$15,000";

  return (
    <Card className=" p-6">
      <div>
        <div className="text-sm text-gray-500">
          Lead ID-
          <span className="font-semibold">{leadId ?? "LD-2025-001"}</span>
        </div>
      </div>
      <div className="p-4 rounded bg-blue-50">
        <h3 className="text-lg font-semibold">Financial Summary</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="text-sm text-gray-500">Total Payment</div>
            <div className="text-xl font-semibold text-gray-900">{total}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Paid</div>
            <div className="text-xl font-semibold text-green-600">{paid}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Outstanding Balance</div>
            <div className="text-xl font-semibold text-red-600">
              {outstanding}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900">Payment History</h4>
        <div className="mt-4 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-6 py-3">INVOICE #</th>
                <th className="text-left px-6 py-3">DATE</th>
                <th className="text-left px-6 py-3">AMOUNT</th>
                <th className="text-left px-6 py-3">DATE</th>
                <th className="text-left px-6 py-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-6 py-4">{p.invoice}</td>
                  <td className="px-6 py-4 text-blue-600">{p.invoice}</td>
                  <td className="px-6 py-4 font-semibold">{p.amount}</td>
                  <td className="px-6 py-4">{p.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className={
                          p.status === "Pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : p.status === "Confirmed"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {p.status}
                      </Badge>
                      {p.status === "Pending" && (
                        <Button variant="link" className="text-sm">
                          Notify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
