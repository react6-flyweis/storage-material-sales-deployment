import { useState, useMemo } from "react";
import { Sparkles, Check, RotateCcw, Edit3, Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  downloadPdfProvider,
  type ExtractShipperResponseData,
  type ExtractDrawingResponseData,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";
import { useSowDocument } from "../hooks/use-sow-document";
import { useQuotationStore } from "../quotation.store";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "./server-document-preview";

interface QuoteSowTabProps {
  buildingSize?: string;
  sqFt?: string | number;
  extractedShipper?: ExtractShipperResponseData;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  pdfFileName?: string;
  estimateId?: string;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
  onTriggerCompute?: () => void;
}

export function QuoteSowTab({
  buildingSize = "",
  sqFt = "",
  extractedShipper,
  quotationForm,
  extractedDrawing,
  estimateId,
  onBackToBreakdown,
  onQuotePreview,
  onTriggerCompute,
}: QuoteSowTabProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadingSow, setIsDownloadingSow] = useState(false);

  const {
    isMultiStory,
    setIsMultiStory,
    isRedOxideConfirmed,
    setIsRedOxideConfirmed,
    staircaseCount,
    setStaircaseCount,
    staircaseUnitPrice,
    setStaircaseUnitPrice,
    steelFinish,
    companyBrand,
    freightOverride,
    materialSellOverride,
    engineeringDrawings,
  } = useQuotationStore();

  const sow = useSowDocument({
    extractedShipper,
    sqFt,
    buildingSize,
    quotationForm,
    extractedDrawing,
  });

  const handleToggleMultiStory = (checked: boolean) => {
    setIsMultiStory(checked);
    sow.setMultiStoryBoilerplate(checked);
    onTriggerCompute?.();
    if (checked) {
      toast.success("Switched SOW to multi-story boilerplate with decking & purlins");
    } else {
      toast.info("Switched SOW to standard single-story PEMB boilerplate");
    }
  };

  const previewPayload: PreviewDocumentRequest = useMemo(
    () => ({
      estimateId: estimateId || undefined,
      companyBrand,
      grandTotal: (extractedShipper?.fullQuote?.grandTotal ??
        extractedShipper?.pricing?.totSell) as number | undefined,
      jobType: "PEMB",
      leadCompanyName: sow.pricingData.customerLeadName || "Customer",
      customerEmail: quotationForm?.email || sow.pricingData.customerEmail,
      streetAddress: sow.pricingData.customerAddress,
      cityStateZip: sow.pricingData.customerAddress,
      buildingSize: sow.pricingData.displayBuildingSize,
      squareFootage: sow.pricingData.effectiveSqFt,
      jobNumber:
        quotationForm?.jobNumber ||
        extractedDrawing?.extracted?.jobnumber ||
        "",
      steelFinish: steelFinish || "red-iron",
      freightOverride: parseFloat(freightOverride) || undefined,
      materialSellOverride: parseFloat(materialSellOverride) || undefined,
      matSellOverride: parseFloat(materialSellOverride) || undefined,
      pembDrawings: parseFloat(engineeringDrawings) || 0,
      parsedCategories: extractedShipper?.parsedCategories,
      recompute: true,
      pricingResult: extractedShipper?.pricing,
      fullQuote:
        extractedShipper?.fullQuote ||
        (extractedShipper?.pricing as Record<string, unknown> | undefined),
      extractedDrawingFields: extractedDrawing?.extracted,
      drawingAttachments: [],
      sections: ["sow"],
      staircase: {
        count: isMultiStory ? staircaseCount : 0,
        unitCost: staircaseUnitPrice || 35000,
        stories: 2,
      },
      multiStory: {
        stories: 2,
        staircaseCount: isMultiStory ? staircaseCount : 0,
        staircaseUnitCost: staircaseUnitPrice || 35000,
      },
      redOxideConfirmed: isRedOxideConfirmed,
    }),
    [
      estimateId,
      sow.pricingData.customerLeadName,
      sow.pricingData.customerEmail,
      sow.pricingData.customerAddress,
      sow.pricingData.displayBuildingSize,
      sow.pricingData.effectiveSqFt,
      quotationForm?.jobNumber,
      quotationForm?.email,
      extractedDrawing?.extracted,
      extractedShipper?.pricing,
      extractedShipper?.fullQuote,
      isMultiStory,
      isRedOxideConfirmed,
      staircaseCount,
      staircaseUnitPrice,
      steelFinish,
      freightOverride,
      materialSellOverride,
      engineeringDrawings,
      companyBrand,
      extractedShipper?.parsedCategories,
    ],
  );

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: previewPayload,
  });

  const handleApplyAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    const newPrompt = aiPrompt.trim();
    sow.addCustomInclusion(newPrompt);
    setAiFeedback(`✨ Added "${newPrompt}" to Scope of Work inclusions!`);
    setAiPrompt("");
    setTimeout(() => setAiFeedback(null), 4000);
  };

  const handleDownloadSowPdf = async () => {
    setIsDownloadingSow(true);
    const customerName = sow.pricingData.customerLeadName || "Customer";
    try {
      const payload: PreviewDocumentRequest = {
        estimateId: estimateId || undefined,
        companyBrand,
        grandTotal: (extractedShipper?.fullQuote?.grandTotal ??
          extractedShipper?.pricing?.totSell) as number | undefined,
        leadCompanyName: customerName,
        customerEmail: quotationForm?.email || sow.pricingData.customerEmail,
        streetAddress: sow.pricingData.customerAddress,
        cityStateZip: sow.pricingData.customerAddress,
        buildingSize: sow.pricingData.displayBuildingSize,
        squareFootage: sow.pricingData.effectiveSqFt,
        jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
        steelFinish: steelFinish || "red-iron",
        freightOverride: parseFloat(freightOverride) || undefined,
        materialSellOverride: parseFloat(materialSellOverride) || undefined,
        matSellOverride: parseFloat(materialSellOverride) || undefined,
        pembDrawings: parseFloat(engineeringDrawings) || 0,
        parsedCategories: extractedShipper?.parsedCategories,
        recompute: true,
        pricingResult: extractedShipper?.pricing,
        fullQuote:
          extractedShipper?.fullQuote ||
          (extractedShipper?.pricing as Record<string, unknown> | undefined),
        extractedDrawingFields: extractedDrawing?.extracted,
        drawingAttachments: [],
        sections: ["sow"],
        staircase: {
          count: isMultiStory ? staircaseCount : 0,
          unitCost: staircaseUnitPrice || 35000,
          stories: 2,
        },
        multiStory: {
          stories: 2,
          staircaseCount: isMultiStory ? staircaseCount : 0,
          staircaseUnitCost: staircaseUnitPrice || 35000,
        },
        redOxideConfirmed: isRedOxideConfirmed,
      };

      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res?.data || res;

      if (pdfData?.fileBase64) {
        downloadPdfFromBase64(
          pdfData.fileBase64,
          pdfData.fileName || `SOW_${customerName.replace(/\s+/g, "_")}.pdf`,
          pdfData.mimeType || "application/pdf"
        );
        toast.success("SOW PDF downloaded");
      }
    } catch (err) {
      console.error("Failed to download SOW PDF:", err);
      toast.error("Failed to download SOW PDF");
    } finally {
      setIsDownloadingSow(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Multi-Story / Decking & Project Specs Section */}
      <div className="bg-[#FEFCE8] border border-amber-300 rounded-lg p-2.5 sm:p-3 space-y-2 shadow-2xs">
        {/* Top: Multi-Story / Decking Project Checkbox & Description */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <div
              role="checkbox"
              aria-checked={isMultiStory}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggleMultiStory(!isMultiStory);
                }
              }}
              onClick={() => handleToggleMultiStory(!isMultiStory)}
              className={cn(
                "w-4 h-4 rounded-xs flex items-center justify-center transition-colors cursor-pointer shrink-0 select-none",
                isMultiStory
                  ? "bg-[#9A3412] text-white"
                  : "border border-slate-400 bg-white"
              )}
            >
              {isMultiStory && <Check className="w-3 h-3 stroke-3" />}
            </div>
            <span className="font-bold text-[#78350F] text-xs sm:text-[13px] flex items-center gap-1">
              <span>🏢</span> Multi-Story / Decking Project
            </span>
          </label>
          <span className="text-[11px] text-[#B45309] font-medium">
            Switches SOW to multi-story boilerplate with decking, purlins, partition panels &amp; hallway system language
          </span>
        </div>

        {/* Middle: Red Oxide Confirmation Required Alert */}
        <div
          className={cn(
            "rounded-lg p-2.5 sm:px-3 sm:py-2 flex items-start justify-between gap-2.5 shadow-2xs transition-colors",
            isRedOxideConfirmed
              ? "bg-[#F0FDF4] border border-[#15803D]"
              : "bg-white border border-[#DC2626]"
          )}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />

          <div className="flex-1 space-y-1 min-w-0">
            <h4 className="text-[11px] sm:text-xs font-extrabold text-[#DC2626] uppercase tracking-wide">
              RED OXIDE CONFIRMATION REQUIRED
            </h4>
            <p className="text-[11px] text-slate-800 leading-snug">
              This shipper contains structural steel members (columns, beams, studs, headers, support posts).
            </p>
            <p className="text-[11px] text-slate-800 leading-snug">
              <strong className="font-bold text-slate-900">Confirm the finish before sending the quote.</strong> Default assumption is Red Iron (red oxide primer). If any members are specified as galvanized, the system uses the galvanized rate automatically.
            </p>
            <div className="pt-0.5">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none group">
                <div
                  role="checkbox"
                  aria-checked={isRedOxideConfirmed}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsRedOxideConfirmed(!isRedOxideConfirmed);
                    }
                  }}
                  onClick={() => setIsRedOxideConfirmed(!isRedOxideConfirmed)}
                  className={cn(
                    "w-3.5 h-3.5 rounded-xs border transition-colors flex items-center justify-center cursor-pointer shrink-0",
                    isRedOxideConfirmed
                      ? "border-[#DC2626] bg-[#DC2626] text-white"
                      : "border-slate-400 bg-white"
                  )}
                >
                  {isRedOxideConfirmed && <Check className="w-2.5 h-2.5 stroke-3" />}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#DC2626] group-hover:text-red-700 transition-colors flex items-center gap-1">
                  <span>✓</span> I confirm all structural framing finish has been verified (red iron or galvanized as specified)
                </span>
              </label>
            </div>
          </div>

          {isRedOxideConfirmed ? (
            <div className="w-5 h-5 rounded-xs bg-[#22C55E] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Check className="w-3.5 h-3.5 text-white stroke-3" />
            </div>
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Bottom: Staircases Add-on Calculator */}
        <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-lg px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-sm select-none">🪜</span>
            <span className="font-bold text-[#1E3A8A]">Staircases</span>
            <span className="text-slate-600 font-medium text-[11px]">Number of staircases:</span>
            <input
              type="number"
              min={0}
              value={staircaseCount}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                setStaircaseCount(val);
                onTriggerCompute?.();
              }}
              className="w-12 h-7 text-center bg-white border border-[#93C5FD] rounded font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            <span className="text-slate-500 font-semibold text-[11px]">× $</span>
            <input
              type="number"
              min={0}
              step={500}
              value={staircaseUnitPrice}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                setStaircaseUnitPrice(val);
                onTriggerCompute?.();
              }}
              className="w-18 h-7 text-center bg-white border border-[#93C5FD] rounded font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            <span className="text-slate-500 font-medium text-[11px]">/staircase</span>
            <span className="font-extrabold text-[#1E3A8A] text-xs sm:text-sm">
              = ${(staircaseCount * staircaseUnitPrice).toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-blue-700/80 font-medium sm:text-right shrink-0">
            Added to quote as an add-on line item
          </div>
        </div>
      </div>

      <div className="bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="text-amber-600">✏️</span>
            <span className="text-blue-900 font-extrabold">AI SOW Editor</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 h-7 px-2.5 rounded flex items-center gap-1 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Done Editing
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Edit Manually
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-600">
          Describe a change and Claude will update the SOW instantly, or edit
          texts directly below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyAiPrompt();
              }
            }}
            placeholder="e.g. 'Add structural framing requirement' or 'Add extra steel column spec'"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <Button
            type="button"
            onClick={handleApplyAiPrompt}
            className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            Apply{" "}
            <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          </Button>
        </div>
        {aiFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{aiFeedback}</span>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Edit3 className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              Manual Edit Mode Active — You can edit all titles, grid info,
              overview, and list items.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={sow.resetToDefaults}
              className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100/60 text-xs px-3 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" /> Reset to
              Dynamic Data
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Statement of Work Server Preview Box */}
      <ServerDocumentPreview
        html={serverPreviewHtml}
        isLoading={isPreviewLoading}
        error={previewError}
        onRetry={refetchPreview}
        title={`Statement of Work — ${sow.pricingData.customerLeadName || "Customer"}`}
        minHeight={750}
      />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToBreakdown}
          className="border-slate-300 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          ← Back to Breakdown
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
            isEditing
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              : "border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" /> Done Editing
            </>
          ) : (
            <>✏️ Edit Manually</>
          )}
        </Button>
        <Button
          type="button"
          onClick={onQuotePreview}
          className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Quote Preview →
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadSowPdf}
          disabled={isDownloadingSow}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer bg-white flex items-center gap-1.5"
        >
          {isDownloadingSow ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <span>SOW Only (PDF)</span>
          )}
        </Button>
      </div>
    </div>
  );
}
