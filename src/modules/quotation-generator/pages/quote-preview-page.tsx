import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Printer, FolderUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import {
  downloadPdfProvider,
  saveEstimateProvider,
  type ExtractDrawingResponseData,
  type ExtractShipperResponseData,
} from "../estimates.api";

export function QuotePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);
  const [estimateId, setEstimateId] = useState<string | null>(null);

  const navState = (location.state || {}) as {
    quotationForm?: Record<string, string>;
    extractedDrawing?: ExtractDrawingResponseData;
    extractedShipper?: ExtractShipperResponseData;
    sqFt?: string;
    buildingSize?: string;
    additionalNotes?: string;
    pdfFileName?: string;
  };

  const {
    jobType,
    scope,
    roofType,
    squareFootage: storeSqFt,
    concreteInclude,
    concreteInclusions,
    concreteSlabThickness,
    concretePsiRating,
    concreteNotes,
    insulationInclude,
    insulationInclusions,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationNotes,
  } = useQuotationStore();

  const customerLeadName =
    navState.quotationForm?.leadName ||
    navState.extractedDrawing?.extracted?.customer ||
    navState.extractedShipper?.coverSheet?.labelMap?.customer ||
    "Council Bluffs, IA 51503";

  const customerAddress =
    navState.quotationForm?.cityStateZip ||
    navState.quotationForm?.street ||
    navState.extractedShipper?.coverSheet?.labelMap?.project ||
    "Council Bluffs, IA 51503";

  const customerEmail = navState.quotationForm?.email || "customer@gmail.com";
  const projectName = navState.quotationForm?.projectName || navState.extractedDrawing?.extracted?.project || "Customer Project";
  const quoteDate = navState.quotationForm?.quoteDate || "August 1, 2026";
  const expDate = "August 30, 2026";

  const effectiveSqFt =
    parseFloat(navState.sqFt || "") ||
    navState.extractedShipper?.squareFootage ||
    storeSqFt ||
    68750;

  const displayBuildingSize =
    navState.buildingSize?.trim() ||
    (navState.extractedDrawing?.extracted?.width
      ? `${navState.extractedDrawing.extracted.width}×${navState.extractedDrawing.extracted.length}×${navState.extractedDrawing.extracted.eave || ""}`
      : `${effectiveSqFt.toLocaleString()} SF ${jobType}`);

  const pricing = navState.extractedShipper?.pricing;

  const totalSellVal = pricing?.totSell ?? pricing?.matSell ?? 326563;
  const totalSellFormatted = typeof totalSellVal === "number" ? `$${Math.round(totalSellVal).toLocaleString()}` : `$${totalSellVal}`;

  const matCostVal = pricing?.matCost ?? 167427;
  const matCostFormatted = typeof matCostVal === "number" ? `$${Math.round(matCostVal).toLocaleString()}` : `$${matCostVal}`;

  const freightVal = pricing?.freight ?? 1236;
  const freightFormatted = typeof freightVal === "number" ? `$${Math.round(freightVal).toLocaleString()}` : `$${freightVal}`;

  const instSellVal = pricing?.instSell ?? 157900;
  const instSellFormatted = typeof instSellVal === "number" ? `$${Math.round(instSellVal).toLocaleString()}` : `$${instSellVal}`;

  const pricePerSf = pricing?.sfPrice ?? (totalSellVal && effectiveSqFt ? (totalSellVal / effectiveSqFt).toFixed(2) : "4.75");
  const pricePerSfFormatted = typeof pricePerSf === "number" ? `$${pricePerSf}` : (String(pricePerSf).startsWith("$") ? pricePerSf : `$${pricePerSf}/SF`);

  const totalWeight = navState.extractedShipper?.totalWeightLbs || pricing?.totWt || 9508;
  const weightDisplay = typeof totalWeight === "number" ? `${totalWeight.toLocaleString()} Lbs` : `${totalWeight}`;
  const trucks = pricing?.trucks ?? 1;

  // Compute dynamic Scope Included and Exclusions for Quote
  const isSupply = scope.toLowerCase() === "supply" || scope.toLowerCase() === "both";
  const isInstall = scope.toLowerCase() === "install" || scope.toLowerCase() === "both";

  const dynamicScopeIncluded: Array<{ text: string; category?: string }> = [];
  const dynamicExclusions: string[] = [];

  // 1. Structural & Supply Framing
  if (isSupply) {
    dynamicScopeIncluded.push({
      text:
        jobType.toLowerCase() === "storage"
          ? "Full Storage Structural System"
          : "Full PEMB Rigid Frame Structural System",
    });
  }
  // 2. Installation & Equipment
  if (isInstall) {
    dynamicScopeIncluded.push({
      text: "Labor & Installation",
    });
    dynamicScopeIncluded.push({
      text: "Equipment & Supervision",
    });
  }

  // 3. Concrete Inclusions
  if (concreteInclude && concreteInclusions.length > 0) {
    concreteInclusions.forEach((item) => {
      dynamicScopeIncluded.push({
        text: `${item}`,
        category: "concrete",
      });
    });
  }

  // 4. Insulation Inclusions
  if (insulationInclude && insulationInclusions.length > 0) {
    insulationInclusions.forEach((item) => {
      dynamicScopeIncluded.push({
        text: `${item}`,
        category: "insulation",
      });
    });
  }

  // 6. Standard Unincluded Items
  dynamicExclusions.push("Doors (Overhead, Roll-Up, Man Doors - Unless Noted)");
  dynamicExclusions.push("Electrical, Plumbing, HVAC");
  dynamicExclusions.push("Fire Suppression");
  dynamicExclusions.push("Permits, Impact Fees & Engineering");

  const initialPdfName = navState.pdfFileName || navState.extractedDrawing?.fileName || "Steel_Building_Preliminary_Drawing_Vector.pdf";

  // File state for PDF dropzone
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; url?: string } | null>({
    name: initialPdfName,
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
      const payload = {
        leadCompanyName: customerLeadName,
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        buildingSize: displayBuildingSize,
        squareFootage: effectiveSqFt,
        jobNumber: navState.quotationForm?.jobNumber || navState.extractedDrawing?.extracted?.jobnumber || "",
        pricingResult: navState.extractedShipper?.pricing,
        fullQuote: navState.extractedShipper?.fullQuote || (navState.extractedShipper?.pricing as Record<string, unknown> | undefined),
        extractedDrawingFields: navState.extractedDrawing?.extracted,
        drawingAttachments: selectedPdf ? [{ name: selectedPdf.name, includeInQuote: true }] : [],
        sections: selectedPdf ? ["quote", "sow", "contract", "drawings"] : ["quote", "sow", "contract"],
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

  const handleSaveToHistory = async () => {
    setIsSavingEstimate(true);
    try {
      const res = await saveEstimateProvider(
        {
          _id: estimateId || undefined,
          jobType,
          scope: scope.toLowerCase(),
          leadCompanyName: customerLeadName,
          customerEmail,
          streetAddress: navState.quotationForm?.street || "",
          cityStateZip: navState.quotationForm?.cityStateZip || customerAddress,
          buildingSize: displayBuildingSize,
          squareFootage: effectiveSqFt,
          sf: effectiveSqFt,
          jobNumber: navState.quotationForm?.jobNumber || navState.extractedDrawing?.extracted?.jobnumber || "",
          sourceFileName: navState.pdfFileName || navState.extractedShipper?.fileName || "",
          parsedCategories: navState.extractedShipper?.parsedCategories,
          tabSummary: navState.extractedShipper?.tabSummary,
          pricingResult: navState.extractedShipper?.pricing,
          fullQuoteResult: navState.extractedShipper?.fullQuote || (navState.extractedShipper?.pricing as Record<string, unknown> | undefined),
          extractedDrawingFields: navState.extractedDrawing?.extracted,
          status: "draft",
        },
        estimateId || undefined
      );

      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id;
      if (savedId) {
        setEstimateId(savedId);
      }
      navigate("/sales/quotation/history");
    } catch (err) {
      console.error("Failed to save estimate to history:", err);
      navigate("/sales/quotation/history");
    } finally {
      setIsSavingEstimate(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setSelectedPdf({ name: file.name, url });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedPdf({ name: file.name, url });
    }
  };

  const handleClearAll = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Quote Preview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Full assembled package — Quote · SOW · Contract · Building Drawings · Print or Save as PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {isDownloadingPdf ? "Generating PDF..." : "Generate & Print PDF"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveToHistory}
            disabled={isSavingEstimate}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isSavingEstimate && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSavingEstimate ? "Saving..." : "Save to History"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 w-full max-w-5xl print:max-w-none print:w-full">
        {/* Building drawings & plans Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-xl no-print">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Building drawings & plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag images here — they appear after the SOW in the final PDF...
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer bg-white"
              >
                Clear All
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                Preview assembled PDF ↓
              </Button>
            </div>
          </div>

          {/* PDF Dropzone Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative border-2 border-dashed border-blue-400 bg-[#E6F4EA] rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors"
          >
            <label className="cursor-pointer flex flex-col items-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md">
                <FolderUp className="h-6 w-6" />
              </div>

              {selectedPdf ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                    <span>✓</span>
                    <span>{selectedPdf.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    PDF Only - We only read page 1 - Click to Browse
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    Drop PDF drawings here or click to browse
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    PDF Only - We only read page 1
                  </p>
                </div>
              )}
            </label>
          </div>
        </Card>

        {/* Printable Estimate Card Box */}
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800 print-card">
          {/* Estimate Header */}
          <div className="flex flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
                <span className="text-slate-900 tracking-wider">STORAGE</span>
                <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded text-sm font-black tracking-normal uppercase">
                  MATERIALS
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                (888) 968-1222 · travis@storagematerials.com · www.storagematerials.com
              </p>
            </div>

            <div className="text-right text-xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">ESTIMATE</h3>
              <p className="text-slate-600 mt-1 text-[11px]">Date: {quoteDate}</p>
              <p className="text-slate-600 text-[11px]">Expiration: {expDate}</p>
              <p className="text-slate-600 text-[11px]">Business/Tax #: 99-4515145</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  PREPARED FOR
                </span>
                <span className="font-bold text-slate-900 text-sm">{customerLeadName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  BUILDING
                </span>
                <span className="font-bold text-slate-900 text-sm">{displayBuildingSize}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  ROOF SYSTEM
                </span>
                <span className="font-bold text-slate-900 text-sm">{roofType}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  LOCATION
                </span>
                <span className="font-bold text-slate-900 text-sm">{customerAddress}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  SCOPE
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {jobType} {scope === "Supply" ? "Supply & Delivery Only" : scope === "Install" ? "Installation Only" : "Supply, Delivery & Installation"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  TOTAL WEIGHT
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {weightDisplay} · {trucks} Truck{trucks > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Banner - TOTAL PROJECT INVESTMENT */}
          <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
            <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
              TOTAL PROJECT INVESTMENT
            </div>
            <div className="text-3xl md:text-4xl font-extrabold">{totalSellFormatted}</div>
            <div className="text-xs text-blue-200 font-medium">
              {pricePerSfFormatted} · {effectiveSqFt.toLocaleString()} SF · FREIGHT INCLUDED
            </div>
          </div>

          {/* Pricing Summary, Scope Included, Exclusions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-8 text-xs pt-2">
            {/* PRICING SUMMARY */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                PRICING SUMMARY
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                  <span>Material</span>
                  <span className="font-medium text-slate-900">{matCostFormatted}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                  <span>Freight ({trucks} Truck{trucks > 1 ? "s" : ""})</span>
                  <span className="font-medium text-slate-900">{freightFormatted}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                  <span>Installation</span>
                  <span className="font-medium text-slate-900">{instSellFormatted}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-b border-slate-900 pb-2 pt-1">
                  <span>Building Subtotal</span>
                  <span>{totalSellFormatted}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1">
                  <span>Total</span>
                  <span className="text-[#1E3A8A]">{totalSellFormatted}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-4 leading-normal italic">
                Please Refer To The SOW For Detailed Scope. Sales Tax Will Be Added To The Price Of The Building Where Applicable.
              </p>
            </div>

            {/* SCOPE INCLUDED */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                SCOPE INCLUDED
              </h4>
              <ul className="space-y-2 text-slate-600 text-xs">
                {dynamicScopeIncluded.map((item, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 ${item.category === "concrete"
                      ? "text-blue-900 font-medium"
                      : item.category === "insulation"
                        ? "text-indigo-900 font-medium"
                        : item.category === "tax"
                          ? "text-emerald-900 font-medium"
                          : ""
                      }`}
                  >
                    <span
                      className={`font-bold ${item.category === "concrete"
                        ? "text-blue-500"
                        : item.category === "insulation"
                          ? "text-indigo-500"
                          : item.category === "tax"
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                    >
                      •
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXCLUSIONS */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                EXCLUSIONS
              </h4>
              <ul className="space-y-2 text-slate-600 text-xs">
                {dynamicExclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-10 border-t-2 border-slate-900 grid grid-cols-2 gap-8 md:gap-12 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 mb-10">Steel Investments DBA Storage Materials</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-10">Steel Investments DBA Storage Materials</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-10">{customerLeadName}</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <p className="text-center text-[10px] text-slate-400 pt-4 font-medium">
            Thanks For Your Business! Reach Out With Any Questions · (888) 968-1222 · Travis@StorageMaterials.com
          </p>
        </Card>

        {/* Printable Statement of Work (SOW) Card Box */}
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800 print-card">
          {/* Header */}
          <div className="flex flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
                <span className="text-slate-900 tracking-wider">STORAGE</span>
                <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded text-sm font-black tracking-normal uppercase">
                  MATERIALS
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                (888) 968-1222
              </p>
            </div>

            <div className="text-right text-xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">STATEMENT OF WORK</h3>
              <p className="text-slate-600 mt-1 text-[11px]">Date: {quoteDate}</p>
            </div>
          </div>

          {/* Installation Only Banner */}
          <div className="text-center py-2 border-b border-slate-200 text-sm font-bold text-slate-900">
            {jobType} · {scope} Scope
          </div>

          {/* Info Grid */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  PROJECT NAME
                </span>
                <span className="font-bold text-slate-900 text-sm">{projectName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  LOCATION
                </span>
                <span className="font-bold text-slate-900 text-sm">{customerAddress}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  BUILDING SIZE
                </span>
                <span className="font-bold text-slate-900 text-sm">{displayBuildingSize}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  CUSTOMER
                </span>
                <span className="font-bold text-slate-900 text-sm">{customerLeadName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  PREPARED BY
                </span>
                <span className="font-bold text-slate-900 text-sm">Storage Materials</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  DATE
                </span>
                <span className="font-bold text-slate-900 text-sm">{quoteDate}</span>
              </div>
            </div>
          </div>

          {/* SOW Numbered Sections */}
          <div className="space-y-6 text-xs text-slate-700">
            {/* 1. PROJECT OVERVIEW */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                1. PROJECT OVERVIEW
              </h4>
              <p className="text-slate-600 mb-2">
                Storage Materials Will Furnish {isInstall ? "And Install " : ""}A Complete Pre-Engineered Metal Building (PEMB) Package Based On Preliminary Drawings.
              </p>
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Building Summary:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>Approx. {displayBuildingSize}</li>
                  <li>Clear Span Rigid Frame Structure</li>
                  <li>Roof System: {roofType}</li>
                  <li>Wall System: 26 GA Panel (Color TBD / SMP System)</li>
                  <li>Design Loads Per Engineered Drawings</li>
                </ul>
              </div>
            </div>

            {/* 2. SCOPE OF WORK — INCLUSIONS */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                2. SCOPE OF WORK — INCLUSIONS
              </h4>
              <div className="space-y-3 pl-1">
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.1 Primary Structural System</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>Rigid Frames (Rafters & Columns)</li>
                    <li>Base Plates And Welded Connections</li>
                    <li>Anchor Bolt Plans (For Reference Only)</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.2 Secondary Framing</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>Purlins (Roof)</li>
                    <li>Girts (Walls)</li>
                    <li>Eave Struts</li>
                    <li>Bracing (Rod/Cable/Portal As Designed)</li>
                    <li>Flange Bracing</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.3 Roof System</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>{roofType} Roof Panels</li>
                    <li>Ridge Cap</li>
                    <li>Closure Strips</li>
                    <li>Fasteners (Self-Drilling Screws)</li>
                    <li>Sealants (Standard PEMB Package)</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.4 Wall System</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>26 GA Wall Panels</li>
                    <li>Base Trim, Corner Trim, J-Trim</li>
                    <li>Standard Perimeter Trims</li>
                    <li>Fasteners And Closures</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.5 Trim & Accessories</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>Ridge, Eave, Rake, Corners, Base Trim Package</li>
                    <li>Downspouts And Gutters (If Shown On Plans)</li>
                  </ul>
                </div>
                {isInstall && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">2.6 Labor & Equipment</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      <li>Full Erection Crew And Supervision</li>
                      <li>Lifts, Telehandlers, And Equipment</li>
                      <li>Offloading, Staging, And Site Coordination</li>
                    </ul>
                  </div>
                )}
                {isSupply && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">2.7 Delivery</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      <li>Freight To Jobsite (Standard Truck Delivery)</li>
                      <li>Unloading By Others</li>
                      <li>Delivered In Bundled/Packaged Condition</li>
                    </ul>
                  </div>
                )}
                {concreteInclude && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      2.8 Concrete Foundation & Slab ({concreteSlabThickness} · {concretePsiRating})
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {concreteInclusions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {concreteNotes && <li>Note: {concreteNotes}</li>}
                    </ul>
                  </div>
                )}
                {insulationInclude && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      2.9 Insulation System ({insulationSystem} · Roof {insulationRValueRoof} / Wall {insulationRValueWalls})
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {insulationInclusions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {insulationNotes && <li>Note: {insulationNotes}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3. EXCLUSIONS (BY OTHERS) */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                3. EXCLUSIONS (BY OTHERS)
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                {!concreteInclude && <li>Concrete Foundation, Slab, And Anchor Bolts</li>}
                {!insulationInclude && <li>Insulation System</li>}
                <li>Doors (Overhead, Roll-Up, Man Doors)</li>
                <li>Windows, Louvers, Or Ventilation Systems</li>
                <li>Interior Liner Panels</li>
                <li>Cranes, Equipment, Or Unloading (Unless Noted)</li>
                <li>Permits, Impact Fees, Or Inspections</li>
                <li>Electrical, Plumbing, HVAC, Fire Suppression</li>
                <li>Sales Tax (Unless Noted)</li>
              </ul>
            </div>

            {/* 4. CUSTOMER RESPONSIBILITIES */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                4. CUSTOMER RESPONSIBILITIES
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Adequate Site Access For Delivery Trucks</li>
                <li>Offloading Equipment (Forklift/Crane)</li>
                <li>Secure Material Storage After Delivery</li>
                <li>Verification Of Dimensions And Openings</li>
              </ul>
            </div>

            {/* 5. DELIVERY & LEAD TIME */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                5. DELIVERY & LEAD TIME
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Estimated Lead Time: 8-10 Weeks (Subject To Approval & Production)</li>
                <li>Delivery: FOB Jobsite</li>
                <li>Partial Shipments May Occur</li>
              </ul>
            </div>

            {/* 6. TERMS & CONDITIONS */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                6. TERMS & CONDITIONS
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Drawings Are PRELIMINARY — NOT FOR CONSTRUCTION Until Stamped</li>
                <li>Final Pricing Subject To Approved Drawings And Material Escalation</li>
                <li>Storage Materials Not Responsible For Installation Errors, Foundation Discrepancies, Or Field Modifications</li>
              </ul>
            </div>

            {/* 7. WARRANTY */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                7. WARRANTY
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Panel Finish Warranty: Typically 25 Years</li>
                <li>Structural Steel Per PEMB Manufacturer Standard Warranty</li>
              </ul>
            </div>
          </div>

          {/* Banner - TOTAL PROJECT INVESTMENT */}
          <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
            <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
              TOTAL PROJECT INVESTMENT
            </div>
            <div className="text-3xl md:text-4xl font-extrabold">{totalSellFormatted}</div>
            <div className="text-xs text-blue-200 font-medium">
              {pricePerSfFormatted} BUILDING - {scope.toUpperCase()}
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-10 border-t-2 border-slate-900 grid grid-cols-2 gap-8 md:gap-12 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 mb-10">Steel Investments DBA Storage Materials</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-10">{customerLeadName}</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Printable Fabrication & Supply Agreement Card Box */}
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800 print-card">
          <h3 className="text-lg font-bold text-slate-900 text-center">
            Fabrication & Supply Agreement
          </h3>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-800">Fabrication & Supply Agreement</p>
            <p>
              This Fabrication & Supply Agreement ("Agreement"), Dated As Of {quoteDate} ("Effective Date"), Is Entered Into By And Between Steel Investments, LLC ("Steel"), And {customerLeadName} ("Customer").
            </p>
            <p>
              <strong className="text-slate-900">Purchase And Sale Of Goods.</strong> Subject To The Terms And Conditions Of This Agreement, Customer Shall Purchase, And Steel Shall Fabricate And Sell, The Goods Set Forth In Exhibit A. Upon Steel's Receipt Of Customer's First Deposit, Customer Agrees To Purchase All Goods Under Exhibit A And Further Agrees That Customer May Not Cancel Or Request Revisions To The Goods.
            </p>
            <p>
              <strong className="text-slate-900">Engineering Drawings.</strong> Steel Will Commence Engineering Drawing For The Goods Upon Customer's Payment Of The First Deposit.
            </p>
            <p>
              <strong className="text-slate-900">Delivery.</strong> The Goods Will Be Delivered To The Location Specified By Customer Using Standard Methods For Packaging And Shipping.
            </p>
            <p>
              <strong className="text-slate-900">Price And Payment.</strong><br />
              Price. Customer Shall Purchase The Goods From Steel At The Price Set Forth In Exhibit A. The Price May Fluctuate Due To Variations In The Cost Of Raw Materials, Labor, Transport, Or Overhead Expenses.
            </p>
            <p>
              <strong className="text-slate-900">Deposit.</strong> Customer Acknowledges And Agrees That Steel Requires An Upfront, Non-Refundable Deposit Of Forty-Percent (40%) For Purposes Of Procuring Materials, Payable In Two Installments: (i) Ten-Percent (10%) Of The Price Due Upon The Effective Date; And (ii) Thirty-Percent (30%) Due Upon Engineer Approval.
            </p>
            <p>
              <strong className="text-slate-900">Payment Terms.</strong> Upon Completion Of Fabrication, Steel Shall Invoice Customer For All Remaining Amounts. Customer Shall Pay All Invoiced Amounts At Least Two (2) Days Prior To Shipment.
            </p>
            <p>
              <strong className="text-slate-900">Late Payments.</strong> Customer Shall Pay Interest On All Late Payments At 1.5% Per Month. Customer Shall Reimburse Steel For All Costs Incurred In Collecting Late Payments, Including Attorneys' Fees.
            </p>
            <p>
              <strong className="text-slate-900">Termination.</strong> Steel May Immediately Terminate This Agreement If Customer Fails To Pay Any Amount When Due, Or If Customer Is In Breach Of Any Representation, Warranty, Or Covenant.
            </p>
            <p>
              <strong className="text-slate-900">Limited Product Warranty.</strong> Steel Warrants That The Goods Shall Be Free From Material Defects In Workmanship Upon Delivery. Customer Shall Notify Steel Within Seventy-Two (72) Hours Of Any Alleged Defect.
            </p>
            <p>
              <strong className="text-slate-900">Indemnification.</strong> Customer Shall Indemnify, Defend And Hold Harmless Steel And Its Affiliates From Any Third-Party Claims Arising From: (i) Breach Of This Agreement; (ii) Negligence Or Willful Misconduct; (iii) Any Bodily Injury Or Property Damage; Or (iv) Failure To Comply With Applicable Laws.
            </p>
            <p>
              <strong className="text-slate-900">Limitation Of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, STEEL SHALL NOT BE LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES.
            </p>
            <p>
              <strong className="text-slate-900">Force Majeure.</strong> Steel Shall Not Be Liable For Any Failure Or Delay In Fulfilling Any Term Of This Agreement When Caused By Circumstances Beyond Its Reasonable Control.
            </p>
            <p>
              <strong className="text-slate-900">Governing Law.</strong> This Agreement Shall Be Governed By The Laws Of The State Of Delaware. Any Disputes Shall Be Brought In The Appropriate Courts Located In Douglas County, Nebraska.
            </p>

            <div className="pt-2">
              <p className="font-bold text-slate-900">EXHIBIT A — GOODS</p>
              <p>Total Contract Value: {totalSellFormatted}</p>
              <p>Scope: Fabrication And Supply Of Pre-Engineered Metal Building Materials And Systems.</p>
            </div>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <h4 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">
              SIGNATURES
            </h4>

            <div className="grid grid-cols-2 gap-8 md:gap-12 text-xs">
              <div className="space-y-4">
                <h5 className="font-bold text-slate-900 uppercase">STEEL INVESTMENTS, LLC</h5>
                <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium pt-8">
                  <span>Authorized Signature</span>
                  <span>Date</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                  <p>Name: Travis Overhue</p>
                  <p>Title: Owner</p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-bold text-slate-900 uppercase">{customerLeadName}</h5>
                <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium pt-8">
                  <span>Authorized Signature</span>
                  <span>Date</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  <p>{customerEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default QuotePreviewPage;
