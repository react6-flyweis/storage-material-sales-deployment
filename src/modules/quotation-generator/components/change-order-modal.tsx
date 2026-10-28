import { useState, useEffect } from "react";
import { RefreshCw, Printer, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SaveEstimatePayload } from "../estimates.api";
import {
  createChangeOrderProvider,
  downloadChangeOrderPdfProvider,
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

  const pricingRes = (quote?.pricingResult ||
    quote?.storagePricingResult) as Record<string, unknown> | undefined;
  const fullQuote = quote?.fullQuoteResult as Record<string, unknown> | undefined;
  const initialOrigValue =
    Number(
      quote?.grandTotal ??
        quote?.totalSell ??
        fullQuote?.grandTotal ??
        pricingRes?.totSell ??
        pricingRes?.grandTotal,
    ) || 3512753;

  const [customer, setCustomer] = useState(initialCustomer);
  const [coDate, setCoDate] = useState(initialCoDate);
  const [origContractDate, setOrigContractDate] = useState(initialOrigDate);
  const [origContractValue, setOrigContractValue] = useState<number>(initialOrigValue);
  const [description, setDescription] = useState("");
  const [sellAmount, setSellAmount] = useState<string>("");
  const [costAmount, setCostAmount] = useState<string>("");
  const [markupPct, setMarkupPct] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const coProfit = parsedSell && parsedCost ? parsedSell - parsedCost : null;
  const marginPct =
    coProfit !== null && parsedSell > 0 ? (coProfit / parsedSell) * 100 : null;

  const handleSellChange = (val: string) => {
    setSellAmount(val);
    const s = parseFloat(val);
    const m = parseFloat(markupPct);
    if (!isNaN(s) && !isNaN(m) && m > 0 && !costAmount) {
      setCostAmount((s / (1 + m / 100)).toFixed(2));
    }
  };

  const handleCostChange = (val: string) => {
    setCostAmount(val);
    const c = parseFloat(val);
    const m = parseFloat(markupPct);
    if (!isNaN(c) && !isNaN(m) && m > 0) {
      setSellAmount((c * (1 + m / 100)).toFixed(2));
    }
  };

  const handleMarkupChange = (val: string) => {
    setMarkupPct(val);
    const m = parseFloat(val);
    const c = parseFloat(costAmount);
    if (!isNaN(m) && !isNaN(c) && c > 0) {
      setSellAmount((c * (1 + m / 100)).toFixed(2));
    }
  };

  const openClientPrintPopup = () => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      toast.error("Please allow popups to print Change Order");
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Change Order #${nextCoNum} - ${customer}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .field-value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }
            .section-title { font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 24px; margin-bottom: 16px; }
            .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .card-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .card-value { font-size: 18px; font-weight: 800; color: #1e3a8a; margin-top: 4px; }
            .desc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; min-height: 60px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sign-line { border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">CHANGE ORDER #${nextCoNum}</h1>
            <div class="subtitle">${customer} · Original Contract: $${origContractValue.toLocaleString()}</div>
          </div>
          <div class="grid">
            <div>
              <div class="field-label">Customer</div>
              <div class="field-value">${customer}</div>
            </div>
            <div>
              <div class="field-label">Change Order Date</div>
              <div class="field-value">${coDate}</div>
            </div>
            <div>
              <div class="field-label">Original Contract Date</div>
              <div class="field-value">${origContractDate}</div>
            </div>
            <div>
              <div class="field-label">Original Contract Value</div>
              <div class="field-value">$${origContractValue.toLocaleString()}</div>
            </div>
          </div>

          <div class="section-title">Description of Change</div>
          <div class="desc-box">${description || "No description provided."}</div>

          <div class="section-title">Pricing Breakdown</div>
          <div class="grid">
            <div>
              <div class="field-label">Change Order Sell Amount (+/-)</div>
              <div class="field-value">${parsedSell ? `$${parsedSell.toLocaleString()}` : "$0"}</div>
            </div>
            <div>
              <div class="field-label">Change Order Cost</div>
              <div class="field-value">${parsedCost ? `$${parsedCost.toLocaleString()}` : "$0"}</div>
            </div>
          </div>

          <div class="cards">
            <div class="card">
              <div class="card-label">Revised Total</div>
              <div class="card-value">$${revisedTotal.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">CO Cost</div>
              <div class="card-value">${parsedCost ? `$${parsedCost.toLocaleString()}` : "-"}</div>
            </div>
            <div class="card">
              <div class="card-label">CO Profit</div>
              <div class="card-value">${coProfit !== null ? `$${coProfit.toLocaleString()}` : "-"}</div>
            </div>
            <div class="card">
              <div class="card-label">Margin</div>
              <div class="card-value">${marginPct !== null ? `${marginPct.toFixed(1)}%` : "-"}</div>
            </div>
          </div>

          <div class="signatures">
            <div>
              <div class="sign-line">Authorized Customer Signature & Date</div>
            </div>
            <div>
              <div class="sign-line">Contractor / Sales Rep Signature & Date</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const handlePrintPdf = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description for the change order");
      return;
    }
    if (!parsedSell) {
      toast.error("Please enter a valid sell amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const coRecord = await createChangeOrderProvider({
        estimateId: quote?._id,
        parentQuoteRef: quote?._id ? undefined : String(quote?.id || ""),
        customer,
        origDate: origContractDate,
        origVal: origContractValue,
        amount: parsedSell,
        cost: parsedCost,
        description,
        company: "SM",
      });

      const pdfRes = await downloadChangeOrderPdfProvider(coRecord._id).catch(() => null);
      const b64 = pdfRes?.data?.fileBase64 || pdfRes?.fileBase64;
      if (b64) {
        downloadPdfFromBase64(
          b64,
          pdfRes?.data?.fileName || pdfRes?.fileName || `Change-Order-${coRecord.coNum || nextCoNum}.pdf`
        );
        toast.success(`Change Order #${coRecord.coNum || nextCoNum} created and PDF downloaded!`);
      } else {
        openClientPrintPopup();
        toast.success(`Change Order #${coRecord.coNum || nextCoNum} saved successfully!`);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save change order to server, using client print:", err);
      openClientPrintPopup();
      toast.success("Change Order printed");
      onSuccess?.();
      onOpenChange(false);
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
              {customer} · Original contract: ${origContractValue.toLocaleString()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              CUSTOMER
            </Label>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer Name"
              className="h-10 text-sm font-medium border-slate-300"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              CO DATE
            </Label>
            <Input
              value={coDate}
              onChange={(e) => setCoDate(e.target.value)}
              placeholder="Date"
              className="h-10 text-sm font-medium border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              ORIGINAL CONTRACT DATE
            </Label>
            <Input
              value={origContractDate}
              onChange={(e) => setOrigContractDate(e.target.value)}
              placeholder="Original Date"
              className="h-10 text-sm font-medium border-slate-300"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              ORIGINAL CONTRACT VALUE
            </Label>
            <Input
              type="number"
              value={origContractValue || ""}
              onChange={(e) => setOrigContractValue(Number(e.target.value))}
              placeholder="3512753"
              className="h-10 text-sm font-medium border-slate-300"
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
            onChange={(e) => setDescription(e.target.value)}
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
                MARKUP %
              </Label>
              <Input
                type="number"
                value={markupPct}
                onChange={(e) => handleMarkupChange(e.target.value)}
                placeholder="e.g. 25"
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
                {parsedCost ? `$${Math.round(parsedCost).toLocaleString()}` : "-"}
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
          onClick={handlePrintPdf}
          className="bg-[#1e3a8a] hover:bg-[#172554] text-white cursor-pointer font-semibold flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          {isSubmitting ? "Generating..." : "Save & Create PDF"}
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
        className="max-h-[85vh] sm:max-w-md p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl flex flex-col"
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
