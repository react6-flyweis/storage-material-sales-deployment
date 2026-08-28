import { useState } from "react";
import { useNavigate } from "react-router";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  downloadPdfProvider,
  type ExtractShipperResponseData,
  type ExtractDrawingResponseData,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { useQuotationPricing } from "../hooks/use-quotation-pricing";
import { QuotePreviewDocument } from "./quote-preview-document";

interface QuoteDetailTabProps {
  sqFt: string;
  setSqFt: (val: string) => void;
  buildingSize: string;
  setBuildingSize: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
  extractedShipper?: ExtractShipperResponseData;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  pdfFileName?: string;
  estimateId?: string | null;
  onQuotePreview?: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  onBackToBreakdown?: () => void;
}

export function QuoteDetailTab({
  sqFt,
  setSqFt,
  buildingSize,
  setBuildingSize,
  additionalNotes,
  setAdditionalNotes,
  extractedShipper,
  quotationForm,
  extractedDrawing,
  pdfFileName,
  estimateId,
  onQuotePreview,
  onSaveDraft,
  isSavingDraft,
  onBackToBreakdown
}: QuoteDetailTabProps) {
  const navigate = useNavigate();
  const {
    jobType,
    setJobType,
    scope,
    setScope,
    roofType,
    setRoofType,
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
  } = useQuotationStore();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const {
    customerLeadName,
    customerEmail,
    customerAddress,
    displayBuildingSize,
    effectiveSqFt,
  } = useQuotationPricing({
    extractedShipper,
    sqFt,
    buildingSize,
    quotationForm,
    extractedDrawing,
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeCustomer = (customerLeadName || "Quote").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `Quote_Package_${safeCustomer}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const payload: PreviewDocumentRequest = {
        leadCompanyName: customerLeadName,
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        buildingSize: displayBuildingSize,
        squareFootage: effectiveSqFt,
        jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
        pricingResult: extractedShipper?.pricing,
        fullQuote: extractedShipper?.fullQuote || (extractedShipper?.pricing as Record<string, unknown> | undefined),
        extractedDrawingFields: extractedDrawing?.extracted,
        drawingAttachments: pdfFileName ? [{ name: pdfFileName, includeInQuote: true }] : [],
        sections: pdfFileName ? ["quote", "sow", "contract", "drawings"] : ["quote", "sow", "contract"],
      };
      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res.data || res;
      if (pdfData?.fileBase64) {
        const a = document.createElement("a");
        a.href = `data:${pdfData.mimeType || "application/pdf"};base64,${pdfData.fileBase64}`;
        a.download = pdfData.fileName || `Quote_${(customerLeadName || "Package").replace(/\s+/g, "_")}.pdf`;
        a.click();
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error("Failed to download PDF via API, opening print dialog:", err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls / Inputs Section */}
      <div className="space-y-4 text-xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Live Edit — Changes Update Instantly
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* JOB TYPE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              JOB TYPE
            </label>
            <button
              type="button"
              onClick={() => setJobType(jobType.toLowerCase() === "storage" ? "PEMB" : "Storage")}
              className={cn(
                "w-full py-2 px-3 rounded-md font-semibold text-xs transition-colors text-white cursor-pointer",
                jobType.toLowerCase() === "storage"
                  ? "bg-[#2563EB] hover:bg-blue-700"
                  : "bg-[#1E3A8A] hover:bg-blue-900"
              )}
            >
              {jobType}
            </button>
          </div>

          {/* SCOPE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              SCOPE
            </label>
            <button
              type="button"
              onClick={() => setScope(scope.toLowerCase() === "install" ? "Supply" : "Install")}
              className={cn(
                "w-full py-2 px-3 rounded-md font-semibold text-xs transition-colors text-white cursor-pointer",
                scope.toLowerCase() === "install"
                  ? "bg-[#16A34A] hover:bg-[#15803D]"
                  : "bg-slate-600 hover:bg-slate-700"
              )}
            >
              {scope.toLowerCase() === "install" ? "Install" : "Supply Only"}
            </button>
          </div>

          {/* ROOF TYPE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              ROOF TYPE
            </label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Screw-down">Screw-down</option>
              <option value="Standing Seam (SS)">Standing Seam (SS)</option>
              <option value="Standing Seam">Standing Seam</option>
              <option value="TPO / Membrane">TPO / Membrane</option>
              <option value="Insulated Metal (IMP)">Insulated Metal (IMP)</option>
            </select>
          </div>

          {/* SQUARE FOOTAGE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              SQUARE FOOTAGE
            </label>
            <input
              type="text"
              value={sqFt}
              onChange={(e) => setSqFt(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* BUILDING SIZE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              BUILDING SIZE
            </label>
            <input
              type="text"
              value={buildingSize}
              onChange={(e) => setBuildingSize(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sliders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* INSTALL COST $/SF */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
              <span>INSTALL COST $/SF</span>
              <span className="text-amber-600 font-extrabold text-xs">${installCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.1"
              value={installCost}
              onChange={(e) => setInstallCost(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* INSTALL SELL $/SF */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
              <span>INSTALL SELL RATE $/SF</span>
              <span className="text-slate-900 font-extrabold text-xs">${installSell.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={installSell}
              onChange={(e) => setInstallSell(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[11px] text-emerald-600 font-semibold">
              Labor profit ${(installSell - installCost).toFixed(2)}/SF ({installSell > 0 ? (((installSell - installCost) / installSell) * 100).toFixed(2) : "0.00"}%)
            </p>
          </div>
        </div>
      </div>

      {/* Printable Estimate Card Box */}
      <QuotePreviewDocument
        sqFt={sqFt}
        buildingSize={buildingSize}
        extractedShipper={extractedShipper}
        quotationForm={quotationForm}
        extractedDrawing={extractedDrawing}
      />

      {/* Additional Information Textarea */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-900">Additional Information</h4>
          <span className="text-[10px] text-slate-400">This Text Will Appear On The Printed Quote</span>
        </div>
        <textarea
          rows={4}
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Add Any Additional Notes..."
          className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
        />
      </div>

      {/* Action Buttons */}

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
          onClick={() => (onQuotePreview ? onQuotePreview() : navigate("/quotation/quote-preview/view"))}
          className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Quote Preview
        </Button>
        <Button
          type="button"
          onClick={onSaveDraft}
          disabled={isSavingDraft}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-2"
        >
          {isSavingDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSavingDraft ? "Saving..." : "Save to History"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white flex items-center gap-2"
        >
          {isDownloadingPdf ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Printer className="h-3.5 w-3.5" />
          )}
          {isDownloadingPdf ? "Downloading PDF..." : "Print / Save PDF"}
        </Button>
      </div>
    </div>
  );
}
