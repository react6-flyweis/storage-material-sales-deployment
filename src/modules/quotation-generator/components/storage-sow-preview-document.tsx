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
      concreteInclude = false,
      insulationInclude = false,
    } = props;

    const proj = storageData?.project || {};
    const effectiveCustomer = customerLeadName || proj.customer || "Customer";
    const effectiveLocation = customerAddress || proj.location || "TBD";
    const effectiveDate = customDate || proj.quoteDate || "August 24, 2026";

    const buildings = storageData?.buildings || [];
    const doors = storageData?.doors || [];
    const totalDoorCount = doors.reduce(
      (acc, d) => acc + (Number(d.quantity || d.count || d.qty) || 0),
      0
    );

    const calculatedSqFt = buildings.reduce(
      (acc, b) =>
        acc + (Number(b.sqft || b.squareFootage) || Number(b.width || 0) * Number(b.length || 0)),
      0
    );
    const totalSqFt =
      Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
      (calculatedSqFt > 0 ? calculatedSqFt : 9000);

    const grandTotal = Number(
      storagePricing?.grandTotal ?? storagePricing?.totSell ?? storagePricing?.totalSell ?? 148330
    );
    const sfPrice = totalSqFt > 0 ? grandTotal / totalSqFt : 16.48;

    const isSupply = scope.toLowerCase() === "supply";
    const isInstall = scope.toLowerCase() === "install";

    const scopeTitle = isSupply
      ? "Supply & Delivery"
      : isInstall
        ? "Labor & Erection"
        : "Supply, Delivery & Erection";

    return (
      <div
        ref={ref}
        id={id || "storage-sow-preview-document"}
        className={cn(
          "p-6 md:p-8 bg-white border border-slate-200 shadow-2xs rounded-xl space-y-6 text-slate-800 print-card",
          className
        )}
      >
        {/* Document Title */}
        <h1 className="text-center font-extrabold text-slate-900 text-sm md:text-base tracking-tight pb-2">
          Self-Storage Metal Building System — {scopeTitle}
        </h1>

        {/* Customer & Project Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CUSTOMER
              </span>
              <span className="font-bold text-slate-900 text-sm">{effectiveCustomer}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CONTRACTOR
              </span>
              <span className="font-bold text-slate-900 block">
                Storage Materials / Steel Investments LLC
              </span>
              <span className="text-[11px] text-slate-500 font-normal block">
                1851 Madison Ave, Suite 300, Council Bluffs, IA 51503
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECT LOCATION
              </span>
              <span className="font-bold text-slate-900 text-sm">{effectiveLocation}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DATE
              </span>
              <span className="font-bold text-slate-900">{effectiveDate}</span>
            </div>
          </div>
        </div>

        {/* Revised Scope of Work */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            REVISED SCOPE OF WORK
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed pt-1">
            Storage Materials / Steel Investments LLC shall {isSupply ? "furnish" : isInstall ? "install" : "furnish and install"} {buildings.length > 0 ? buildings.length : 1} self-storage metal building system at the project location. All work includes {isSupply ? "supply and delivery" : "supply, delivery, unloading, and full erection"} of metal building systems per engineered drawings and the specifications below. Coordination with final engineered drawings is included.
          </p>
        </div>

        {/* Metal Building (PEMB) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            METAL BUILDING (PEMB)
          </h3>
          <p className="text-xs text-slate-700 font-normal">Contractor shall {isSupply ? "furnish" : "furnish and install"}:</p>

          {buildings.length > 0 ? (
            buildings.map((b, idx) => {
              const bSqft =
                Number(b.sqft || b.squareFootage) || Number(b.width || 0) * Number(b.length || 0);
              const label = (b.name as string) || (b.buildingName as string) || String.fromCharCode(65 + idx);
              const width = b.width ?? 50;
              const length = b.length ?? 180;
              const eave = b.eaveHeight ?? b.loEave ?? b.hiEave ?? 0;
              const slope = b.roofPitch ?? b.pitch ?? b.slope ?? "0.5:12";

              const wallPanels =
                (b.wallPanels as string) ||
                (b.wallPanel as string) ||
                (b.wallType as string) ||
                (b.wallColor ? `${b.wallColor} Panel` : "26ga R-Loc");
              const roofPanels =
                (b.roofPanels as string) ||
                (b.roofPanel as string) ||
                (b.roofType as string) ||
                (b.roofColor ? `${b.roofColor} Panel` : "26ga Galvalume (Screw-Down)");
              const baseCond = (b.baseCondition as string) || "Galvanized clip";
              const collateral =
                (b.collateralLoad as string) || (b.psf ? `${b.psf} PSF` : "0.50 PSF");
              const primaryFraming =
                (b.primaryFraming as string) ||
                (b.framingType as string) ||
                "Primary rigid frame structural system per engineered drawings";
              const secondaryFraming =
                (b.secondaryFraming as string) ||
                "Secondary framing: purlins, girts, eave struts, bracing";
              const fasteners =
                (b.fastenersTrim as string) || "All fasteners, trim, closures, sealants & accessories";

              return (
                <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2">
                  <div className="font-extrabold text-[#1E3A8A] text-xs">
                    {label} · {width}' × {length}' × {eave}' eave · {bSqft ? bSqft.toLocaleString() : "9,000"} SF · {slope} slope
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    <li>Wall panels: {wallPanels}</li>
                    <li>Roof panels: {roofPanels}</li>
                    <li>Base condition: {baseCond}</li>
                    <li>Design collateral load: {collateral}</li>
                    <li>{primaryFraming}</li>
                    <li>{secondaryFraming}</li>
                    <li>{fasteners}</li>
                  </ul>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>

        {/* Inclusions */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            INCLUSIONS
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1 pt-1">
            <li>Delivery of building materials to jobsite</li>
            {!isSupply && <li>Unloading of materials at site</li>}
            {!isSupply && <li>Full erection of metal building system per engineered drawings</li>}
            <li>Coordination with final engineered drawings</li>
            <li>All fasteners, trim, closures and sealants</li>
            {concreteInclude && <li>Concrete foundation and slab system</li>}
            {insulationInclude && <li>Insulation package per specifications</li>}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            EXCLUSIONS
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1 pt-1">
            {!concreteInclude && <li>Concrete foundation, slab & anchor bolts</li>}
            {!insulationInclude && <li>Insulation package & installation</li>}
            {isSupply && <li>Unloading of materials at jobsite</li>}
            {isSupply && <li>Building erection and installation labor</li>}
            <li>Site work, grading, soil testing & excavation</li>
            <li>Electrical, plumbing, HVAC & fire suppression systems</li>
            <li>Permits, local impact fees & engineering wet stamps unless noted</li>
          </ul>
        </div>


        {/* Total Project Investment Banner */}
        <TotalProjectInvestmentBanner
          totalFormatted={fmt(grandTotal)}
          subtitle={`${fmtDec(sfPrice)}/SF · ${totalSqFt.toLocaleString()} total SF${totalDoorCount > 0 ? ` · ${totalDoorCount} Doors` : ""}`}
        />

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
          <div className="space-y-8">
            <h5 className="font-bold text-slate-900">Steel Investments DBA Storage Materials</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-500 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="font-bold text-slate-900">Customer</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-500 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

