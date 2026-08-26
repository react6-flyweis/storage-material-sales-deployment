import { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import type { ExtractShipperResponseData, ExtractDrawingResponseData } from "../estimates.api";
import { useQuotationPricing } from "../hooks/use-quotation-pricing";
import { ContractPreviewDocument } from "./contract-preview-document";

interface QuoteContractTabProps {
  extractedShipper?: ExtractShipperResponseData;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  sqFt?: string | number;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
}

export function QuoteContractTab({
  extractedShipper,
  quotationForm,
  extractedDrawing,
  sqFt,
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

  const handleGenerateFullPackage = () => {
    setSuccessMessage("Generating Full Quote Package PDF...");
    setSuccessDialogOpen(true);
  };

  const handleContractOnlyPdf = () => {
    setSuccessMessage("Downloading Contract Only PDF...");
    setSuccessDialogOpen(true);
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
              className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg px-4 py-1.5 cursor-pointer h-8 shadow-2xs"
            >
              Generate Full Quote Package
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleContractOnlyPdf}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg px-3.5 py-1.5 cursor-pointer h-8 bg-white"
            >
              Contract Only (PDF)
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
              placeholder="Auto-filled from customer info above"
              value={customerLegalName}
              onChange={(e) => setCustomerLegalName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Customer Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Customer Address
            </label>
            <input
              type="text"
              placeholder="Street Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Customer City, State ZIP */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Customer City, State ZIP
            </label>
            <input
              type="text"
              placeholder="City, State, ZIP"
              value={customerCityStateZip}
              onChange={(e) => setCustomerCityStateZip(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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

          {/* Contract Type */}
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
          depositPct={depositPct}
          totalContractValue={totalContractValue}
          contractType={contractType}
        />
      </div>
    </div>
  );
}
