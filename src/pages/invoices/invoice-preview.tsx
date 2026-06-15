import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Wallet } from "lucide-react";
import logo from "@/assets/steel-building-depot-logo.png";
import SuccessDialog from "@/components/success-dialog";
import {
  useInvoiceDetailQuery,
  useSendInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInvoiceDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatStageName(
  name: string | null | undefined,
  amount: number | null | undefined,
  amountType: string | null | undefined,
) {
  const stageName = name || "Payment";
  if (amountType === "percentage" && amount != null) {
    const pctStr = `${amount}%`;
    if (!stageName.includes("%")) {
      return `${stageName} (${pctStr})`;
    }
  }
  return stageName;
}

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

  const items =
    invoice?.lineItems?.map((item, index) => ({
      id:
        item._id ??
        item.id ??
        `${invoice?._id ?? invoiceId ?? "item"}-${index}`,
      description: item.description ?? undefined,
      notes: item.notes ?? undefined,
      rate: item.rate ?? 0,
      quantity: item.quantity ?? 0,
      total: item.total ?? (item.rate ?? 0) * (item.quantity ?? 0),
      images: item.images ?? item.photos ?? [],
      tax: item.tax ?? 0,
      items: item.items ?? [],
    })) ?? [];

  const invoiceNumber = invoice?.invoiceNumber ?? "-";
  const date = formatInvoiceDate(invoice?.date);
  const daysToPay = invoice?.daysToPay ?? "-";
  const subtotal = invoice?.subtotal ?? 0;
  const taxAmount = invoice?.lineItems?.reduce((sum, item) => sum + (item.tax ?? 0), 0) ?? 0;
  const markup = invoice?.markupTotal ?? 0;
  const discount = invoice?.discount ?? 0;
  const total = invoice?.totalAmount ?? 0;
  const deposit = invoice?.depositAmount ?? total * 0.25;
  const stages = paymentSchedule?.stages ?? [];

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

        <div className="bg-white rounded-lg p-6 sm:p-14 shadow-sm mx-auto max-w-8xl">
          <h1 className="text-center text-gray-300 font-bold text-md md:text-xl tracking-widest uppercase mb-12">
            Invoice
          </h1>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 ">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center shrink-0">
                  <img src={logo} alt="Logo" className="h-12  object-contain" />
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed">
                1851 Madison Ave Suite 300
                <br />
                Council Bluffs, IA
                <br />
                51503
                <br />
                United States
                <br />
                travis@storagematerials.com
                <br />
                www.storagematerials.com
              </div>
            </div>

            <div className="min-w-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Payment terms</span>
                <span className="text-gray-900">
                  {daysToPay === "-" ? "-" : `${daysToPay} days`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Invoice #</span>
                <span className="text-gray-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Date</span>
                <span className="text-gray-900">{date}</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  Business/Tax #
                </span>
                <span className="text-gray-900">99- 4515145</span>
              </div> */}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12">
            <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
              <span className="text-sm font-bold text-gray-700">
                Description
              </span>
              <div className="flex gap-8">
                <span className="text-sm font-bold text-gray-700 w-20 text-right">Rate</span>
                <span className="text-sm font-bold text-gray-700 w-12 text-right">Qty</span>
                <span className="text-sm font-bold text-gray-700 w-16 text-right">Tax</span>
                <span className="text-sm font-bold text-gray-700 w-24 text-right">Total</span>
              </div>
            </div>

            <div className="space-y-8">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={index > 0 ? "border-t border-gray-100 pt-4" : ""}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {item.description || "Item Description"}
                    </span>
                    <div className="flex gap-8">
                      <span className="text-sm text-gray-500 w-20 text-right">
                        ${formatCurrency(item.rate)}
                      </span>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {item.quantity}
                      </span>
                      <span className="text-sm text-gray-500 w-16 text-right">
                        ${formatCurrency(item.tax)}
                      </span>
                      <span className="text-sm text-gray-600 w-24 text-right">
                        $
                        {formatCurrency(
                          item.total ?? (item.rate ?? 0) * (item.quantity ?? 0),
                        )}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-[10px] text-gray-400 mb-2">
                      {item.notes}
                    </div>
                  )}

                  {item.items && item.items.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap mb-3">
                      {item.items.map((it: string, i: number) => (
                        <div
                          key={i}
                          className="bg-gray-50 border border-gray-100 text-gray-500 rounded px-2 py-0.5 text-[10px]"
                        >
                          {it}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display Photos if any */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-3 mb-4">
                      {item.images.map((photo: string, i: number) => (
                        <div
                          key={i}
                          className="w-64 h-40 overflow-hidden rounded-sm bg-gray-100"
                        >
                          {/* Use the photo URL if it looks like a blob/url, otherwise placeholder */}
                          <img
                            src={
                              photo.startsWith("blob:") ||
                                photo.startsWith("http")
                                ? photo
                                : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop"
                            }
                            alt={`Item photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Fallback to show something if no items */}
              {items.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-4">
                  No line items available
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-bold">Subtotal</span>
                <span className="text-gray-500">
                  ${formatCurrency(Number(subtotal))}
                </span>
              </div>
              {markup > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Markup</span>
                  <span className="text-emerald-600 font-medium">
                    ${formatCurrency(Number(markup))}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Discount</span>
                  <span className="text-red-600 font-medium">
                    -${formatCurrency(Number(discount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm border-b border-gray-100 pb-3">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-500">
                  ${formatCurrency(Number(taxAmount))}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-gray-900 font-bold">
                  ${formatCurrency(Number(total))}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-medium">Deposit Due</span>
                <span className="text-gray-900 font-bold">
                  ${formatCurrency(Number(deposit))}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Schedule Section */}
          {stages.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-800 flex justify-end">
              <div className="w-full lg:w-3/4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Payment Schedule
                </h2>
                <div className="border-t border-b border-gray-200 divide-y divide-gray-100">
                  {stages.map((stage) => {
                    const label = formatStageName(
                      stage.stageName,
                      stage.amount,
                      stage.amountType,
                    );
                    const amount =
                      stage.amountType === "percentage"
                        ? (total * (stage.amount ?? 0)) / 100
                        : (stage.amount ?? 0);

                    return (
                      <div
                        key={stage._id}
                        className="flex justify-between py-3 text-sm"
                      >
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="text-gray-900 font-bold">
                          ${formatCurrency(amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-[10px] text-gray-500 mb-8">
              Thank you for your business? Reach out with any questions
            </p>
            <p className="text-[10px] text-gray-500 mb-16">
              By Signing this document the customer agrees to the services and
              conditions outlined in this document
            </p>

            <div className="flex justify-end">
              <div className="border-t border-gray-400 w-64 pt-2">
                <p className="text-xs text-gray-500">Client signature</p>
              </div>
            </div>
          </div>
        </div>
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
