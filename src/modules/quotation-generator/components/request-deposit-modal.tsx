import { useState } from "react";
import { Printer, X, Loader2 } from "lucide-react";
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
import {
  type SaveEstimatePayload,
  saveEstimateDepositProvider,
  downloadDepositReceiptPdfProvider,
} from "../estimates.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";

interface RequestDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: SaveEstimatePayload | null;
  onSuccess?: () => void;
}

function RequestDepositContent({
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
    "Farmer DEVELOPMENT";

  const rawDate = quote?.quoteDate || quote?.createdAt;
  const initialDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Oct 19, 2026";

  const initialLocation =
    quote?.cityStateZip ||
    quote?.streetAddress ||
    "San Antonio, TX";

  const initialBuildingSize =
    quote?.buildingSize ||
    (quote?.squareFootage ? `${quote.squareFootage.toLocaleString()} SF` : "165X269");

  const pricingRes = (quote?.pricingResult ||
    quote?.storagePricingResult) as Record<string, unknown> | undefined;
  const fullQuote = quote?.fullQuoteResult as Record<string, unknown> | undefined;
  const initialTotal =
    Number(
      quote?.grandTotal ??
        quote?.totalSell ??
        fullQuote?.grandTotal ??
        pricingRes?.totSell ??
        pricingRes?.grandTotal,
    ) || 3512753;

  const [customer] = useState(initialCustomer);
  const [quoteDate] = useState(initialDate);
  const [location] = useState(initialLocation);
  const [buildingSize] = useState(initialBuildingSize);
  const [totalContractValue] = useState<number>(initialTotal);
  const [depositPct, setDepositPct] = useState<string>("30");
  const [flatAmount, setFlatAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived Calculations
  let depositDue = 0;
  if (flatAmount && !isNaN(parseFloat(flatAmount))) {
    depositDue = parseFloat(flatAmount);
  } else {
    const pct = parseFloat(depositPct) || 0;
    depositDue = (totalContractValue * pct) / 100;
  }
  const balanceDue = Math.max(0, totalContractValue - depositDue);

  const handlePctChange = (val: string) => {
    setDepositPct(val);
    setFlatAmount("");
  };

  const handleFlatAmountChange = (val: string) => {
    setFlatAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && totalContractValue > 0) {
      const pct = (parsed / totalContractValue) * 100;
      setDepositPct(pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1));
    }
  };

  const openClientPrintPopup = () => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      toast.error("Please allow popups to print Deposit Invoice");
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deposit Invoice - ${customer}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .field-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .total-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
            .total-label { font-size: 12px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; }
            .total-val { font-size: 32px; font-weight: 800; color: #1e3a8a; margin-top: 4px; }
            .deposit-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
            .deposit-label { font-size: 13px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; }
            .deposit-val { font-size: 36px; font-weight: 800; color: #16a34a; margin: 8px 0; }
            .deposit-sub { font-size: 14px; font-weight: 600; color: #475569; }
            .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 13px; margin-bottom: 30px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sign-line { border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">DEPOSIT INVOICE</h1>
            <div class="subtitle">${customer} · Date: ${quoteDate}</div>
          </div>
          <div class="grid">
            <div>
              <div class="field-label">Customer</div>
              <div class="field-value">${customer}</div>
            </div>
            <div>
              <div class="field-label">Date</div>
              <div class="field-value">${quoteDate}</div>
            </div>
            <div>
              <div class="field-label">Location</div>
              <div class="field-value">${location}</div>
            </div>
            <div>
              <div class="field-label">Building Size</div>
              <div class="field-value">${buildingSize}</div>
            </div>
          </div>

          <div class="total-box">
            <div class="total-label">Total Contract Value</div>
            <div class="total-val">$${totalContractValue.toLocaleString()}</div>
          </div>

          <div class="deposit-box">
            <div class="deposit-label">Deposit Due (${depositPct}%)</div>
            <div class="deposit-val">$${Math.round(depositDue).toLocaleString()}</div>
            <div class="deposit-sub">Balance due at delivery: $${Math.round(balanceDue).toLocaleString()}</div>
          </div>

          <div class="field-label" style="margin-bottom: 6px;">Notes / Payment Instructions</div>
          <div class="notes-box">${notes || "All payments via wire transfer or check to storage materials account."}</div>

          <div class="signatures">
            <div>
              <div class="sign-line">Authorized Customer Signature & Date</div>
            </div>
            <div>
              <div class="sign-line">Received / Confirmed By</div>
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

  const handlePrintInvoice = async () => {
    setIsSubmitting(true);
    const parsedPct = parseFloat(depositPct) || undefined;
    const parsedFlat = parseFloat(flatAmount) || undefined;

    try {
      if (quote?._id) {
        await saveEstimateDepositProvider(quote._id, {
          pct: parsedPct,
          flat: parsedFlat,
          note: notes,
          grand: totalContractValue,
        }).catch((err) => console.warn("Could not save deposit to estimate:", err));
      }

      const receiptRes = await downloadDepositReceiptPdfProvider({
        estimateId: quote?._id,
        quote,
        grand: totalContractValue,
        pct: parsedPct,
        flat: parsedFlat,
        note: notes,
      }).catch(() => null);

      const b64 = receiptRes?.data?.fileBase64 || receiptRes?.fileBase64;
      if (b64) {
        downloadPdfFromBase64(
          b64,
          receiptRes?.data?.fileName || receiptRes?.fileName || `Deposit-Receipt-${customer}.pdf`
        );
        toast.success("Deposit Receipt PDF downloaded successfully");
      } else {
        openClientPrintPopup();
        toast.success("Deposit Invoice printed");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error processing deposit receipt:", err);
      openClientPrintPopup();
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
        <div className="flex items-center gap-2">
          <span className="text-lg">🧾</span>
          <DialogTitle className="text-base font-bold text-white tracking-wide">
            Request Deposit
          </DialogTitle>
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
        {/* Top 4 items grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              CUSTOMER
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {customer}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              DATE
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {quoteDate}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              LOCATION
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {location}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              BUILDING SIZE
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {buildingSize}
            </div>
          </div>
        </div>

        {/* TOTAL CONTRACT VALUE Banner Card */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-center">
          <div className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
            TOTAL CONTRACT VALUE
          </div>
          <div className="text-3xl font-black text-[#1e3a8a] mt-1">
            ${totalContractValue.toLocaleString()}
          </div>
        </div>

        {/* Deposit Percent or Flat Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              DEPOSIT %
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={depositPct}
                onChange={(e) => handlePctChange(e.target.value)}
                placeholder="30"
                className="h-10 text-sm font-medium border-slate-300 w-24 text-center"
              />
              <span className="text-sm font-bold text-slate-600">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              - OR FLAT AMOUNT -
            </Label>
            <Input
              type="number"
              value={flatAmount}
              onChange={(e) => handleFlatAmountChange(e.target.value)}
              placeholder="e.g. 25000"
              className="h-10 text-sm font-medium border-slate-300"
            />
          </div>
        </div>

        {/* DEPOSIT DUE Box */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 text-center">
          <div className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">
            DEPOSIT DUE
          </div>
          <div className="text-3xl font-black text-[#16a34a] my-1">
            ${Math.round(depositDue).toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Balance due at delivery: ${Math.round(balanceDue).toLocaleString()}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">
            Notes (Optional)
          </Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e. g. all payments via wire transfer to storage materials account"
            className="text-sm resize-none border-slate-300"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handlePrintInvoice}
          className="bg-[#1e3a8a] hover:bg-[#172554] text-white cursor-pointer font-semibold flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          {isSubmitting ? "Generating..." : "Save & Create Receipt"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer font-medium"
        >
          Cancel
        </Button>
      </div>
    </>
  );
}

export function RequestDepositModal({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: RequestDepositModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] sm:max-w-md p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl flex flex-col"
      >
        {open && (
          <RequestDepositContent
            key={quote?._id || "request-deposit"}
            quote={quote}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
