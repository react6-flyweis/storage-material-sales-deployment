import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Printer, X, Loader2, Check, RefreshCw, AlertTriangle } from "lucide-react";
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
  previewDepositProvider,
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
    quote?.jobNumber ||
    "Estimate Customer";

  const rawDate = quote?.quoteDate || quote?.createdAt;
  const initialDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const initialLocation =
    quote?.cityStateZip ||
    quote?.streetAddress ||
    "Location N/A";

  const initialBuildingSize =
    quote?.buildingSize ||
    (quote?.squareFootage ? `${quote.squareFootage.toLocaleString()} SF` : "N/A");

  const pricingRes = (quote?.pricingResult ||
    quote?.storagePricingResult) as Record<string, unknown> | undefined;
  const fullQuote = quote?.fullQuoteResult as Record<string, unknown> | undefined;
  const rawTotal =
    Number(
      quote?.grandTotal ??
        quote?.totalSell ??
        fullQuote?.grandTotal ??
        pricingRes?.totSell ??
        pricingRes?.grandTotal,
    ) || 0;

  const [customer] = useState(initialCustomer);
  const [quoteDate] = useState(initialDate);
  const [location] = useState(initialLocation);
  const [buildingSize] = useState(initialBuildingSize);
  const [totalContractValue, setTotalContractValue] = useState<number>(rawTotal);
  const [depositPct, setDepositPct] = useState<string>("30");
  const [flatAmount, setFlatAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Load saved deposit terms from backend when estimateId is available
  useEffect(() => {
    let isCancelled = false;

    async function loadSavedDepositTerms() {
      if (!quote?._id) {
        // Check if depositTerms was already on the quote object
        const terms = (quote?.depositTerms || {}) as Record<string, unknown>;
        if (terms.pct != null) {
          setDepositPct(String(terms.pct));
        }
        if (terms.flat != null) {
          setFlatAmount(String(terms.flat));
        }
        if (typeof terms.note === "string") {
          setNotes(terms.note);
        }
        return;
      }

      setIsLoadingInitial(true);
      try {
        const preview = await previewDepositProvider({ estimateId: quote._id });
        if (isCancelled || !preview) return;

        if (typeof preview.grand === "number" && preview.grand > 0) {
          setTotalContractValue(preview.grand);
        }

        const terms = (preview.depositTerms || {}) as Record<string, unknown>;
        const savedPct = preview.pct ?? terms.pct;
        const savedFlat = preview.flat ?? terms.flat;
        const savedNote = preview.note ?? terms.note;

        if (savedFlat != null && Number(savedFlat) > 0) {
          setFlatAmount(String(savedFlat));
          if (preview.grand > 0) {
            const pct = (Number(savedFlat) / preview.grand) * 100;
            setDepositPct(pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1));
          }
        } else if (savedPct != null && Number(savedPct) > 0) {
          setDepositPct(String(savedPct));
          setFlatAmount("");
        }

        if (typeof savedNote === "string") {
          setNotes(savedNote);
        }
      } catch (err) {
        console.warn("Could not fetch saved deposit from preview endpoint:", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingInitial(false);
        }
      }
    }

    loadSavedDepositTerms();

    return () => {
      isCancelled = true;
    };
  }, [quote?._id, quote?.depositTerms]);

  // Derived Calculations
  const depositDue = useMemo(() => {
    if (flatAmount && !isNaN(parseFloat(flatAmount))) {
      return parseFloat(flatAmount);
    }
    const pct = parseFloat(depositPct) || 0;
    return (totalContractValue * pct) / 100;
  }, [flatAmount, depositPct, totalContractValue]);

  const balanceDue = Math.max(0, totalContractValue - depositDue);
  const effectivePct =
    totalContractValue > 0
      ? (depositDue / totalContractValue) * 100
      : parseFloat(depositPct) || 0;

  // Validation
  const isOverDeposit = totalContractValue > 0 && depositDue > totalContractValue;
  const isNegativeDeposit = depositDue < 0;
  const isOver100Pct = effectivePct > 100.01;
  const hasValidationErrors = isOverDeposit || isNegativeDeposit || isOver100Pct || totalContractValue <= 0;

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

  // Debounced live calculation sync with backend
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLoadingInitial || totalContractValue <= 0) return;

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }

    previewTimerRef.current = setTimeout(async () => {
      try {
        const parsedPct = parseFloat(depositPct) || undefined;
        const parsedFlat = parseFloat(flatAmount) || undefined;

        await previewDepositProvider({
          estimateId: quote?._id,
          grand: totalContractValue,
          pct: parsedPct,
          flat: parsedFlat,
        });
      } catch {
        // Background sync catch
      }
    }, 400);

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [depositPct, flatAmount, totalContractValue, isLoadingInitial, quote?._id]);

  const validateDeposit = useCallback((): boolean => {
    if (totalContractValue <= 0) {
      toast.error("Total contract value must be greater than zero");
      return false;
    }
    if (isNegativeDeposit || depositDue <= 0) {
      toast.error("Deposit amount must be greater than zero");
      return false;
    }
    if (isOverDeposit || isOver100Pct) {
      toast.error(
        `Deposit ($${Math.round(depositDue).toLocaleString()} / ${effectivePct.toFixed(1)}%) cannot exceed total contract value ($${totalContractValue.toLocaleString()})`
      );
      return false;
    }
    return true;
  }, [totalContractValue, isNegativeDeposit, depositDue, isOverDeposit, isOver100Pct, effectivePct]);

  const openClientPrintPopup = useCallback((htmlContent?: string) => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      toast.error("Please allow popups to print Deposit Receipt");
      return;
    }

    if (htmlContent) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
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
            .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 24px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sign-line { border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">DEPOSIT INVOICE</h1>
            <div class="subtitle">${customer} · ${location}</div>
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
            <div class="deposit-label">Deposit Due (${effectivePct.toFixed(1)}%)</div>
            <div class="deposit-val">$${Math.round(depositDue).toLocaleString()}</div>
            <div class="deposit-sub">Remaining Balance: $${Math.round(balanceDue).toLocaleString()}</div>
          </div>

          <div class="field-label" style="margin-bottom: 6px;">Notes</div>
          <div class="notes-box">${notes || "All payments via wire transfer to storage materials account."}</div>

          <div class="signatures">
            <div>
              <div class="sign-line">Customer Signature & Date</div>
            </div>
            <div>
              <div class="sign-line">Authorized Signature & Date</div>
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
  }, [balanceDue, buildingSize, customer, depositDue, effectivePct, location, notes, quoteDate, totalContractValue]);

  // Save Deposit Terms: PUT /api/sales/estimates/:estimateId/deposit
  const handleSaveDeposit = async () => {
    if (!validateDeposit()) return;

    setIsSaving(true);
    const parsedPct = parseFloat(depositPct) || undefined;
    const parsedFlat = parseFloat(flatAmount) || undefined;

    try {
      if (quote?._id) {
        await saveEstimateDepositProvider(quote._id, {
          pct: parsedPct,
          flat: parsedFlat,
          note: notes,
          grand: totalContractValue > 0 ? totalContractValue : undefined,
        });
        toast.success("Deposit terms saved successfully");
      } else {
        toast.success("Deposit terms configured");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving deposit terms:", err);
      toast.error("Failed to save deposit terms. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Standalone Receipt (Print / PDF): POST /api/sales/estimates/documents/deposit-receipt/pdf
  const handlePrintReceipt = async () => {
    if (!validateDeposit()) return;

    setIsPrinting(true);
    const parsedPct = parseFloat(depositPct) || undefined;
    const parsedFlat = parseFloat(flatAmount) || undefined;

    try {
      // Auto-save to estimate when ID is present
      if (quote?._id) {
        await saveEstimateDepositProvider(quote._id, {
          pct: parsedPct,
          flat: parsedFlat,
          note: notes,
          grand: totalContractValue > 0 ? totalContractValue : undefined,
        }).catch((err) => console.warn("Background auto-save failed before deposit print:", err));
      }

      const receiptRes = await downloadDepositReceiptPdfProvider({
        estimateId: quote?._id,
        format: "html",
        grand: totalContractValue,
        pct: parsedPct,
        flat: parsedFlat,
        note: notes,
      }).catch(() => null);

      const html = receiptRes?.data?.html || receiptRes?.html;
      const b64 = receiptRes?.data?.fileBase64 || receiptRes?.fileBase64;

      if (html) {
        openClientPrintPopup(html);
        toast.success("Deposit receipt printed");
      } else if (b64) {
        downloadPdfFromBase64(
          b64,
          receiptRes?.data?.fileName || receiptRes?.fileName || `Deposit-Receipt-${customer}.pdf`
        );
        toast.success("Deposit Receipt PDF downloaded successfully");
      } else {
        openClientPrintPopup();
        toast.success("Deposit receipt printed");
      }

      onSuccess?.();
    } catch (err) {
      console.error("Error processing deposit receipt:", err);
      openClientPrintPopup();
    } finally {
      setIsPrinting(false);
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
          {isLoadingInitial && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-200 ml-1" />
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
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

        {/* Validation Warning Alert */}
        {(isOverDeposit || isOver100Pct) && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-rose-900">
                Deposit Exceeds Total Contract Value
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700">
                Calculated deposit (${Math.round(depositDue).toLocaleString()} / {effectivePct.toFixed(1)}%) cannot exceed the total contract value of ${totalContractValue.toLocaleString()}. Please reduce the percentage or flat amount.
              </p>
            </div>
          </div>
        )}

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
                className={`h-10 text-sm font-medium w-24 text-center ${
                  isOver100Pct || parseFloat(depositPct) <= 0
                    ? "border-rose-400 focus-visible:ring-rose-400 text-rose-600 font-bold bg-rose-50/20"
                    : "border-slate-300"
                }`}
              />
              <span className="text-sm font-bold text-slate-600">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              - OR FLAT AMOUNT -
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
                $
              </span>
              <Input
                type="number"
                value={flatAmount}
                onChange={(e) => handleFlatAmountChange(e.target.value)}
                placeholder="e.g. 50000"
                className={`h-10 pl-7 text-sm font-medium ${
                  isOverDeposit
                    ? "border-rose-400 focus-visible:ring-rose-400 text-rose-600 font-bold bg-rose-50/20"
                    : "border-slate-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* DEPOSIT DUE Box */}
        <div
          className={`border rounded-xl p-4 text-center space-y-1 ${
            isOverDeposit || isOver100Pct
              ? "bg-rose-50/40 border-rose-200"
              : "bg-[#f0fdf4] border-[#bbf7d0]"
          }`}
        >
          <div
            className={`text-xs font-black uppercase tracking-wider ${
              isOverDeposit || isOver100Pct ? "text-rose-600" : "text-[#16a34a]"
            }`}
          >
            DEPOSIT DUE ({effectivePct.toFixed(1)}%)
          </div>
          <div
            className={`text-3xl font-black ${
              isOverDeposit || isOver100Pct ? "text-rose-600" : "text-[#16a34a]"
            }`}
          >
            ${Math.round(depositDue).toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 pt-1">
            Remaining Balance Due: ${Math.round(balanceDue).toLocaleString()}
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
            placeholder="e.g. all payments via wire transfer to storage materials account"
            className="text-sm resize-none border-slate-300"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPrinting || isSaving}
          onClick={handlePrintReceipt}
          title={hasValidationErrors ? "Please resolve validation errors before printing" : undefined}
          className="border border-blue-300 text-[#1e3a8a] bg-blue-50/50 hover:bg-blue-100 cursor-pointer font-semibold flex items-center gap-1.5 text-xs h-9 px-3"
        >
          {isPrinting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Printer className="h-3.5 w-3.5" />
          )}
          <span>{isPrinting ? "Printing..." : "Print Receipt / PDF"}</span>
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving || isPrinting}
            onClick={() => onOpenChange(false)}
            className="text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer font-medium text-xs h-9 px-3"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSaving || isPrinting}
            onClick={handleSaveDeposit}
            title={hasValidationErrors ? "Please resolve validation errors before saving" : undefined}
            className="bg-[#1e3a8a] hover:bg-[#172554] text-white cursor-pointer font-semibold flex items-center gap-1.5 text-xs h-9 px-3.5 shadow-2xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save Deposit Terms"}</span>
          </Button>
        </div>
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
        className="max-h-[85vh] sm:max-w-lg p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl flex flex-col"
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
