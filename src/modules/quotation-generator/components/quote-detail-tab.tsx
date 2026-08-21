import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import type { ExtractShipperResponseData } from "../estimates.api";

interface QuoteDetailTabProps {
  sqFt: string;
  setSqFt: (val: string) => void;
  buildingSize: string;
  setBuildingSize: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
  extractedShipper?: ExtractShipperResponseData;
  onQuotePreview?: () => void;
}

export function QuoteDetailTab({
  sqFt,
  setSqFt,
  buildingSize,
  setBuildingSize,
  additionalNotes,
  setAdditionalNotes,
  extractedShipper,
  onQuotePreview,
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
    concreteInclude,
    concreteInclusions,
    insulationInclude,
    insulationInclusions,
    // includeTax,
    // taxRate,
  } = useQuotationStore();

  const pricing = extractedShipper?.pricing;
  const totalSell = pricing?.totSell != null ? `$${pricing.totSell.toLocaleString()}` : "-";
  const matCost = pricing?.matCost != null ? `$${pricing.matCost.toLocaleString()}` : "-";
  const freight = pricing?.freight != null ? `$${pricing.freight.toLocaleString()}` : "-";
  const instSell = pricing?.instSell != null ? `$${pricing.instSell.toLocaleString()}` : "-";
  const sfPrice = pricing?.sfPrice != null ? `$${pricing.sfPrice}` : "-";
  const totalWeight = extractedShipper?.totalWeightLbs || pricing?.totWt;
  const weightDisplay = totalWeight != null ? (totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(1)}K` : `${totalWeight}`) : "-";
  const trucks = pricing?.trucks != null ? pricing.trucks : 1;

  // Compute dynamic Scope Included and Exclusions
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
    // dynamicScopeIncluded.push({
    //   text: `${roofType || "Screw-Down"} Metal Roof Panels`,
    // });
    // dynamicScopeIncluded.push({
    //   text: "Wall Panels, Trim & Accessories",
    // });
    // dynamicScopeIncluded.push({
    //   text: "All Fasteners, Sealants & Closures",
    // });
    // dynamicScopeIncluded.push({
    //   text: "Freight To Jobsite",
    // });
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
            <div className="flex rounded-md overflow-hidden border border-blue-600 bg-white">
              <button
                type="button"
                onClick={() => setJobType("Storage")}
                className={cn(
                  "flex-1 py-2 px-3 font-semibold text-xs transition-colors cursor-pointer",
                  jobType.toLowerCase() === "storage"
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                Storage
              </button>
              <button
                type="button"
                onClick={() => setJobType("PEMB")}
                className={cn(
                  "flex-1 py-2 px-3 font-semibold text-xs transition-colors cursor-pointer",
                  jobType.toLowerCase() === "pemb"
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                PEMB
              </button>
            </div>
          </div>

          {/* SCOPE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              SCOPE
            </label>
            <div className="flex rounded-md overflow-hidden border border-blue-600 bg-white">
              <button
                type="button"
                onClick={() => setScope("Supply")}
                className={cn(
                  "flex-1 py-2 px-2 font-semibold text-xs transition-colors cursor-pointer",
                  scope.toLowerCase() === "supply"
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                Supply
              </button>
              <button
                type="button"
                onClick={() => setScope("Install")}
                className={cn(
                  "flex-1 py-2 px-2 font-semibold text-xs transition-colors cursor-pointer",
                  scope.toLowerCase() === "install"
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setScope("Both")}
                className={cn(
                  "flex-1 py-2 px-2 font-semibold text-xs transition-colors cursor-pointer",
                  scope.toLowerCase() === "both"
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                Both
              </button>
            </div>
          </div>

          {/* SQ FT */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              SQ FT
            </label>
            <input
              type="number"
              value={sqFt}
              onChange={(e) => setSqFt(e.target.value)}
              placeholder="e.g. 68750"
              className="w-full h-[38px] px-3 border border-slate-300 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          {/* ROOF TYPE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              ROOF TYPE
            </label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="w-full h-[38px] px-3 border border-slate-300 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white cursor-pointer"
            >
              <option value="Screw-down">Screw-down</option>
              <option value="Standing Seam">Standing Seam</option>
              <option value="TPO / Membrane">TPO / Membrane</option>
              <option value="Insulated Metal (IMP)">Insulated Metal (IMP)</option>
            </select>
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
              placeholder="e.g. 125X550X36.42"
              className="w-full h-[38px] px-3 border border-slate-300 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Sliders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">INSTALL COST $/SF</span>
              <span className="text-blue-600 font-bold">${installCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.05"
              value={installCost}
              onChange={(e) => setInstallCost(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">INSTALL SELL $/SF</span>
              <span className="text-blue-600 font-bold">${installSell.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.05"
              value={installSell}
              onChange={(e) => setInstallSell(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Document View Box */}
      <div className="border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-2xs space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">METAL AND DOORS</p>
            <p className="text-[10px] text-slate-500">
              1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-500">(888) 968-1222</p>
          </div>

          <div className="text-right text-xs">
            <h3 className="text-lg font-bold text-slate-900">OFFICIAL QUOTATION</h3>
            <p className="text-slate-500 mt-1">Date: July 31, 2026</p>
            <p className="text-slate-500">Valid Through: August 30, 2026</p>
          </div>
        </div>

        {/* Customer & Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-lg">
          <div>
            <span className="font-bold text-slate-700 block mb-1">CUSTOMER:</span>
            <p className="text-slate-600 font-semibold">Customer</p>
            <p className="text-slate-500">TBD</p>
          </div>
          <div>
            <span className="font-bold text-slate-700 block mb-1">PROJECT:</span>
            <p className="text-slate-600 font-semibold">Customer Project</p>
            <p className="text-slate-500">
              {sqFt ? `${Number(sqFt).toLocaleString()} SF` : "68,750 SF"} · {roofType} · {scope}{" "}
              {buildingSize && `· ${buildingSize}`}
            </p>
          </div>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600 font-bold bg-slate-50">
                <th className="py-2.5 px-3">DESCRIPTION</th>
                <th className="py-2.5 px-3 text-right">WEIGHT</th>
                <th className="py-2.5 px-3 text-right">TRUCKS</th>
                <th className="py-2.5 px-3 text-right">MAT COST</th>
                <th className="py-2.5 px-3 text-right">FREIGHT</th>
                <th className="py-2.5 px-3 text-right">INST SELL</th>
                <th className="py-2.5 px-3 text-right">TOTAL SELL</th>
                <th className="py-2.5 px-3 text-right">$/SF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {jobType.toUpperCase()} Building Package · {roofType} Roof · {scope} Scope
                  {buildingSize && ` · ${buildingSize}`}
                </td>
                <td className="py-3 px-3 text-right text-slate-600">{weightDisplay}</td>
                <td className="py-3 px-3 text-right text-slate-600">{trucks}</td>
                <td className="py-3 px-3 text-right text-slate-600">{matCost}</td>
                <td className="py-3 px-3 text-right text-slate-600">{freight}</td>
                <td className="py-3 px-3 text-right text-slate-600">{instSell}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">{totalSell}</td>
                <td className="py-3 px-3 text-right text-slate-600">{sfPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Investment Callout Box */}
        <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
            TOTAL PROJECT INVESTMENT
          </div>
          <div className="text-3xl md:text-4xl font-extrabold">{totalSell}</div>
          <div className="text-xs text-blue-200 font-medium">
            {sfPrice}/SF BUILDING · {scope.toUpperCase()}
          </div>
        </div>

        {/* 3 Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-4 border-t border-slate-200">
          {/* PAYMENT SCHEDULE */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              PAYMENT SCHEDULE
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex justify-between">
                <span>Deposit (Upon Signing):</span>
                <span className="font-bold text-slate-800">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Fabrication Release:</span>
                <span className="font-bold text-slate-800">50%</span>
              </li>
              <li className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-bold text-slate-800">20%</span>
              </li>
              <li className="flex justify-between">
                <span>Final Completion:</span>
                <span className="font-bold text-slate-800">5%</span>
              </li>
            </ul>
            <p className="text-[9px] text-slate-400 mt-4 leading-normal italic">
              Please Refer To The SOW For Detailed Scope. Sales Tax Will Be Added To The Price Of The Building Where Applicable.
            </p>
          </div>

          {/* SCOPE INCLUDED (Dynamic) */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              SCOPE INCLUDED
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              {dynamicScopeIncluded.map((item, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start gap-1.5",
                    // item.category === "concrete" && "text-blue-900 font-medium",
                    // item.category === "insulation" && "text-indigo-900 font-medium",
                    // item.category === "tax" && "text-emerald-900 font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "font-bold",
                      // item.category === "concrete"
                      //   ? "text-blue-500"
                      //   : item.category === "insulation"
                      //     ? "text-indigo-500"
                      //     : item.category === "tax"
                      //       ? "text-emerald-500" : 
                      "text-slate-400"
                    )}
                  >
                    •
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* EXCLUSIONS (Dynamic) */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              EXCLUSIONS
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              {dynamicExclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Lines */}
        <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 mb-8">Steel Investments DBA Storage Materials</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-8">Customer</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-center text-[10px] text-slate-400 pt-2">
          Thanks For Your Business! Reach Out With Any Questions · (888) 968-1222 · travis@storagematerials.com
        </p>
      </div>

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
          onClick={() => (onQuotePreview ? onQuotePreview() : navigate("/quotation/quote-preview"))}
          className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Quote Preview
        </Button>
        <Button
          type="button"
          className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Save to History
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
