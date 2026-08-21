import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import type { ExtractShipperResponseData, ExtractDrawingResponseData } from "../estimates.api";

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
  onBackToBreakdown,
  onQuotePreview,
}: QuoteContractTabProps) {
  const { scope } = useQuotationStore();

  const defaultCustomerLegalName =
    quotationForm?.leadName ||
    extractedDrawing?.extracted?.customer ||
    extractedShipper?.coverSheet?.labelMap?.customer ||
    "Council Bluffs, IA 51503";

  const defaultCustomerAddress =
    quotationForm?.street ||
    extractedShipper?.coverSheet?.labelMap?.project ||
    "123 Main Street";

  const defaultCustomerCityStateZip =
    quotationForm?.cityStateZip ||
    extractedShipper?.coverSheet?.labelMap?.location ||
    "Council Bluffs, IA 51503";

  const defaultCustomerEmail = quotationForm?.email || "customer@gmail.com";

  const defaultEffectiveDate = quotationForm?.quoteDate || "July 31, 2026";

  const computedContractType =
    scope?.toLowerCase() === "supply"
      ? "Supply & Delivery Only"
      : scope?.toLowerCase() === "install"
      ? "Installation Only"
      : scope?.toLowerCase() === "both"
      ? "Supply, Delivery & Erection"
      : "Supply & Delivery Only";

  const pricing = extractedShipper?.pricing;
  const totalSellVal = pricing?.totSell ?? pricing?.matSell ?? 366584;
  const defaultTotalContractValue =
    typeof totalSellVal === "number"
      ? `$${Math.round(totalSellVal).toLocaleString()}`
      : String(totalSellVal).startsWith("$")
      ? String(totalSellVal)
      : `$${totalSellVal}`;

  // Customer Form State
  const [customerLegalName, setCustomerLegalName] = useState(defaultCustomerLegalName);
  const [customerAddress, setCustomerAddress] = useState(defaultCustomerAddress);
  const [customerCityStateZip, setCustomerCityStateZip] = useState(defaultCustomerCityStateZip);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [effectiveDate, setEffectiveDate] = useState(defaultEffectiveDate);
  const [contractType, setContractType] = useState(computedContractType);
  const [depositPct, setDepositPct] = useState("Forty-percent (40%)");
  const [totalContractValue, setTotalContractValue] = useState(defaultTotalContractValue);

  // Sync state when dynamic props arrive/change
  useEffect(() => {
    if (quotationForm?.leadName || extractedDrawing?.extracted?.customer || extractedShipper?.coverSheet?.labelMap?.customer) {
      setCustomerLegalName(
        quotationForm?.leadName ||
          extractedDrawing?.extracted?.customer ||
          extractedShipper?.coverSheet?.labelMap?.customer ||
          "Council Bluffs, IA 51503"
      );
    }
    if (quotationForm?.street || extractedShipper?.coverSheet?.labelMap?.project) {
      setCustomerAddress(
        quotationForm?.street ||
          extractedShipper?.coverSheet?.labelMap?.project ||
          "123 Main Street"
      );
    }
    if (quotationForm?.cityStateZip || extractedShipper?.coverSheet?.labelMap?.location) {
      setCustomerCityStateZip(
        quotationForm?.cityStateZip ||
          extractedShipper?.coverSheet?.labelMap?.location ||
          "Council Bluffs, IA 51503"
      );
    }
    if (quotationForm?.email) {
      setCustomerEmail(quotationForm.email);
    }
    if (quotationForm?.quoteDate) {
      setEffectiveDate(quotationForm.quoteDate);
    }
    if (scope) {
      setContractType(
        scope.toLowerCase() === "supply"
          ? "Supply & Delivery Only"
          : scope.toLowerCase() === "install"
          ? "Installation Only"
          : scope.toLowerCase() === "both"
          ? "Supply, Delivery & Erection"
          : "Supply & Delivery Only"
      );
    }
    if (pricing?.totSell != null || pricing?.matSell != null) {
      const val = pricing?.totSell ?? pricing?.matSell;
      setTotalContractValue(
        typeof val === "number" ? `$${Math.round(val).toLocaleString()}` : String(val)
      );
    }
  }, [extractedShipper, quotationForm, extractedDrawing, scope, pricing?.totSell, pricing?.matSell]);

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
        <div className="border border-slate-200 rounded-2xl p-8 md:p-12 bg-white space-y-8 shadow-xs text-slate-600 text-xs leading-relaxed max-w-4xl mx-auto">
          {/* Document Title */}
          <h2 className="text-base font-extrabold text-slate-900 text-center uppercase tracking-wide">
            Fabrication & Supply Agreement
          </h2>

          {/* Contract Content */}
          <div className="space-y-4 font-normal text-slate-500 text-[11px] leading-relaxed">
            <p>Fabrication & Supply Agreement</p>

            <p>
              This Fabrication & Supply Agreement ("Agreement"), Dated As Of{" "}
              <span className="font-semibold text-slate-700">
                {effectiveDate || "July 31, 2026"}
              </span>{" "}
              ("Effective Date"), Is Entered Into By And Between Steel Investments, LLC
              ("Steel"), And{" "}
              <span className="font-semibold text-slate-700">
                {customerLegalName || "Council Bluffs, IA 51503"}
              </span>{" "}
              ("Customer").
            </p>

            <p>
              Purchase And Sale Of Goods. Subject To The Terms And Conditions Of This Agreement,
              Customer Shall Purchase, And Steel Shall Fabricate And Sell, The Goods Set Forth In
              Exhibit A. Upon Steel's Receipt Of Customer's First Deposit, Customer Agrees To
              Purchase All Goods Under Exhibit A And Further Agrees That Customer May Not Cancel
              Or Request Revisions To The Goods.
            </p>

            <p>
              Engineering Drawings. Steel Will Commence Engineering Drawing For The Goods Upon
              Customer's Payment Of The First Deposit.
            </p>

            <p>
              Delivery. The Goods Will Be Delivered To The Location Specified By Customer Using
              Standard Methods For Packaging And Shipping.
            </p>

            <p>
              Price And Payment.
              <br />
              Price. Customer Shall Purchase The Goods From Steel At The Price Set Forth In
              Exhibit A. The Price May Fluctuate Due To Variations In The Cost Of Raw Materials,
              Labor, Transport, Or Overhead Expenses.
            </p>

            <p>
              Deposit. Customer Acknowledges And Agrees That Steel Requires An Upfront,
              Non-Refundable Deposit Of{" "}
              <span className="font-semibold text-slate-700">
                {depositPct || "Forty-Percent (40%)"}
              </span>{" "}
              For Purposes Of Procuring Materials, Payable In Two Installments: (i) Ten-Percent
              (10%) Of The Price Due Upon The Effective Date; And (ii) Thirty-Percent (30%) Due
              Upon Engineer Approval.
            </p>

            <p>
              Payment Terms. Upon Completion Of Fabrication, Steel Shall Invoice Customer For All
              Remaining Amounts. Customer Shall Pay All Invoiced Amounts At Least Two (2) Days
              Prior To Shipment.
            </p>

            <p>
              Late Payments. Customer Shall Pay Interest On All Late Payments At 1.5% Per Month.
              Customer Shall Reimburse Steel For All Costs Incurred In Collecting Late Payments,
              Including Attorneys' Fees.
            </p>

            <p>
              Termination. Steel May Immediately Terminate This Agreement If Customer Fails To
              Pay Any Amount When Due, Or If Customer Is In Breach Of Any Representation,
              Warranty, Or Covenant.
            </p>

            <p>
              Limited Product Warranty. Steel Warrants That The Goods Shall Be Free From Material
              Defects In Workmanship Upon Delivery. Customer Shall Notify Steel Within Seventy-Two
              (72) Hours Of Any Alleged Defect.
            </p>

            <p>
              Indemnification. Customer Shall Indemnify, Defend And Hold Harmless Steel And Its
              Affiliates From Any Third-Party Claims Arising From: (i) Breach Of This Agreement;
              (ii) Negligence Or Willful Misconduct; (iii) Any Bodily Injury Or Property Damage;
              Or (iv) Failure To Comply With Applicable Laws.
            </p>

            <p>
              Limitation Of Liability. TO THE MAXIMUM EXTENT PERMITTED BY LAW, STEEL SHALL NOT BE
              LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES.
            </p>

            <p>
              Force Majeure. Steel Shall Not Be Liable For Any Failure Or Delay In Fulfilling Any
              Term Of This Agreement When Caused By Circumstances Beyond Its Reasonable Control.
            </p>

            <p>
              Governing Law. This Agreement Shall Be Governed By The Laws Of The State Of Delaware.
              Any Disputes Shall Be Brought In The Appropriate Courts Located In Douglas County,
              Nebraska.
            </p>

            <p className="pt-2">
              EXHIBIT A — GOODS
              <br />
              Total Contract Value:{" "}
              <span className="font-semibold text-slate-700">
                {totalContractValue || "$18,398"}
              </span>
              <br />
              Scope: Fabrication And Supply Of Pre-Engineered Metal Building Materials And Systems.
            </p>
          </div>

          {/* SIGNATURES Section */}
          <div className="pt-6 space-y-8 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              SIGNATURES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[11px]">
              {/* STEEL INVESTMENTS, LLC */}
              <div className="space-y-4">
                <span className="font-bold text-slate-900 block">
                  STEEL INVESTMENTS, LLC
                </span>

                <div className="flex items-center gap-6 pt-4 text-slate-400">
                  <span>Authorized Signature</span>
                  <span>Date</span>
                </div>

                <div className="space-y-1 text-slate-500 pt-2 font-medium">
                  <p>Name: Travis Overhue</p>
                  <p>Title: Owner</p>
                </div>
              </div>

              {/* [CUSTOMER LEGAL ENTITY NAME] */}
              <div className="space-y-4">
                <span className="font-bold text-slate-900 block uppercase">
                  [{customerLegalName || "CUSTOMER LEGAL ENTITY NAME"}]
                </span>

                <div className="flex items-center gap-6 pt-4 text-slate-400">
                  <span>Authorized Signature</span>
                  <span>Date</span>
                </div>

                <div className="space-y-1 text-slate-400 pt-2 font-medium">
                  <p>[EMAIL ADDRESS]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
