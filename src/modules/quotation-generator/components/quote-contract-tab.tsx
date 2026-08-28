import { useState } from "react";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
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
import { ContractPreviewDocument } from "./contract-preview-document";

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
  const [customerLegalName, setCustomerLegalName] = useState(defaultCustomerLegalName);
  const [customerAddress, setCustomerAddress] = useState(defaultCustomerAddress);
  const [customerCityStateZip, setCustomerCityStateZip] = useState(defaultCustomerCityStateZip);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [effectiveDate, setEffectiveDate] = useState(defaultEffectiveDate);
  const [contractType, setContractType] = useState(computedContractType);
  const [depositPct, setDepositPct] = useState("Forty-percent (40%)");
  const [totalContractValue, setTotalContractValue] = useState(defaultTotalContractValue);

  // Download states
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [isDownloadingContract, setIsDownloadingContract] = useState(false);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      console.error("Failed to download contract PDF, opening print dialog:", err);
      handlePrint(`Contract_${customerLegalName || "Agreement"}`);
    } finally {
      setIsDownloadingContract(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successMessage}
      />

      {/* Main Outer Container */}
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-2xs space-y-6">
        {/* Header Section with Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <span>📄</span>
              <span>Fabrication & Supply Agreement</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Fill customer info · auto-fills from quote · print contract or generate full package
            </p>
          </div>

          {/* Action Buttons Top Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onBackToBreakdown}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer h-8 flex items-center gap-1 bg-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Breakdown
            </Button>
            <Button
              type="button"
              onClick={onQuotePreview}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer h-8 border border-blue-200"
            >
              Quote Preview
            </Button>
            <Button
              type="button"
              onClick={handleGenerateFullPackage}
              disabled={isGeneratingPackage}
              className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg px-4 py-1.5 cursor-pointer h-8 shadow-2xs flex items-center gap-1.5"
            >
              {isGeneratingPackage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating Package...</span>
                </>
              ) : (
                <span>Generate Full Quote Package</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleContractOnlyPdf}
              disabled={isDownloadingContract}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg px-3.5 py-1.5 cursor-pointer h-8 bg-white flex items-center gap-1.5"
            >
              {isDownloadingContract ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <span>Contract Only (PDF)</span>
              )}
            </Button>
          </div>
        </div>

        {/* Customer Info Form Fields (2-column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Legal Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Customer Legal Name
            </label>
            <input
              type="text"
              value={customerLegalName}
              onChange={(e) => setCustomerLegalName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Customer Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Customer Address (Street)
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* City, State, Zip */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              City, State, Zip
            </label>
            <input
              type="text"
              value={customerCityStateZip}
              onChange={(e) => setCustomerCityStateZip(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Customer Email
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Effective Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Effective Date
            </label>
            <input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Contract Type Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Contract Type
            </label>
            <div className="relative">
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-10"
              >
                <option value="Supply & Delivery Only">Supply & Delivery Only</option>
                <option value="Supply, Delivery & Erection">Supply, Delivery & Erection</option>
                <option value="Turnkey Construction">Turnkey Construction</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Deposit % (default 40%) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Deposit % (default 40%)
            </label>
            <input
              type="text"
              value={depositPct}
              onChange={(e) => setDepositPct(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Total Contract Value ($) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Total Contract Value ($)
            </label>
            <input
              type="text"
              value={totalContractValue}
              onChange={(e) => setTotalContractValue(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Auto-fill from Quote Button */}
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

        {/* Document Contract Preview Box */}
        <ContractPreviewDocument
          effectiveDate={effectiveDate}
          customerLegalName={customerLegalName}
          customerAddress={customerAddress}
          customerCityStateZip={customerCityStateZip}
          customerEmail={customerEmail}
          depositPct={depositPct}
          totalContractValue={totalContractValue}
          contractType={contractType}
        />
      </div>
    </div>
  );
}
