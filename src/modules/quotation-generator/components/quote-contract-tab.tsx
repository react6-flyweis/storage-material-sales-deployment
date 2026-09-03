import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  downloadPdfProvider,
  type ExtractShipperResponseData,
  type ExtractDrawingResponseData,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { useQuotationPricing } from "../hooks/use-quotation-pricing";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "./server-document-preview";

interface QuoteContractTabProps {
  extractedShipper?: ExtractShipperResponseData;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  sqFt?: string | number;
  pdfFileName?: string;
  estimateId?: string;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
}

export function QuoteContractTab({
  extractedShipper,
  quotationForm,
  extractedDrawing,
  sqFt,
  pdfFileName,
  estimateId,
  onBackToBreakdown,
  onQuotePreview,
}: QuoteContractTabProps) {
  const { scope } = useQuotationStore();

  const pricingData = useQuotationPricing({
    extractedShipper,
    sqFt,
    quotationForm,
    extractedDrawing,
  });

  const defaultCustomerLegalName =
    quotationForm?.leadName ||
    extractedDrawing?.extracted?.customer ||
    extractedShipper?.coverSheet?.labelMap?.customer ||
    pricingData.customerLeadName ||
    "";

  const defaultCustomerAddress =
    quotationForm?.street ||
    extractedShipper?.coverSheet?.labelMap?.project ||
    pricingData.customerAddress ||
    "";

  const defaultCustomerCityStateZip =
    quotationForm?.cityStateZip ||
    extractedShipper?.coverSheet?.labelMap?.location ||
    "";

  const defaultCustomerEmail =
    quotationForm?.email ||
    pricingData.customerEmail ||
    "";

  const defaultEffectiveDate =
    quotationForm?.quoteDate ||
    pricingData.quoteDate ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const computedContractType =
    scope?.toLowerCase() === "supply"
      ? "Supply & Delivery Only"
      : scope?.toLowerCase() === "install"
        ? "Installation Only"
        : scope?.toLowerCase() === "both"
          ? "Supply, Delivery & Erection"
          : "Supply & Delivery Only";

  const defaultTotalContractValue = pricingData.grandTotalFormatted || "-";

  // Customer Form State
  const [customerLegalName] = useState(defaultCustomerLegalName);
  const [customerAddress] = useState(defaultCustomerAddress);
  const [customerCityStateZip] = useState(defaultCustomerCityStateZip);
  const [customerEmail] = useState(defaultCustomerEmail);
  const [effectiveDate] = useState(defaultEffectiveDate);
  const [contractType] = useState(computedContractType);
  const [depositPct] = useState("Forty-percent (40%)");
  const [totalContractValue] = useState(defaultTotalContractValue);

  // Download states
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [isDownloadingContract, setIsDownloadingContract] = useState(false);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage] = useState("");

  const previewPayload: PreviewDocumentRequest = useMemo(
    () => ({
      estimateId: estimateId || undefined,
      jobType: "PEMB",
      leadCompanyName: customerLegalName || pricingData.customerLeadName,
      customerEmail: customerEmail || pricingData.customerEmail,
      streetAddress: customerAddress || pricingData.customerAddress,
      cityStateZip: customerCityStateZip || pricingData.customerAddress,
      buildingSize: pricingData.displayBuildingSize,
      squareFootage: pricingData.effectiveSqFt,
      jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
      pricingResult: extractedShipper?.pricing,
      fullQuote:
        extractedShipper?.fullQuote ||
        (extractedShipper?.pricing as Record<string, unknown> | undefined),
      extractedDrawingFields: extractedDrawing?.extracted,
      contract: {
        customer: customerLegalName || pricingData.customerLeadName,
        address: customerAddress || pricingData.customerAddress,
        city: customerCityStateZip || pricingData.customerAddress,
        email: customerEmail || pricingData.customerEmail,
        date: effectiveDate,
        deposit: depositPct,
        type: contractType,
        value: totalContractValue,
      },
      drawingAttachments: [],
      sections: ["contract"],
    }),
    [
      estimateId,
      customerLegalName,
      customerEmail,
      customerAddress,
      customerCityStateZip,
      effectiveDate,
      depositPct,
      contractType,
      totalContractValue,
      pricingData.customerLeadName,
      pricingData.customerEmail,
      pricingData.customerAddress,
      pricingData.displayBuildingSize,
      pricingData.effectiveSqFt,
      quotationForm?.jobNumber,
      extractedDrawing?.extracted,
      extractedShipper?.pricing,
      extractedShipper?.fullQuote,
    ]
  );

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: previewPayload,
  });

  /*
  const handleAutoFill = () => {
    setCustomerLegalName(defaultCustomerLegalName);
    setCustomerAddress(defaultCustomerAddress);
    setCustomerCityStateZip(defaultCustomerCityStateZip);
    setCustomerEmail(defaultCustomerEmail);
    setEffectiveDate(defaultEffectiveDate);
    setContractType(computedContractType);
    setDepositPct("Forty-percent (40%)");
    setTotalContractValue(defaultTotalContractValue);
    setSuccessMessage("Customer info auto-filled from quote successfully!");
    setSuccessDialogOpen(true);
  };
  */

  const handlePrint = (title?: string) => {
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }
    window.print();
    document.title = originalTitle;
  };

  const handleGenerateFullPackage = async () => {
    setIsGeneratingPackage(true);
    try {
      const payload: PreviewDocumentRequest = {
        leadCompanyName: customerLegalName || pricingData.customerLeadName,
        customerEmail: customerEmail || pricingData.customerEmail,
        streetAddress: customerAddress || pricingData.customerAddress,
        cityStateZip: customerCityStateZip || pricingData.customerAddress,
        buildingSize: pricingData.displayBuildingSize,
        squareFootage: pricingData.effectiveSqFt,
        jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
        pricingResult: extractedShipper?.pricing,
        fullQuote:
          extractedShipper?.fullQuote ||
          (extractedShipper?.pricing as Record<string, unknown> | undefined),
        contract: {
          customer: customerLegalName || pricingData.customerLeadName,
          address: customerAddress || pricingData.customerAddress,
          city: customerCityStateZip || pricingData.customerAddress,
          email: customerEmail || pricingData.customerEmail,
          date: effectiveDate,
          deposit: depositPct,
          type: contractType,
          value: totalContractValue,
        },
        extractedDrawingFields: extractedDrawing?.extracted,
        drawingAttachments: pdfFileName ? [{ name: pdfFileName, includeInQuote: true }] : [],
        sections: pdfFileName
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
      };

      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res.data || res;

      if (pdfData?.fileBase64) {
        const a = document.createElement("a");
        a.href = `data:${pdfData.mimeType || "application/pdf"};base64,${pdfData.fileBase64}`;
        a.download =
          pdfData.fileName ||
          `Quote_Package_${(customerLegalName || "Customer").replace(/\s+/g, "_")}.pdf`;
        a.click();
      } else {
        handlePrint(`Quote_Package_${customerLegalName || "Customer"}`);
      }
    } catch (err) {
      console.error("Failed to download full package PDF, opening print dialog:", err);
      handlePrint(`Quote_Package_${customerLegalName || "Customer"}`);
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  const handleContractOnlyPdf = async () => {
    setIsDownloadingContract(true);
    try {
      const payload: PreviewDocumentRequest = {
        leadCompanyName: customerLegalName || pricingData.customerLeadName,
        customerEmail: customerEmail || pricingData.customerEmail,
        streetAddress: customerAddress || pricingData.customerAddress,
        cityStateZip: customerCityStateZip || pricingData.customerAddress,
        buildingSize: pricingData.displayBuildingSize,
        squareFootage: pricingData.effectiveSqFt,
        jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
        pricingResult: extractedShipper?.pricing,
        fullQuote:
          extractedShipper?.fullQuote ||
          (extractedShipper?.pricing as Record<string, unknown> | undefined),
        contract: {
          customer: customerLegalName || pricingData.customerLeadName,
          address: customerAddress || pricingData.customerAddress,
          city: customerCityStateZip || pricingData.customerAddress,
          email: customerEmail || pricingData.customerEmail,
          date: effectiveDate,
          deposit: depositPct,
          type: contractType,
          value: totalContractValue,
        },
        extractedDrawingFields: extractedDrawing?.extracted,
        drawingAttachments: [],
        sections: ["contract"],
      };

      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res.data || res;

      if (pdfData?.fileBase64) {
        const a = document.createElement("a");
        a.href = `data:${pdfData.mimeType || "application/pdf"};base64,${pdfData.fileBase64}`;
        a.download =
          pdfData.fileName ||
          `Contract_${(customerLegalName || "Agreement").replace(/\s+/g, "_")}.pdf`;
        a.click();
      } else {
        handlePrint(`Contract_${customerLegalName || "Agreement"}`);
      }
    } catch (err) {
      console.error("Failed to download Contract PDF, opening print dialog:", err);
      handlePrint(`Contract_${customerLegalName || "Agreement"}`);
    } finally {
      setIsDownloadingContract(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Contract Agreement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preview the contract agreement generated directly from the quotation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToBreakdown}
            className="border-slate-300 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
          >
            ← Back to Breakdown
          </Button>
          <Button
            type="button"
            onClick={onQuotePreview}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            Quote Preview
          </Button>
          <Button
            type="button"
            onClick={handleGenerateFullPackage}
            disabled={isGeneratingPackage}
            className="bg-[#15803D] hover:bg-[#166534] text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isGeneratingPackage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {isGeneratingPackage ? "Generating..." : "Generate Full Package (PDF)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleContractOnlyPdf}
            disabled={isDownloadingContract}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-white flex items-center gap-1.5"
          >
            {isDownloadingContract ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {isDownloadingContract ? "Downloading..." : "Contract Only (PDF)"}
          </Button>
        </div>
      </div>

      {/* Customer Information Form Card - Commented out as server preview generates contract directly */}
      {/* 
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Customer & Agreement Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              CUSTOMER / COMPANY NAME
            </label>
            <input
              type="text"
              value={customerLegalName}
              onChange={(e) => setCustomerLegalName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              STREET ADDRESS
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              CITY, STATE ZIP
            </label>
            <input
              type="text"
              value={customerCityStateZip}
              onChange={(e) => setCustomerCityStateZip(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              EMAIL
            </label>
            <input
              type="text"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              EFFECTIVE DATE
            </label>
            <input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              CONTRACT TYPE
            </label>
            <div className="relative">
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer pr-8"
              >
                <option value="Supply & Delivery Only">Supply & Delivery Only</option>
                <option value="Supply, Delivery & Erection">Supply, Delivery & Erection</option>
                <option value="Installation Only">Installation Only</option>
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              DEPOSIT
            </label>
            <input
              type="text"
              value={depositPct}
              onChange={(e) => setDepositPct(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              TOTAL CONTRACT VALUE
            </label>
            <input
              type="text"
              value={totalContractValue}
              onChange={(e) => setTotalContractValue(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAutoFill}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg px-4 py-2 cursor-pointer bg-white"
          >
            Auto-fill from Quote
          </Button>
        </div>
      </div>
      */}

      {/* Document Contract Server Preview Box */}
      <ServerDocumentPreview
        html={serverPreviewHtml}
        isLoading={isPreviewLoading}
        error={previewError}
        onRetry={refetchPreview}
        title={`Contract Agreement — ${customerLegalName || "Valued Client"}`}
        minHeight={750}
      />

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successMessage}
      />
    </div>
  );
}

