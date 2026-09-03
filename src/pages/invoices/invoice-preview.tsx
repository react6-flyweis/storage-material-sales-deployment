import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Send, Edit } from "lucide-react";
import SuccessDialog from "@/components/success-dialog";
import {
  useInvoiceDetailQuery,
  useSendInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import InvoiceTemplate from "@/components/invoice/invoice-template";
import {
  WorkflowStatusBadge,
  SubmitApprovalDialog,
  ApprovalHistoryTimeline,
} from "@/components/invoice/approval-modals";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const params = useParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const invoiceId = params.id;
  const {
    data: invoiceDetailResponse,
    isLoading,
    isError,
  } = useInvoiceDetailQuery(invoiceId);
  const sendInvoiceMutation = useSendInvoiceMutation();

  const handleSendEmail = async () => {
    if (!invoiceId || sendInvoiceMutation.isPending) {
      return;
    }

    setSendFailed(false);

    try {
      const response = await sendInvoiceMutation.mutateAsync(invoiceId);
      if (!response.success) {
        console.error("Failed to send invoice email:", response);
        setSendFailed(true);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      setSendFailed(true);
    }
  };

  const invoice = invoiceDetailResponse?.data.invoice;
  const paymentSchedule = invoiceDetailResponse?.data.paymentSchedule;

  if (!invoiceId) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Open an invoice from the list to preview it.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Invoice details could not be loaded.
        </div>
      </div>
    );
  }

  const approvalStatus = invoice.approval?.status || "not_submitted";
  const workflowStatus = invoice.workflowStatus || invoice.status;
  const isApproved = approvalStatus === "approved";
  const isRejected = approvalStatus === "rejected";
  const isNotSubmitted =
    approvalStatus === "not_submitted" || workflowStatus === "draft";
  const isSent = invoice.status === "sent";
  const isPaid = invoice.status === "paid";

  // Check revision mismatch (if edited after approval)
  const isRevisionMismatch = Boolean(
    isApproved &&
    invoice.approval?.approvedRevision !== undefined &&
    invoice.approval?.approvedRevision !== null &&
    invoice.revision !== undefined &&
    invoice.revision !== null &&
    invoice.approval.approvedRevision !== invoice.revision,
  );

  const canSendInvoice =
    isApproved && !isRevisionMismatch && !isSent && !isPaid;
  const canEditInvoice = !isSent && !isPaid;
  const canSubmitForApproval =
    (isNotSubmitted || isRejected || isRevisionMismatch) && !isSent && !isPaid;

  return (
    <>
      <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6 max-w-7xl mr-auto">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 mt-1">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 gap-1.5"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <WorkflowStatusBadge
              workflowStatus={workflowStatus}
              approvalStatus={approvalStatus}
              invoiceStatus={invoice.status}
            />
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Edit Button */}
              {canEditInvoice && (
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 gap-1.5"
                  onClick={() => navigate("edit")}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}

              {/* Submit / Resubmit for Approval Button */}
              {canSubmitForApproval && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <Send className="w-4 h-4" />
                  {isRejected ? "Resubmit for Approval" : "Submit for Approval"}
                </Button>
              )}

              {/* Email / Send Button */}
              {!isSent && !isPaid && (
                <Button
                  className="bg-[#2563EB] hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendEmail}
                  disabled={!canSendInvoice || sendInvoiceMutation.isPending}
                  title={
                    !isApproved
                      ? "Admin approval is required before sending invoice to customer"
                      : isRevisionMismatch
                        ? "Invoice edited after approval. Please resubmit."
                        : undefined
                  }
                >
                  <Mail className="w-4 h-4" />
                  {sendInvoiceMutation.isPending
                    ? "Sending..."
                    : "Email Invoice"}
                </Button>
              )}

              {/* Payments button commented out as requested */}
              {/* <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              >
                <Wallet className="w-4 h-4 mr-1.5" />
                Payments
              </Button> */}
            </div>

            {sendFailed && (
              <p className="text-xs text-destructive">
                Send failed. Please try again.
              </p>
            )}
          </div>
        </div>

        {/* Main Invoice Document Template */}
        <InvoiceTemplate invoice={invoice} paymentSchedule={paymentSchedule} />

        {/* Approval History & Audit Trail */}
        <ApprovalHistoryTimeline history={invoice.approval?.history} />
      </div>

      {/* Submit for Approval Dialog */}
      <SubmitApprovalDialog
        invoiceId={invoice._id}
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
      />

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Email Sent"
        okLabel="Done"
      />
    </>
  );
}
