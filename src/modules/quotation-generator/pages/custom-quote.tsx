import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  createCustomQuoteProvider,
  previewCustomQuoteProvider,
  downloadCustomQuotePdfProvider,
} from "../custom-quotes.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";

interface CalculationResult {
  totalCost: number;
  totalSell: number;
  profit: number;
  marginPercent: number;
}

export default function CustomQuote() {
  const navigate = useNavigate();

  const { setPembLeadData } = useQuotationStore();

  // Project Details Form State
  const [customerCompany, setCustomerCompany] = useState("");
  const [location, setLocation] = useState("");
  const [buildingSize, setBuildingSizeInput] = useState("");
  const [scope, setScope] = useState("Supply, Delivery & Installation");

  // Cost and Pricing State
  const [materialCost, setMaterialCost] = useState("");
  const [freightCost, setFreightCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [targetMargin, setTargetMargin] = useState("20");
  const [fixedSellPrice, setFixedSellPrice] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState("15");

  // Scope Details State
  const [includedScope, setIncludedScope] = useState(
    "Supply and delivery of PEMB\nAll trim and accessories\nAnchor bolt plan"
  );
  const [excludedScope, setExcludedScope] = useState(
    "Foundation & Concrete\nErection/Installation\nElectrical & Plumbing"
  );

  // Calculation Results
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const calculateNumbers = (): CalculationResult => {
    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const totalCost = mat + freight + labor;

    const fixedSell = parseFloat(fixedSellPrice) || 0;
    const marginPct = parseFloat(targetMargin) || 0;

    let totalSell = 0;
    let marginPercent = 0;

    if (fixedSell > 0) {
      totalSell = fixedSell;
      marginPercent =
        totalSell > 0 ? ((totalSell - totalCost) / totalSell) * 100 : 0;
    } else {
      const marginDecimal = marginPct / 100;
      if (marginDecimal >= 1) {
        totalSell = totalCost;
        marginPercent = 0;
      } else {
        totalSell = marginDecimal > 0 ? totalCost / (1 - marginDecimal) : totalCost;
        marginPercent = marginPct;
      }
    }

    const profit = Math.max(0, totalSell - totalCost);

    return {
      totalCost,
      totalSell,
      profit,
      marginPercent,
    };
  };

  const handleCalculate = async () => {
    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;

    setIsCalculating(true);
    try {
      const preview = await previewCustomQuoteProvider({
        matCost: mat,
        freight,
        laborCost: labor,
        marginPct,
        sellOverride: fixedSell,
      });

      const res: CalculationResult = {
        totalCost: preview.totalCost,
        totalSell: preview.sell,
        profit: preview.profit,
        marginPercent: preview.profPct,
      };
      setCalcResult(res);
      toast.success(
        `Calculated: Total Sell $${Math.round(res.totalSell).toLocaleString()} (${res.marginPercent.toFixed(1)}% margin)`
      );
    } catch {
      const localResult = calculateNumbers();
      setCalcResult(localResult);
      toast.success(
        `Calculated: Total Sell $${Math.round(localResult.totalSell).toLocaleString()} (${localResult.marginPercent.toFixed(1)}% margin)`
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateQuote = async () => {
    if (!customerCompany.trim()) {
      toast.error("Please enter a Customer / Company name");
      return;
    }

    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;
    const validDays = parseInt(quoteValidDays) || 15;

    setIsSaving(true);
    let savedQuoteId = "";
    try {
      const savedDoc = await createCustomQuoteProvider({
        customer: customerCompany.trim(),
        location: location.trim(),
        size: buildingSize.trim(),
        scope,
        expDays: validDays,
        matCost: mat,
        freight,
        laborCost: labor,
        marginPct,
        sellOverride: fixedSell,
        inclusions: includedScope.split("\n").filter(Boolean),
        exclusions: excludedScope.split("\n").filter(Boolean),
        sow: {
          overview: `${scope} for ${buildingSize.trim()}`,
          terms: `Valid for ${validDays} days`,
        },
      });
      if (savedDoc?._id) {
        savedQuoteId = savedDoc._id;
        setCalcResult({
          totalCost: savedDoc.totalCost,
          totalSell: savedDoc.sell,
          profit: savedDoc.profit,
          marginPercent: savedDoc.profPct,
        });
      }
    } catch (err) {
      console.warn("Server custom-quote creation failed, proceeding with local preview state:", err);
    } finally {
      setIsSaving(false);
    }

    const result = calcResult || calculateNumbers();

    // Save lead details to store
    setPembLeadData({
      leadName: customerCompany.trim(),
      street: location.trim(),
      cityStateZip: location.trim(),
      buildingSize: buildingSize.trim(),
    });

    toast.success("Quote generated successfully!");

    navigate("/quotation/quote-preview/view", {
      state: {
        quotationForm: {
          leadName: customerCompany.trim(),
          cityStateZip: location.trim(),
          buildingSize: buildingSize.trim(),
          quoteDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          quoteValidDays: quoteValidDays || "15",
          ...(savedQuoteId ? { customQuoteId: savedQuoteId } : {}),
        },
        buildingSize: buildingSize.trim(),
        customPricing: {
          materialCost: mat,
          freightCost: freight,
          laborCost: labor,
          targetMargin: marginPct,
          fixedSellPrice: fixedSell || 0,
          totalCost: result.totalCost,
          totalSell: result.totalSell,
          profit: result.profit,
          scope,
          includedItems: includedScope.split("\n").filter(Boolean),
          excludedItems: excludedScope.split("\n").filter(Boolean),
        },
      },
    });
  };

  const handleDownloadPdf = async () => {
    if (!customerCompany.trim()) {
      toast.error("Please enter a Customer / Company name first");
      return;
    }
    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;
    const validDays = parseInt(quoteValidDays) || 15;

    setIsSaving(true);
    try {
      const savedDoc = await createCustomQuoteProvider({
        customer: customerCompany.trim(),
        location: location.trim(),
        size: buildingSize.trim(),
        scope,
        expDays: validDays,
        matCost: mat,
        freight,
        laborCost: labor,
        marginPct,
        sellOverride: fixedSell,
        inclusions: includedScope.split("\n").filter(Boolean),
        exclusions: excludedScope.split("\n").filter(Boolean),
      });

      const pdfRes = await downloadCustomQuotePdfProvider(savedDoc._id);
      const b64 = pdfRes.data?.fileBase64 || pdfRes.fileBase64;
      if (b64) {
        downloadPdfFromBase64(
          b64,
          pdfRes.data?.fileName || pdfRes.fileName || `Custom-Quote-${customerCompany.trim()}.pdf`
        );
        toast.success("Custom Quote PDF downloaded!");
      }
    } catch {
      toast.error("Failed to generate PDF from server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Title & Subtitle */}
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Custom Quote
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Build a quote manually without a shipper file
        </p>
      </div>

      {/* Card 1: Project Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-semibold text-slate-700">
            Project Details
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Row 1: Customer / Company & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer / Company
              </label>
              <input
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Building Size & Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Building Size
              </label>
              <input
                type="text"
                value={buildingSize}
                onChange={(e) => setBuildingSizeInput(e.target.value)}
                placeholder="e.g. 80x120x16 PEMB"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scope
              </label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-800 font-normal focus:border-blue-500 focus:bg-white transition-colors">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supply, Delivery & Installation">
                    Supply, Delivery & Installation
                  </SelectItem>
                  <SelectItem value="Supply & Delivery Only">
                    Supply & Delivery Only
                  </SelectItem>
                  <SelectItem value="Installation Only">
                    Installation Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Material Cost $, Freight Cost $, Labor Cost $ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Material Cost $
              </label>
              <input
                type="number"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Freight Cost $
              </label>
              <input
                type="number"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Labor Cost $
              </label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Row 4: Target Margin %, Fixed Sell Price $ (Optional), Quote Valid (Days) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Margin %
              </label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                placeholder="20"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fixed Sell Price $ (Optional)
              </label>
              <input
                type="number"
                value={fixedSellPrice}
                onChange={(e) => setFixedSellPrice(e.target.value)}
                placeholder="Leave blank to use margin"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quote Valid (Days)
              </label>
              <input
                type="number"
                value={quoteValidDays}
                onChange={(e) => setQuoteValidDays(e.target.value)}
                placeholder="15"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculate}
              className="px-6 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isCalculating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleGenerateQuote}
              className="px-6 py-2.5 bg-[#0e3a8c] hover:bg-[#0b2f73] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate Quote
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDownloadPdf}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>

          {/* Optional Calculation Breakdown Summary */}
          {calcResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Total Cost
                </span>
                <span className="text-sm font-bold text-slate-800">
                  ${Math.round(calcResult.totalCost).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Estimated Sell
                </span>
                <span className="text-sm font-bold text-blue-700">
                  ${Math.round(calcResult.totalSell).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Estimated Profit
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  ${Math.round(calcResult.profit).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Margin
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {calcResult.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Scope Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-semibold text-slate-700">
            Scope Details
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer / Company
              </label>
              <textarea
                rows={4}
                value={includedScope}
                onChange={(e) => setIncludedScope(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg p-3 text-sm text-slate-600 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors leading-relaxed resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <textarea
                rows={4}
                value={excludedScope}
                onChange={(e) => setExcludedScope(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg p-3 text-sm text-slate-600 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
