import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LeadDetailPayments } from "@/modules/leads/leads.api";
import {
  formatLeadCurrency,
  formatLeadDate,
  formatLeadDateTime,
} from "@/modules/leads/leads.utils";
import { useInvoicesQuery, useInvoiceStatsQuery } from "@/modules/invoices/invoices.hooks";
import { WorkflowStatusBadge } from "@/components/invoice/approval-modals";
import { SendInvoiceModal } from "@/components/invoice/send-invoice-modal";

type Props = {
  leadId?: string;
  leadDbId?: string;
  paymentsData?: LeadDetailPayments;
};

type PaymentInvoiceItem = {
  _id: string;
  invoiceNumber: string;
  date?: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  invoiceStatus?: string;
  workflowStatus: string;
  approvalStatus: string;
  isApproved: boolean;
  sendMethod: "platform" | "manual" | string | null;
  sentAt: string | null;
  paidAt: string | null;
  revision: number | null;
  approvedRevision: number | null;
  customerEmail?: string | null;
  customerName?: string | null;
};

export default function PaymentsCard({ leadId, leadDbId, paymentsData }: Props) {
  const [selectedInvoiceForSend, setSelectedInvoiceForSend] = useState<PaymentInvoiceItem | null>(null);

  const { data: invoicesResponse } = useInvoicesQuery({
    leadId: leadDbId,
    limit: 100,
  });

  const { data: stats } = useInvoiceStatsQuery({ leadId: leadDbId });

  const invoices: PaymentInvoiceItem[] = invoicesResponse?.data
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
        sendMethod: item.invoice?.sendMethod ?? null,
        sentAt: item.invoice?.sentAt ?? null,
        paidAt: item.invoice?.paidAt ?? null,
        revision: item.invoice?.revision ?? null,
        approvedRevision: item.invoice?.approval?.approvedRevision ?? null,
        customerEmail:
          typeof item.invoice?.customerId === "object"
            ? item.invoice.customerId?.email
            : null,
        customerName:
          typeof item.invoice?.customerId === "object"
            ? `${item.invoice.customerId?.firstName || ""} ${item.invoice.customerId?.lastName || ""}`.trim() || null
            : null,
      }))
    : (paymentsData?.invoices ?? []).map((inv) => ({
        ...inv,
        workflowStatus: inv.status,
        approvalStatus: "",
        isApproved: false,
        sendMethod: null,
        sentAt: null,
        paidAt: null,
        revision: null,
        approvedRevision: null,
        customerEmail: null,
        customerName: null,
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
                              invoiceStatus={invoice.invoiceStatus || invoice.status}
                              sendMethod={invoice.sendMethod}
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
                                  className="text-sm h-auto p-0 disabled:opacity-50 disabled:no-underline cursor-pointer text-blue-600"
                                  onClick={() => setSelectedInvoiceForSend(invoice)}
                                  disabled={!invoice.isApproved}
                                  title={!invoice.isApproved ? "Requires admin approval before sending" : undefined}
                                >
                                  Send Invoice
                                </Button>
                              </div>
                            ) : status === "sent" ? (
                              <div className="flex flex-col items-start">
                                <Button
                                  variant="link"
                                  className="text-xs h-auto p-0 text-slate-500 hover:text-blue-600 cursor-pointer"
                                  onClick={() => setSelectedInvoiceForSend(invoice)}
                                >
                                  Resend
                                </Button>
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

      {selectedInvoiceForSend && (
        <SendInvoiceModal
          open={Boolean(selectedInvoiceForSend)}
          onOpenChange={(open) => {
            if (!open) setSelectedInvoiceForSend(null);
          }}
          invoiceId={selectedInvoiceForSend._id}
          customerEmail={selectedInvoiceForSend.customerEmail}
          customerName={selectedInvoiceForSend.customerName}
          approvalStatus={selectedInvoiceForSend.approvalStatus}
          workflowStatus={selectedInvoiceForSend.workflowStatus}
          status={selectedInvoiceForSend.status}
          revision={selectedInvoiceForSend.revision}
          approvedRevision={selectedInvoiceForSend.approvedRevision}
        />
      )}
    </>
  );
}
