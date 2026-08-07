import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  FileText,
  Copy,
  CheckSquare,
  FileEdit,
  History,
  Percent,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotationStore } from "@/modules/quotation/quotation.store";

interface QuotationSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function QuotationSidebar({
  isOpen = true,
  onClose,
  className,
}: QuotationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRoofSelectOpen, setIsRoofSelectOpen] = useState(false);

  // Compute activeTab from current route location
  const activeTab = location.pathname.includes("/quotation/pricing-rules")
    ? "pricing-rules"
    : location.pathname.includes("/quotation/quote-history")
    ? "quote-history"
    : location.pathname.includes("/quotation/quote-preview")
    ? "quote-preview"
    : location.pathname.includes("/quotation/create")
    ? "custom-quote"
    : location.pathname.includes("/quotation/extracted-drawing") ||
      location.pathname.includes("/quotation/upload-drawing")
    ? "pemb-quote"
    : "pemb-quote";

  // Store Hooks
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
    blendPercentage,
    setBlendPercentage,
  } = useQuotationStore();

  // Calculated values
  const profitMargin = Math.max(0, installSell - installCost);
  const marginPercent = installSell > 0 ? ((profitMargin / installSell) * 100).toFixed(1) : "0.0";
  const savedVsCentral = Math.round((blendPercentage / 100) * 950);

  const roofOptions = [
    "Standing Seam (SS)",
    "Screw Down (R-Panel)",
    "Insulated Metal Panel (IMP)",
    "Membrane Roof",
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#0b223c] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 overflow-y-auto select-none border-r border-slate-800/80 shadow-2xl shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header Section */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-1.5 text-lg font-bold tracking-wide text-white">
            <span className="font-extrabold text-white tracking-wider">STORAGE</span>
            <span className="bg-[#1b72e8] text-white px-2 py-0.5 rounded text-sm font-black tracking-normal uppercase">
              MATERIALS
            </span>
          </div>
          <div className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase mt-1.5">
            AI QUOTATION SYSTEM
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 px-4 py-4 space-y-6">
          {/* QUOTING Navigation Group */}
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2 px-1">
              QUOTING
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  navigate("/quotation/extracted-drawing");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  activeTab === "pemb-quote"
                    ? "bg-[#1d3d63] text-white border border-blue-400/30 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-blue-300" />
                <span>PEMB Quote</span>
              </button>

              <button
                onClick={() => {}}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Copy className="h-4 w-4 shrink-0 text-slate-300" />
                <span>Storage COG Sheet</span>
              </button>

              <button
                onClick={() => {
                  navigate("/quotation/quote-preview");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  activeTab === "quote-preview"
                    ? "bg-[#1d3d63] text-white border border-blue-400/30 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <CheckSquare className="h-4 w-4 shrink-0 text-slate-300" />
                <span>Quote Preview</span>
              </button>

              <button
                onClick={() => {
                  navigate("/quotation/create");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  activeTab === "custom-quote"
                    ? "bg-[#1d3d63] text-white border border-blue-400/30 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <FileEdit className="h-4 w-4 shrink-0 text-slate-300" />
                <span>Custom Quote</span>
              </button>

              <button
                onClick={() => {
                  navigate("/quotation/quote-history");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  activeTab === "quote-history"
                    ? "bg-[#1d3d63] text-white border border-blue-400/30 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <History className="h-4 w-4 shrink-0 text-slate-300" />
                <span>Quote History</span>
              </button>
            </nav>
          </div>

          {/* SETTINGS Navigation Group */}
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2 px-1">
              SETTINGS
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => navigate("/quotation/pricing-rules")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  activeTab === "pricing-rules"
                    ? "bg-[#1d3d63] text-white border border-blue-400/30 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Percent className="h-4 w-4 shrink-0 text-slate-300" />
                <span>Pricing Rules</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-slate-700/60 pt-4 space-y-4">
            {/* JOB TYPE Selector */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                JOB TYPE
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJobType("PEMB")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer",
                    jobType === "PEMB"
                      ? "bg-[#1b72e8] text-white border-blue-500 shadow-sm"
                      : "bg-[#122b48] text-slate-300 border-slate-600/60 hover:bg-[#183558]"
                  )}
                >
                  PEMB
                </button>
                <button
                  type="button"
                  onClick={() => setJobType("Storage")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer",
                    jobType === "Storage"
                      ? "bg-[#1b72e8] text-white border-blue-500 shadow-sm"
                      : "bg-[#122b48] text-slate-300 border-slate-600/60 hover:bg-[#183558]"
                  )}
                >
                  Storage
                </button>
              </div>
            </div>

            {/* SCOPE Selector */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                SCOPE
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Supply", "Install", "Both"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setScope(item)}
                    className={cn(
                      "py-2 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer",
                      scope === item
                        ? item === "Both"
                          ? "bg-[#16803d] text-white border-green-500 shadow-sm"
                          : "bg-[#1b72e8] text-white border-blue-500 shadow-sm"
                        : "bg-[#122b48] text-slate-300 border-slate-600/60 hover:bg-[#183558]"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* ROOF TYPE Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                ROOF TYPE
              </label>
              <button
                type="button"
                onClick={() => setIsRoofSelectOpen(!isRoofSelectOpen)}
                className="w-full bg-white text-slate-900 rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{roofType}</span>
                <ChevronDown className={cn("h-4 w-4 text-slate-700 transition-transform", isRoofSelectOpen && "rotate-180")} />
              </button>

              {isRoofSelectOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-900 rounded-lg shadow-xl z-20 py-1 border border-slate-200">
                  {roofOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setRoofType(opt);
                        setIsRoofSelectOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-colors cursor-pointer",
                        roofType === opt && "bg-blue-100 text-blue-900 font-bold"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INSTALL COST $/SF Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                <span>INSTALL COST $/SF</span>
                <span className="text-amber-400 text-xs font-extrabold">${installCost.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.00"
                max="10.00"
                step="0.05"
                value={installCost}
                onChange={(e) => setInstallCost(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
            </div>

            {/* INSTALL SELL $/SF Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                <span>INSTALL SELL $/SF</span>
                <span className="text-slate-200 text-xs font-extrabold">${installSell.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.00"
                max="10.00"
                step="0.05"
                value={installSell}
                onChange={(e) => setInstallSell(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <p className="text-[11px] text-emerald-400 font-semibold">
                Labor profit ${profitMargin.toFixed(2)}/SF ({marginPercent}%)
              </p>
            </div>

            <div className="border-t border-slate-700/60 pt-4">
              {/* INSTALL COST $/SF (Blend Slider) */}
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1">
                <span>INSTALL COST $/SF</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-medium">
                <span>Central</span>
                <span>Quicken</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blendPercentage}
                onChange={(e) => setBlendPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="text-center mt-2">
                <div className="text-xs font-bold text-indigo-300 tracking-wide">
                  {blendPercentage}% blend
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  ${savedVsCentral} saved vs Central
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
