import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SuccessDialog from "@/components/success-dialog";
import type { LeadDetailPayments } from "@/modules/leads/leads.api";
import {
  formatLeadCurrency,
  formatLeadDate,
} from "@/modules/leads/leads.utils";
import { useSendInvoiceMutation } from "@/modules/invoices/invoices.hooks";

type Props = {
  leadId?: string;
  paymentsData?: LeadDetailPayments;
};

export default function PaymentsCard({ leadId, paymentsData }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendFailedInvoiceId, setSendFailedInvoiceId] = useState<string | null>(
    null,
  );
  const sendInvoiceMutation = useSendInvoiceMutation();

  const handleSendEmail = async (invoiceId: string) => {
    if (sendInvoiceMutation.isPending) {
      return;
    }

    setSendFailedInvoiceId(null);

    try {
      const response = await sendInvoiceMutation.mutateAsync(invoiceId);
      if (!response.success) {
        console.error("Failed to send invoice email:", response);
        setSendFailedInvoiceId(invoiceId);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      setSendFailedInvoiceId(invoiceId);
    }
  };

  const total = paymentsData
    ? formatLeadCurrency(paymentsData.totalPaid + paymentsData.totalPending)
    : formatLeadCurrency(0);
  const paid = paymentsData
    ? formatLeadCurrency(paymentsData.totalPaid)
    : formatLeadCurrency(0);
  const outstanding = paymentsData
    ? formatLeadCurrency(paymentsData.totalPending)
    : formatLeadCurrency(0);
  const invoices = paymentsData?.invoices ?? [];

  return (
    <>
    <Card className=" p-6">
      <div>
        <div className="text-sm text-gray-500">
          <span className="font-semibold">{leadId}</span>
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
                <th className="text-left px-6 py-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <p className="text-base font-medium text-gray-900">
                        No payment records yet
                      </p>
                      <p className="text-sm text-gray-500">
                        Payments will appear here once invoices are created or
                        marked as paid.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const status = invoice.paidAt ? "Confirmed" : "Pending";

                  return (
                    <tr key={invoice._id} className="border-t">
                      <td className="px-6 py-4">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatLeadDate(invoice.date ?? invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {formatLeadCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="secondary"
                            className={
                              status === "Pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-green-50 text-green-700"
                            }
                          >
                            {status}
                          </Badge>
                          {status === "Pending" ? (
                            <div className="flex flex-col items-start">
                              <Button
                                variant="link"
                                className="text-sm h-auto p-0"
                                onClick={() => handleSendEmail(invoice._id)}
                                disabled={sendInvoiceMutation.isPending}
                              >
                                {sendInvoiceMutation.isPending &&
                                sendInvoiceMutation.variables === invoice._id
                                  ? "Sending..."
                                  : "Notify"}
                              </Button>
                              {sendFailedInvoiceId === invoice._id && (
                                <span className="text-[10px] text-destructive">
                                  Send failed
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
    <SuccessDialog
      open={showSuccess}
      onClose={() => setShowSuccess(false)}
      title="Email Sent"
      okLabel="Done"
    />
    </>
  );
}
