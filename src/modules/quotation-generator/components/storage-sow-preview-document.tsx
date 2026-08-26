import React from "react";
import { TotalProjectInvestmentBanner } from "./total-project-investment-banner";
import { cn } from "@/lib/utils";
import type { StorageData, StoragePricing } from "./storage-preview-document";

export interface StorageSowPreviewDocumentProps {
  className?: string;
  id?: string;
  storageData?: StorageData | null;
  storagePricing?: StoragePricing | null;
  scope?: "Supply" | "Install" | "Both" | string;
  customerLeadName?: string;
  customerAddress?: string;
  jobNumber?: string;
  quoteDate?: string;
  concreteInclude?: boolean;
  insulationInclude?: boolean;
}

function fmt(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + Math.round(num).toLocaleString();
}

function fmtDec(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + num.toFixed(2);
}

export const StorageSowPreviewDocument = React.forwardRef<HTMLDivElement, StorageSowPreviewDocumentProps>(
  function StorageSowPreviewDocument(props, ref) {
    const {
      className,
      id,
      storageData,
      storagePricing,
      scope = "Both",
      customerLeadName,
      customerAddress,
      quoteDate: customDate,
      concreteInclude,
      insulationInclude,
    } = props;

    const proj = storageData?.project || {};
    const effectiveCustomer = customerLeadName || proj.customer || "Valued Customer";
    const effectiveLocation = customerAddress || proj.location || "Project Location";
    const effectiveDate = customDate || proj.quoteDate || new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const buildings = storageData?.buildings || [];
    const doors = storageData?.doors || [];

    const totalSqFt =
      storagePricing?.totalSqFt ||
      storagePricing?.squareFootage ||
      buildings.reduce((acc, b) => acc + (Number(b.sqft || b.squareFootage) || (Number(b.width) * Number(b.length) || 0)), 0);

    const grandTotal = Number(storagePricing?.grandTotal ?? storagePricing?.totSell ?? storagePricing?.totalSell ?? 0);
    const sfPrice = totalSqFt > 0 ? (grandTotal / totalSqFt) : 0;
    const totalDoorCount = doors.reduce((acc, d) => acc + (Number(d.quantity || d.count) || 0), 0);

    const isSupply = scope.toLowerCase() === "supply";
    const isInstall = scope.toLowerCase() === "install";

    return (
      <div
        ref={ref}
        id={id || "storage-sow-preview-document"}
        className={cn(
          "p-6 md:p-8 bg-white border border-slate-200 shadow-2xs rounded-xl space-y-6 text-slate-800 print-card",
          className
        )}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              MINI STORAGE SYSTEMS & DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-600 font-medium">(888) 968-1222</p>
          </div>
          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              STATEMENT OF WORK (SOW)
            </h3>
            <p className="text-slate-600 mt-1 text-[11px]">Date: {effectiveDate}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900">
            Mini Storage Facility Scope of Work Specification
          </h2>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECT NAME / CUSTOMER
              </span>
              <span className="font-bold text-slate-900 text-sm">{effectiveCustomer}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUILDINGS CONFIGURATION
              </span>
              <span className="font-bold text-slate-900">
                {buildings.length} Mini Storage Buildings · {totalSqFt.toLocaleString()} Total SF
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECT LOCATION
              </span>
              <span className="font-bold text-slate-900">{effectiveLocation}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CONTRACT SCOPE
              </span>
              <span className="font-bold text-slate-900">
                {isSupply ? "Material Supply & Delivery Only" : isInstall ? "Labor & Installation Only" : "Turnkey Supply, Delivery & Full Installation"}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Banner */}
        <TotalProjectInvestmentBanner
          totalFormatted={fmt(grandTotal)}
          subtitle={`${fmtDec(sfPrice)}/SF · ${totalSqFt.toLocaleString()} SF · ${totalDoorCount} Doors`}
        />

        {/* Section 1: Structural Framing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 tracking-wider">
            1. Structural Framing & Component Specifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">Cold-Formed Light-Gauge Steel Framing:</span>
              <p>• Heavy-gauge galvanized cold-formed steel columns, rafters, and interior load-bearing partition posts.</p>
              <p>• Engineered roof purlins and wall girts sized for local snow and wind design load requirements.</p>
              <p>• Factory prepunched connection holes with zinc-plated Grade 5 structural bolting hardware.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">Unit Partitioning & Hallways:</span>
              <p>• 29/26 GA corrugated interior partition panels separating all unit layouts.</p>
              <p>• Corner and junction partition trims, flush header angles, and hallway liner systems.</p>
              <p>• Heavy-duty draft stop / thermal break materials where required by code.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Roof, Walls & Trim */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 tracking-wider">
            2. Roof Sheeting, Wall Cladding & Trim Packages
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">Roof & Wall Sheeting:</span>
              <p>• 26 GA high-tensile 80,000 PSI Galvalume Plus substrate with 25-year manufacturer warranty.</p>
              <p>• Multi-rib profile offering superior diaphragm strength and watertight interlock.</p>
              <p>• Long-life self-drilling fasteners with bonded EPDM sealing washers.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">Trim, Gutters & Flashing:</span>
              <p>• Complete architectural trim package: eave trim, gable rake, base drip, corner trim, and door jambs.</p>
              <p>• 26 GA sculptured box gutters, downspouts, and heavy-duty concealed hanging straps.</p>
              <p>• Die-cut foam closures for ridge and eave to prevent pest and weather penetration.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Roll-up Doors & Hardware */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 tracking-wider">
            3. Roll-up Doors & Openings System
          </h4>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1.5">
            <p>• Commercial-grade Janus / BETCO roll-up curtain doors with oil-tempered helical torsion springs.</p>
            <p>• 26 GA corrugated door curtains with baked-on silicone polyester paint finish.</p>
            <p>• Universal dual-padlock latch assembly with stainless steel slide bolt and magnetic latch keepers.</p>
            <p>• Nylon guides and bottom vinyl weatherstripping for smooth, quiet operation and weather resistance.</p>
          </div>
        </div>

        {/* Section 4: Installation & Site Obligations */}
        {!isSupply && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 tracking-wider">
              4. Erection & Installation Scope
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1.5">
                <span className="font-bold text-emerald-900 block">Contractor Labor Inclusions:</span>
                <p>• Mobilization of certified steel erection crew, tools, lifts, and rigging equipment.</p>
                <p>• Complete assembly and plum alignment of all structural framing and partitions.</p>
                <p>• Fastening of all wall/roof panels, flashing, sealants, gutters, downspouts, and roll-up doors.</p>
                <p>• Final site cleanup and removal of installation scrap.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block">Owner / Buyer Site Obligations:</span>
                <p>• Level, cured concrete slab provided with perimeter notched ledge according to plans.</p>
                <p>• Clear jobsite access with 30-foot unobstructed turning radius for 53-foot flatbed delivery trucks.</p>
                <p>• Electrical power and trash dumpster on site during installation phase.</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Add-ons */}
        {(concreteInclude || insulationInclude) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 tracking-wider">
              5. Optional Add-On Systems Included
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              {concreteInclude && (
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 block">Concrete Foundation:</span>
                  <p>Engineered monolithic concrete slab, perimeter thickening, rebar reinforcement, vapor barrier, and slick trowel finish.</p>
                </div>
              )}
              {insulationInclude && (
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block">Insulation Package:</span>
                  <p>Reinforced vinyl-faced fiberglass blanket insulation with thermal tape and double-sided bonding.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 mb-8">Storage Materials Representative</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-8">Customer Acceptance</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
