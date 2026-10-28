import { useState } from "react";
import { Printer, X, Plus, Loader2 } from "lucide-react";
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
  type MilestoneRowPayload,
  saveEstimateMilestonesProvider,
  downloadMilestonesPdfProvider,
} from "../estimates.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";

interface MilestoneItem {
  id: string;
  name: string;
  type: "%" | "$";
  value: number;
}

interface MilestonePaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: SaveEstimatePayload | null;
  onSuccess?: () => void;
}

function MilestonePaymentsContent({
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

  const initialLocation =
    quote?.cityStateZip ||
    quote?.streetAddress ||
    "San Antonio, TX";

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
  const [location] = useState(initialLocation);
  const [totalContractValue] = useState<number>(initialTotal);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: "1", name: "Deposit", type: "%", value: 30 },
  ]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate items
  const calculatedItems = milestones.map((m) => {
    const amount =
      m.type === "%"
        ? Math.round((totalContractValue * m.value) / 100)
        : Math.round(m.value);
    return { ...m, amount };
  });

  const totalScheduled = calculatedItems.reduce((acc, curr) => acc + curr.amount, 0);
  const unscheduledBalance = Math.max(0, totalContractValue - totalScheduled);
  const percentScheduled =
    totalContractValue > 0
      ? Math.min(100, Math.max(0, (totalScheduled / totalContractValue) * 100))
      : 0;

  const handleAddPercentMilestone = () => {
    const nextId = String(Date.now());
    const remainingPct = Math.max(
      0,
      100 -
        milestones.reduce(
          (acc, m) =>
            acc +
            (m.type === "%"
              ? m.value
              : totalContractValue > 0
                ? (m.value / totalContractValue) * 100
                : 0),
          0,
        ),
    );
    const suggestedPct = Math.min(remainingPct > 0 ? Math.round(remainingPct) : 20, 100);
    setMilestones((prev) => [
      ...prev,
      {
        id: nextId,
        name:
          prev.length === 1
            ? "Delivery"
            : prev.length === 2
              ? "Final Completion"
              : `Milestone #${prev.length + 1}`,
        type: "%",
        value: suggestedPct,
      },
    ]);
  };

  const handleAddDollarMilestone = () => {
    const nextId = String(Date.now());
    const remaining = Math.max(0, totalContractValue - totalScheduled);
    setMilestones((prev) => [
      ...prev,
      {
        id: nextId,
        name: `Milestone #${prev.length + 1}`,
        type: "$",
        value: remaining > 0 ? remaining : 10000,
      },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) {
      toast.error("At least one milestone is required");
      return;
    }
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateName = (id: string, name: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m)),
    );
  };

  const handleUpdateValue = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, value: num } : m)),
    );
  };

  const openClientPrintPopup = () => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      toast.error("Please allow popups to print Payment Schedule");
      return;
    }

    const rowsHtml = calculatedItems
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">#${idx + 1} - ${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.type === "%" ? `${item.value}%` : "Flat $"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #7c3aed;">$${item.amount.toLocaleString()}</td>
        </tr>
      `,
      )
      .join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Milestone Payment Schedule - ${customer}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #7c3aed; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .field-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .total-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .total-label { font-size: 13px; font-weight: 800; color: #7c3aed; text-transform: uppercase; }
            .total-val { font-size: 28px; font-weight: 800; color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 10px; background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; }
            .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .sum-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
            .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sign-line { border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">MILESTONE PAYMENT SCHEDULE</h1>
            <div class="subtitle">${customer} · ${location}</div>
          </div>
          <div class="grid">
            <div>
              <div class="field-label">Customer</div>
              <div class="field-value">${customer}</div>
            </div>
            <div>
              <div class="field-label">Location</div>
              <div class="field-value">${location}</div>
            </div>
          </div>

          <div class="total-box">
            <div class="total-label">Total Contract Value</div>
            <div class="total-val">$${totalContractValue.toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Milestone Stage</th>
                <th style="text-align: center;">Rate / Type</th>
                <th style="text-align: right;">Scheduled Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="sum-row">
              <span style="font-weight: 600; color: #475569;">Total Scheduled:</span>
              <span style="font-weight: 800; color: #0f172a;">$${totalScheduled.toLocaleString()}</span>
            </div>
            <div class="sum-row">
              <span style="font-weight: 600; color: #475569;">Unscheduled Balance:</span>
              <span style="font-weight: 800; color: #ea580c;">$${unscheduledBalance.toLocaleString()}</span>
            </div>
          </div>

          <div class="field-label" style="margin-bottom: 6px;">Notes (Optional)</div>
          <div class="notes-box">${notes || "All payments via wire transfer to storage materials account."}</div>

          <div class="signatures">
            <div>
              <div class="sign-line">Customer Acceptance & Date</div>
            </div>
            <div>
              <div class="sign-line">Authorized Contractor Signature & Date</div>
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

  const handlePrintSchedule = async () => {
    setIsSubmitting(true);
    const rowsPayload: MilestoneRowPayload[] = calculatedItems.map((m) => ({
      label: m.name,
      amount: m.amount,
      type: m.type === "%" ? "percent" : "fixed",
      pct: m.type === "%" ? m.value : undefined,
    }));

    try {
      if (quote?._id) {
        await saveEstimateMilestonesProvider(quote._id, {
          rows: rowsPayload,
          note: notes,
          grand: totalContractValue,
        }).catch((err) => console.warn("Could not save milestones to estimate:", err));
      }

      const pdfRes = await downloadMilestonesPdfProvider({
        estimateId: quote?._id,
        quote,
        grand: totalContractValue,
        rows: rowsPayload,
        note: notes,
      }).catch(() => null);

      const b64 = pdfRes?.data?.fileBase64 || pdfRes?.fileBase64;
      if (b64) {
        downloadPdfFromBase64(
          b64,
          pdfRes?.data?.fileName || pdfRes?.fileName || `Milestone-Schedule-${customer}.pdf`
        );
        toast.success("Payment Schedule PDF downloaded successfully");
      } else {
        openClientPrintPopup();
        toast.success("Milestone schedule generated successfully");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error processing milestones schedule:", err);
      openClientPrintPopup();
      onSuccess?.();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Purple Header */}
      <div className="bg-[#7c3aed] text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏁</span>
          <DialogTitle className="text-base font-bold text-white tracking-wide">
            Milestone Payments
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
        {/* Customer & Location */}
        <div className="grid grid-cols-2 gap-4">
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
              LOCATION
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {location}
            </div>
          </div>
        </div>

        {/* TOTAL CONTRACT VALUE Banner Card */}
        <div className="bg-[#faf5ff] border border-purple-200/80 rounded-xl p-4 flex items-center justify-between">
          <div className="text-xs font-black text-[#7c3aed] uppercase tracking-wider">
            TOTAL CONTRACT VALUE
          </div>
          <div className="text-3xl font-black text-[#7c3aed]">
            ${totalContractValue.toLocaleString()}
          </div>
        </div>

        {/* Milestones dynamic list */}
        <div className="space-y-2.5">
          {calculatedItems.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5 bg-white shadow-2xs"
            >
              <Input
                value={item.name}
                onChange={(e) => handleUpdateName(item.id, e.target.value)}
                placeholder="Milestone name"
                className="h-9 text-sm font-medium border-slate-300 flex-1"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <Input
                  type="number"
                  value={item.value || ""}
                  onChange={(e) => handleUpdateValue(item.id, e.target.value)}
                  className="h-9 text-sm font-medium border-slate-300 w-16 text-center"
                />
                <span className="text-sm font-bold text-slate-600">
                  {item.type}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 min-w-24 text-right shrink-0">
                ${item.amount.toLocaleString()}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveMilestone(item.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                title="Remove milestone"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons: + Add % Milestone / + Add $ Milestone */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPercentMilestone}
            className="border-dashed border-[#a855f7] text-[#7c3aed] bg-[#faf5ff] hover:bg-[#f3e8ff] h-10 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            + Add % Milestone
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDollarMilestone}
            className="border-dashed border-[#22c55e] text-[#16a34a] bg-[#f0fdf4] hover:bg-[#dcfce7] h-10 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            + Add $ Milestone
          </Button>
        </div>

        {/* TOTAL SCHEDULED & UNSCHEDULED Progress Box */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 uppercase tracking-wide">TOTAL SCHEDULED</span>
            <span className="text-sm font-bold text-slate-900">
              ${totalScheduled.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7c3aed] rounded-full transition-all duration-300"
              style={{ width: `${percentScheduled}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-0.5">
            <span className="text-slate-600">Unscheduled Balance</span>
            <span className="text-sm font-bold text-[#ea580c]">
              ${unscheduledBalance.toLocaleString()}
            </span>
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
          onClick={handlePrintSchedule}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white cursor-pointer font-semibold flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          {isSubmitting ? "Generating..." : "Save & Create Schedule"}
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

export function MilestonePaymentsModal({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: MilestonePaymentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] sm:max-w-md p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl flex flex-col"
      >
        {open && (
          <MilestonePaymentsContent
            key={quote?._id || "milestone-payments"}
            quote={quote}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
