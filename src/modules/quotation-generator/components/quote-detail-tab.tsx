import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuotationStore } from "@/modules/quotation/quotation.store";

interface QuoteDetailTabProps {
  sqFt: string;
  setSqFt: (val: string) => void;
  buildingSize: string;
  setBuildingSize: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
}

export function QuoteDetailTab({
  sqFt,
  setSqFt,
  buildingSize,
  setBuildingSize,
  additionalNotes,
  setAdditionalNotes,
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
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Screw-down">Screw-down</option>
              <option value="Standing Seam (SS)">Standing Seam (SS)</option>
              <option value="Standing Seam">Standing Seam</option>
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
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          {/* SQUARE FOOTAGE SELL RATE */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
              <span>SQUARE FOOTAGE</span>
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
              Labor profit ${(installSell - installCost).toFixed(2)}/SF ({installSell > 0 ? (((installSell - installCost) / installSell) * 100).toFixed(1) : "0.0"}%)
            </p>
          </div>
        </div>
      </div>

      {/* Printable Estimate Card Box */}
      <div className="border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-2xs space-y-6 text-slate-800">
        {/* Estimate Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              (888) 968-1222 · travis@storagematerials.com · www.storagematerials.com
            </p>
          </div>

          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">ESTIMATE</h3>
            <p className="text-slate-600 mt-1 text-[11px]">Date: July 31, 2026</p>
            <p className="text-slate-600 text-[11px]">Expiration: August 15, 2026</p>
            <p className="text-slate-600 text-[11px]">Business/Tax #: 99-4515145</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PREPARED FOR
              </span>
              <span className="font-bold text-slate-900 text-sm">Customer</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUILDING
              </span>
              <span className="font-bold text-slate-900">{buildingSize} Storage</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ROOF SYSTEM
              </span>
              <span className="font-bold text-slate-900">26 GA Galvalume (R-Panel, {roofType})</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LOCATION
              </span>
              <span className="font-bold text-slate-900 text-sm">TBD</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SCOPE
              </span>
              <span className="font-bold text-slate-900">
                Pre-Engineered Metal Building Supply, Delivery & Installation + Insulation
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL WEIGHT
              </span>
              <span className="font-bold text-slate-900">9,508 Lbs - 1 Truck</span>
            </div>
          </div>
        </div>

        {/* Banner - TOTAL PROJECT INVESTMENT */}
        <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
            TOTAL PROJECT INVESTMENT
          </div>
          <div className="text-3xl md:text-4xl font-extrabold">$326,563</div>
          <div className="text-xs text-blue-200 font-medium">
            $4.75/SF · 68,750 SF · FREIGHT INCLUDED
          </div>
        </div>

        {/* Pricing Summary, Scope Included, Exclusions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs pt-2">
          {/* PRICING SUMMARY */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              PRICING SUMMARY
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Material</span>
                <span className="font-medium text-slate-900">$167,427</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                <span>Freight (1 Truck)</span>
                <span className="font-medium text-slate-900">$1,236</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                <span>Installation</span>
                <span className="font-medium text-slate-900">$326,563</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-b border-slate-100 pb-2">
                <span>Building Subtotal</span>
                <span>$326,563</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1">
                <span>Total</span>
                <span className="text-[#1E3A8A]">$326,563</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-4 leading-normal italic">
              Please Refer To The SOW For Detailed Scope. Sales Tax Will Be Added To The Price Of The Building Where Applicable.
            </p>
          </div>

          {/* SCOPE INCLUDED */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              SCOPE INCLUDED
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Full Storage Structural System</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Screw-Down Metal Roof Panels</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Wall Panels, Trim & Accessories</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>All Fasteners, Sealants & Closures</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Freight To Jobsite</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Labor & Installation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Equipment & Supervision</span>
              </li>
            </ul>
          </div>

          {/* EXCLUSIONS */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              EXCLUSIONS
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Concrete Foundation & Slab</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Insulation System</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Electrical, Plumbing, HVAC</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Fire Suppression</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>Permits & Engineering</span>
              </li>
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
          onClick={() => navigate("/quotation/quote-preview")}
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
