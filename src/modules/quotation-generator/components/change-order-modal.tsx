import { useState, useEffect } from "react";
import { RefreshCw, Download, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SaveEstimatePayload } from "../estimates.api";
import {
  createChangeOrderProvider,
  downloadChangeOrderPdfProvider,
  getChangeOrderDocumentProvider,
  getChangeOrdersListProvider,
  type ChangeOrderRecord,
} from "../change-orders.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";

interface ChangeOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: SaveEstimatePayload | null;
  onSuccess?: () => void;
}

function ChangeOrderContent({
  quote,
  onOpenChange,
  onSuccess,
}: {
  quote: SaveEstimatePayload | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const initialCustomer =
    quote?.leadCompanyName ||
    quote?.extractedDrawingFields?.customer ||
    quote?.cityStateZip ||
    "Farmer DEVELOPMENT";

  const initialCoDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const rawDate = quote?.quoteDate || quote?.createdAt;
  const initialOrigDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Oct 19, 2026";

  const pricingRes = (quote?.pricingResult || quote?.storagePricingResult) as
    | Record<string, unknown>
    | undefined;
  const fullQuote = quote?.fullQuoteResult as
    | Record<string, unknown>
    | undefined;
  const initialOrigValue =
    Number(
      quote?.grandTotal ??
        quote?.totalSell ??
        fullQuote?.grandTotal ??
        pricingRes?.totSell ??
        pricingRes?.grandTotal,
    ) || 3512753;

  const [customer] = useState(initialCustomer);
  const [coDate] = useState(initialCoDate);
  const [origContractDate] = useState(initialOrigDate);
  const [origContractValue] = useState<number>(initialOrigValue);
  const [description, setDescription] = useState("");
  const [sellAmount, setSellAmount] = useState<string>("");
  const [costAmount, setCostAmount] = useState<string>("");
  const [marginPctInput, setMarginPctInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingCOs, setExistingCOs] = useState<ChangeOrderRecord[]>([]);

  useEffect(() => {
    if (quote?._id) {
      getChangeOrdersListProvider({ estimateId: quote._id })
        .then((items) => setExistingCOs(items))
        .catch(() => {});
    }
  }, [quote?._id]);

  const nextCoNum = existingCOs.length + 1;

  // Derived Calculations
  const parsedSell = parseFloat(sellAmount) || 0;
  const parsedCost = parseFloat(costAmount) || 0;
  const revisedTotal = origContractValue + parsedSell;
  const hasSell = sellAmount.trim() !== "" && !isNaN(parsedSell);
  const hasCost = costAmount.trim() !== "" && !isNaN(parsedCost);
  const coProfit = hasSell && hasCost ? parsedSell - parsedCost : null;
  const marginPct =
    coProfit !== null && parsedSell > 0 ? (coProfit / parsedSell) * 100 : null;

  const handleSellChange = (val: string) => {
    if (formError) setFormError(null);
    setSellAmount(val);
    const s = parseFloat(val);
    const c = parseFloat(costAmount);
    const m = parseFloat(marginPctInput);

    if (!isNaN(s) && !isNaN(c) && s > 0) {
      setMarginPctInput((((s - c) / s) * 100).toFixed(1));
    } else if (!isNaN(s) && !isNaN(m) && m < 100 && !costAmount) {
      setCostAmount((s * (1 - m / 100)).toFixed(2));
    }
  };

  const handleCostChange = (val: string) => {
    if (formError) setFormError(null);
    setCostAmount(val);
    const c = parseFloat(val);
    const s = parseFloat(sellAmount);
    const m = parseFloat(marginPctInput);

    if (!isNaN(c) && !isNaN(m) && m < 100) {
      setSellAmount((c / (1 - m / 100)).toFixed(2));
    } else if (!isNaN(c) && !isNaN(s) && s > 0) {
      setMarginPctInput((((s - c) / s) * 100).toFixed(1));
    }
  };

  const handleMarginChange = (val: string) => {
    if (formError) setFormError(null);
    setMarginPctInput(val);
    const m = parseFloat(val);
    const c = parseFloat(costAmount);
    const s = parseFloat(sellAmount);

    if (!isNaN(m) && !isNaN(c) && c > 0 && m < 100) {
      setSellAmount((c / (1 - m / 100)).toFixed(2));
    } else if (!isNaN(m) && !isNaN(s) && s > 0 && m < 100) {
      setCostAmount((s * (1 - m / 100)).toFixed(2));
    }
  };

  const handleDownloadExistingPdf = async (co: ChangeOrderRecord) => {
    if (formError) setFormError(null);
    try {
      const pdfRes = await downloadChangeOrderPdfProvider(co._id);
      let b64 = pdfRes?.data?.fileBase64 || pdfRes?.fileBase64;
      let fn = pdfRes?.data?.fileName || pdfRes?.fileName;
      if (!b64) {
        const docRes = await getChangeOrderDocumentProvider(co._id, { format: "pdf" });
        b64 = docRes?.fileBase64;
        fn = docRes?.fileName || fn;
      }
      if (b64) {
        downloadPdfFromBase64(b64, fn || `Change-Order-${co.coNum}.pdf`);
      } else {
        setFormError(`PDF file data is not available for CO #${co.coNum}.`);
      }
    } catch (err: unknown) {
      console.error("Failed to download existing change order PDF:", err);
      const apiErrorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : null) ||
        `Failed to download PDF for CO #${co.coNum}.`;
      setFormError(apiErrorMsg);
    }
  };

  const handleSaveAndDownloadPdf = async () => {
    if (!description.trim()) {
      setFormError("Please enter a description for the change order.");
      return;
    }
    if (!parsedSell) {
      setFormError("Please enter a valid sell amount.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const coRecord = await createChangeOrderProvider({
        estimateId: quote?._id,
        parentQuoteRef: quote?._id ? undefined : String(quote?.id || ""),
        customer,
        coDate,
        origDate: origContractDate,
        origVal: origContractValue,
        amount: parsedSell,
        cost: parsedCost,
        description,
        company: "SM",
      });

      let fileBase64: string | undefined;
      let fileName: string | undefined;

      // 1. Call POST /api/sales/change-orders/:coId/pdf without format to receive PDF base64
      try {
        const pdfRes = await downloadChangeOrderPdfProvider(coRecord._id);
        const dataObj = pdfRes?.data;
        fileBase64 = dataObj?.fileBase64 || pdfRes?.fileBase64;
        fileName = dataObj?.fileName || pdfRes?.fileName;
      } catch (pdfErr) {
        console.warn("Change order PDF endpoint failed, attempting document PDF endpoint:", pdfErr);
      }

      // 2. Fallback to GET /api/sales/change-orders/:coId/document?format=pdf if base64 not yet present
      if (!fileBase64) {
        try {
          const docRes = await getChangeOrderDocumentProvider(coRecord._id, { format: "pdf" });
          fileBase64 = docRes?.fileBase64;
          fileName = docRes?.fileName || fileName;
        } catch (docErr) {
          console.error("Failed to fetch change order document PDF:", docErr);
        }
      }

      // 3. Download the PDF directly (no preview generated)
      if (fileBase64) {
        downloadPdfFromBase64(
          fileBase64,
          fileName || `Change-Order-${coRecord.coNum || nextCoNum}.pdf`
        );
        toast.success(
          `Change Order #${coRecord.coNum || nextCoNum} created and PDF downloaded!`
        );
        onSuccess?.();
        onOpenChange(false);
      } else {
        setFormError(
          `Change Order #${coRecord.coNum || nextCoNum} saved, but PDF data could not be downloaded from the server.`
        );
        onSuccess?.();
      }
    } catch (err: unknown) {
      console.error("Failed to save change order:", err);
      const resData = (err as {
        response?: {
          data?: {
            message?: string;
            errors?: {
              finalize?: { hint?: string; message?: string } | string;
            };
          };
        };
      })?.response?.data;

      const finalizeObj = resData?.errors?.finalize;
      const finalizeHint =
        typeof finalizeObj === "object"
          ? finalizeObj?.hint || finalizeObj?.message
          : finalizeObj;

      const apiErrorMsg =
        finalizeHint ||
        resData?.message ||
        (err instanceof Error ? err.message : null) ||
        "Failed to save change order. Please try again.";
      setFormError(apiErrorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Navy Header */}
      <div className="bg-[#1e3a8a] text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-white tracking-wide">
              Change Order #{nextCoNum}
            </DialogTitle>
            <div className="text-xs text-blue-100 font-normal">
              {customer} · Original contract: $
              {origContractValue.toLocaleString()}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Form Body */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-white">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium leading-relaxed">{formError}</div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-400 hover:text-red-700 cursor-pointer p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              CUSTOMER
            </Label>
            <Input
              disabled
              value={customer}
              placeholder="Customer Name"
              className="h-10 text-sm font-medium border-slate-300 bg-slate-100/70 text-slate-700 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              CO DATE
            </Label>
            <Input
              disabled
              value={coDate}
              placeholder="Date"
              className="h-10 text-sm font-medium border-slate-300 bg-slate-100/70 text-slate-700 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              ORIGINAL CONTRACT DATE
            </Label>
            <Input
              disabled
              value={origContractDate}
              placeholder="Original Date"
              className="h-10 text-sm font-medium border-slate-300 bg-slate-100/70 text-slate-700 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              ORIGINAL CONTRACT VALUE
            </Label>
            <Input
              disabled
              type="number"
              value={origContractValue || ""}
              placeholder="3512753"
              className="h-10 text-sm font-medium border-slate-300 bg-slate-100/70 text-slate-700 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            DESCRIPTION OF CHANGE
          </Label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => {
              if (formError) setFormError(null);
              setDescription(e.target.value);
            }}
            placeholder="e.g. Added 1 additional 30x50 storage unit, upgraded roof panel to Galvalume..."
            className="text-sm resize-none border-slate-300"
          />
        </div>

        {/* PRICING Section */}
        <div className="pt-2">
          <div className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider mb-2">
            PRICING
          </div>
          <hr className="border-slate-200 mb-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                CO SELL AMOUNT (+/-)
              </Label>
              <Input
                type="number"
                value={sellAmount}
                onChange={(e) => handleSellChange(e.target.value)}
                placeholder="e.g. 12500"
                className="h-10 text-sm border-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                CO COST (COGS)
              </Label>
              <Input
                type="number"
                value={costAmount}
                onChange={(e) => handleCostChange(e.target.value)}
                placeholder="Your Cost"
                className="h-10 text-sm border-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                MARGIN %
              </Label>
              <Input
                type="number"
                value={marginPctInput}
                onChange={(e) => handleMarginChange(e.target.value)}
                placeholder="e.g. 10"
                className="h-10 text-sm border-slate-300"
              />
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                REVISED TOTAL
              </div>
              <div className="text-lg font-black text-[#1e3a8a] mt-1.5">
                ${Math.round(revisedTotal).toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                CO COST
              </div>
              <div className="text-lg font-bold text-slate-700 mt-1.5">
                {hasCost ? `$${Math.round(parsedCost).toLocaleString()}` : "-"}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                CO PROFIT
              </div>
              <div className="text-lg font-bold text-slate-700 mt-1.5">
                {coProfit !== null
                  ? `$${Math.round(coProfit).toLocaleString()}`
                  : "-"}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                MARGIN
              </div>
              <div className="text-lg font-bold text-slate-700 mt-1.5">
                {marginPct !== null ? `${marginPct.toFixed(1)}%` : "-"}
              </div>
            </div>
          </div>

          {/* Prior Change Orders List */}
          {existingCOs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Prior Change Orders ({existingCOs.length})
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {existingCOs.map((co) => (
                  <div
                    key={co._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1e3a8a]">CO #{co.coNum}</span>
                        <span className="font-semibold text-slate-700">
                          {co.amount >= 0
                            ? `+$${Number(co.amount).toLocaleString()}`
                            : `-$${Math.abs(Number(co.amount)).toLocaleString()}`}
                        </span>
                        {co.createdAt && (
                          <span className="text-[11px] text-slate-400">
                            · {new Date(co.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {co.description && (
                        <p className="text-slate-500 truncate text-[11px] mt-0.5">
                          {co.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadExistingPdf(co)}
                      className="h-7 px-2.5 text-[11px] font-semibold text-[#1e3a8a] border-blue-200 hover:bg-blue-50 shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer font-medium"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSaveAndDownloadPdf}
          className="bg-[#1e3a8a] hover:bg-[#172554] text-white cursor-pointer font-semibold flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isSubmitting ? "Saving & Downloading..." : "Save & Download PDF"}
        </Button>
      </div>
    </>
  );
}

export function ChangeOrderModal({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: ChangeOrderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] sm:max-w-2xl p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-lg flex flex-col"
      >
        {open && (
          <ChangeOrderContent
            key={quote?._id || "change-order"}
            quote={quote}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
