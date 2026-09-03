import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import type { LeadDetailPayments } from "@/modules/leads/leads.api";
import {
  formatLeadCurrency,
  formatLeadDate,
  formatLeadDateTime,
} from "@/modules/leads/leads.utils";
import { useSendInvoiceMutation, useInvoicesQuery, useInvoiceStatsQuery } from "@/modules/invoices/invoices.hooks";
import { WorkflowStatusBadge } from "@/components/invoice/approval-modals";

type Props = {
  leadId?: string;
  leadDbId?: string;
  paymentsData?: LeadDetailPayments;
};

export default function PaymentsCard({ leadId, leadDbId, paymentsData }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendFailedInvoiceId, setSendFailedInvoiceId] = useState<string | null>(
    null,
  );
  const sendInvoiceMutation = useSendInvoiceMutation();

  const { data: invoicesResponse } = useInvoicesQuery({
    leadId: leadDbId,
    limit: 100,
  });

  const { data: stats } = useInvoiceStatsQuery({ leadId: leadDbId });

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

  const invoices = invoicesResponse?.data
    ? invoicesResponse.data.invoices.map((item) => ({
        _id: item.invoice?._id ?? "",
        invoiceNumber: item.invoiceNumber ?? item.invoice?.invoiceNumber ?? "",
        date: item.invoice?.date ?? item.invoice?.createdAt ?? undefined,
        createdAt: item.invoice?.createdAt ?? "",
        totalAmount: item.amount ?? item.invoice?.totalAmount ?? 0,
        status: item.status ?? item.invoice?.status ?? "",
        workflowStatus: item.workflowStatus ?? item.invoice?.workflowStatus ?? item.status ?? item.invoice?.status ?? "",
        approvalStatus: item.approval?.status ?? item.invoice?.approval?.status ?? "",
        isApproved: (item.approval?.status ?? item.invoice?.approval?.status) === "approved",
        sentAt: (item.invoice as { sentAt?: string | null })?.sentAt ?? null,
        paidAt: (item.invoice as { paidAt?: string | null })?.paidAt ?? null,
      }))
    : (paymentsData?.invoices ?? []).map((inv) => ({
        ...inv,
        workflowStatus: inv.status,
        approvalStatus: "",
        isApproved: false,
      }));

  const total = formatLeadCurrency(stats?.totalAmount ?? 0);
  const paid = formatLeadCurrency(stats?.totalPaid ?? 0);
  const outstanding = formatLeadCurrency(stats?.totalUnpaid ?? 0);

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
                    const status = invoice.status

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
                            <WorkflowStatusBadge
                              variant="light"
                              workflowStatus={invoice.workflowStatus}
                              approvalStatus={invoice.approvalStatus}
                              invoiceStatus={invoice.status}
                            />
                            <span className="text-xs text-gray-500">
                              {
                                status === "sent" && formatLeadDateTime(invoice.sentAt)
                              }
                              {
                                status === "paid" && formatLeadDateTime(invoice.paidAt)
                              }
                            </span>
                            {status === "draft" ? (
                              <div className="flex flex-col items-start">
                                <Button
                                  variant="link"
                                  className="text-sm h-auto p-0 disabled:opacity-50 disabled:no-underline"
                                  onClick={() => handleSendEmail(invoice._id)}
                                  disabled={!invoice.isApproved || sendInvoiceMutation.isPending}
                                  title={!invoice.isApproved ? "Requires admin approval before notifying" : undefined}
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
