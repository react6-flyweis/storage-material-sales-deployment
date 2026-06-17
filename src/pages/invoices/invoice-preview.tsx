import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Wallet } from "lucide-react";
import SuccessDialog from "@/components/success-dialog";
import {
  useInvoiceDetailQuery,
  useSendInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import InvoiceTemplate from "@/components/invoice/invoice-template";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const params = useParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
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

  return (
    <>
      <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6">
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-3 mt-1 max-w-7xl gap-4 mr-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-25"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
              {invoice?.status === "draft" && (
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-25"
                  onClick={() => navigate("edit")}
                >
                  Edit
                </Button>
              )}
              <Button
                className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-25 gap-2"
                onClick={handleSendEmail}
                disabled={sendInvoiceMutation.isPending}
              >
                <Mail className="w-4 h-4" />
                {sendInvoiceMutation.isPending ? "Sending..." : "Email"}
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-25"
              >
                <Wallet />
                Payments
              </Button>
            </div>
            {sendFailed && (
              <p className="text-[10px] text-destructive">Send failed</p>
            )}
          </div>
        </div>

        <InvoiceTemplate invoice={invoice} paymentSchedule={paymentSchedule} />
      </div>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Email Sent"
        okLabel="Done"
      />
    </>
  );
}

