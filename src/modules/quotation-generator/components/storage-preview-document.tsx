import React from "react";
import { cn } from "@/lib/utils";

export interface StorageBuildingItem {
  name?: string;
  width?: number | string;
  length?: number | string;
  sqft?: number | string;
  squareFootage?: number | string;
  loEave?: number | string;
  hiEave?: number | string;
  eaveHeight?: number | string;
  pitch?: string;
  roofPitch?: string;
  slope?: string;
  psf?: number | string;
  cogs?: number;
  cost?: number;
  markup?: number;
  sellPrice?: number;
  roofType?: string;
  wallType?: string;
  wallColor?: string;
  wallPanel?: string;
  roofColor?: string;
  roofPanel?: string;
  doors?: string;
  framingType?: string;
  [key: string]: unknown;
}

export interface StorageDoorItem {
  type?: string;
  size?: string;
  unitCost?: number;
  costPerUnit?: number;
  qty?: number;
  quantity?: number;
  count?: number;
  cogs?: number;
  totalCost?: number;
  markup?: number;
  sale?: number;
  sellPerUnit?: number;
  totalSell?: number;
  color?: string;
  model?: string;
  [key: string]: unknown;
}

export interface StorageExtraItem {
  name?: string;
  item?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  cogs?: number;
  cost?: number;
  markup?: number;
  sale?: number;
  sellPrice?: number;
  note?: string;
  include?: boolean;
  [key: string]: unknown;
}

export interface StorageData {
  buildings?: StorageBuildingItem[];
  doors?: StorageDoorItem[];
  extras?: StorageExtraItem[];
  shippingDefault?: {
    freightCost?: number;
    freightSell?: number;
    trucks?: number;
    notes?: string;
    [key: string]: unknown;
  };
  project?: {
    customer?: string;
    location?: string;
    jobName?: string;
    quoteDate?: string;
    notes?: string;
    jobNumber?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface StoragePricing {
  buildings?: Array<Record<string, unknown>>;
  doors?: Array<Record<string, unknown>>;
  extras?: Array<Record<string, unknown>>;
  totalSqft?: number;
  totalSqFt?: number;
  squareFootage?: number;
  buildingSell?: number;
  buildingCogs?: number;
  buildingsSubtotal?: number;
  doorSell?: number;
  doorCogs?: number;
  doorsSubtotal?: number;
  extrasSell?: number;
  extrasCogs?: number;
  extrasSubtotal?: number;
  shipping?: number;
  freight?: number;
  drawings?: number;
  installSell?: number;
  installCost?: number;
  installSellPerSf?: number;
  installCostPerSf?: number;
  labor?: number;
  laborSell?: number;
  installation?: number;
  instSell?: number;
  erection?: number;
  erectionSell?: number;
  concrete?:
  | number
  | {
    include?: boolean;
    sell?: number;
    appliedSell?: number;
    cost?: number;
    costSF?: number;
    sellSF?: number;
    marginPct?: number;
    thickness?: number;
    psi?: number | null;
    sowItems?: string[];
    sowNotes?: string;
    [key: string]: unknown;
  };
  insulation?:
  | number
  | {
    include?: boolean;
    sell?: number;
    appliedSell?: number;
    cost?: number;
    costSF?: number;
    sellSF?: number;
    marginPct?: number;
    system?: string;
    systemLabel?: string;
    rRoof?: string;
    rWall?: string;
    [key: string]: unknown;
  };
  salesTax?: {
    rate?: number;
    amount?: number;
    taxableAmount?: number;
    taxableBase?: number;
    include?: boolean;
    note?: string;
  };
  grandTotal?: number;
  totSell?: number;
  totalSell?: number;
  totalCost?: number;
  totalCogs?: number;
  totCost?: number;
  profit?: number;
  marginPercent?: number | string;
  pricePerSf?: number | string;
  sfPrice?: number | string;
  breakdown?: {
    buildings?: { sell?: number; cogs?: number; profit?: number };
    doors?: { sell?: number; cogs?: number; profit?: number };
    install?: { sell?: number; cogs?: number; profit?: number };
    concrete?: { sell?: number; cogs?: number; profit?: number };
    insulation?: { sell?: number; cogs?: number; profit?: number };
    extras?: { sell?: number; cogs?: number; profit?: number };
    [key: string]: unknown;
  };
  subtotal?: {
    materials?: number;
    passThrough?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface StoragePreviewDocumentProps {
  className?: string;
  id?: string;
  storageData?: StorageData | null;
  storagePricing?: StoragePricing | null;
  scope?: "Supply" | "Install" | "Both" | string;
  customerLeadName?: string;
  customerAddress?: string;
  customerEmail?: string;
  jobNumber?: string;
  quoteDate?: string;
  concreteInclude?: boolean;
  insulationInclude?: boolean;
  includeTax?: boolean;
  taxRate?: number;
}

function fmt(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + Math.round(num).toLocaleString();
}

function fmtDec(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + num.toFixed(2);
}

function roofLabel(t?: string): string {
  if (!t) return "Screw-Down";
  const tl = t.toLowerCase();
  if (tl.includes("standing") || tl === "ss") return "Standing Seam";
  if (tl.includes("r-panel") || tl === "rpanel") return "R-Panel";
  if (tl.includes("galvalume")) return "Galvalume";
  return "Screw-Down";
}

export const StoragePreviewDocument = React.forwardRef<HTMLDivElement, StoragePreviewDocumentProps>(
  function StoragePreviewDocument(props, ref) {
    const {
      className,
      id,
      storageData,
      storagePricing,
      scope = "Both",
      customerLeadName,
      customerAddress,
      jobNumber,
      quoteDate: customDate,
      concreteInclude,
      insulationInclude,
      includeTax = true,
      taxRate = 0,
    } = props;

    const proj = storageData?.project || {};
    const effectiveCustomer = customerLeadName || proj.customer || "Customer";
    const effectiveLocation = customerAddress || proj.location || "TBD";
    const effectiveJobNumber = jobNumber || proj.jobNumber || "8098";
    const effectiveDate =
      customDate ||
      proj.quoteDate ||
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    const expDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const buildings = storageData?.buildings || [];
    const doors = storageData?.doors || [];
    const extras = storageData?.extras || [];

    const totalSqFt =
      Number(
        storagePricing?.totalSqft ||
        storagePricing?.totalSqFt ||
        storagePricing?.squareFootage
      ) ||
      buildings.reduce(
        (acc, b) =>
          acc +
          (Number(b.sqft || b.squareFootage) ||
            Number(b.width || 0) * Number(b.length || 0)),
        0
      );

    const bldSell =
      Number(
        storagePricing?.buildingSell ??
        storagePricing?.buildingsSubtotal ??
        storagePricing?.matSell ??
        storagePricing?.breakdown?.buildings?.sell
      ) || buildings.reduce((acc, b) => acc + Number(b.sellPrice || 0), 0);

    const doorsSell =
      Number(
        storagePricing?.doorSell ??
        storagePricing?.doorsSubtotal ??
        storagePricing?.breakdown?.doors?.sell
      ) ||
      doors.reduce((acc, d) => acc + Number(d.totalSell || d.sale || 0), 0);

    const extrasSell =
      Number(
        storagePricing?.extrasSell ??
        storagePricing?.extrasSubtotal ??
        storagePricing?.breakdown?.extras?.sell
      ) ||
      extras.reduce(
        (acc, x) => acc + (x.include !== false ? Number(x.sellPrice || x.sale || 0) : 0),
        0
      );

    const freightVal = Number(
      storagePricing?.shipping ??
      storagePricing?.freight ??
      storageData?.shippingDefault?.freightSell ??
      12000
    );

    const drawingsVal = Number(storagePricing?.drawings ?? 0);

    const laborVal = Number(
      storagePricing?.installSell ??
      storagePricing?.labor ??
      storagePricing?.installation ??
      storagePricing?.instSell ??
      storagePricing?.erection ??
      storagePricing?.erectionSell ??
      storagePricing?.laborSell ??
      storagePricing?.breakdown?.install?.sell ??
      0
    );

    const concreteObj =
      typeof storagePricing?.concrete === "object" && storagePricing?.concrete !== null
        ? storagePricing.concrete
        : null;
    const isConcreteIncluded =
      concreteInclude !== undefined
        ? concreteInclude
        : Boolean(concreteObj?.include);
    const concreteVal = isConcreteIncluded
      ? Number(
        concreteObj?.appliedSell ??
        concreteObj?.sell ??
        storagePricing?.breakdown?.concrete?.sell ??
        (typeof storagePricing?.concrete === "number" ? storagePricing.concrete : 0)
      )
      : 0;

    const insulationObj =
      typeof storagePricing?.insulation === "object" && storagePricing?.insulation !== null
        ? storagePricing.insulation
        : null;
    const isInsulationIncluded =
      insulationInclude !== undefined
        ? insulationInclude
        : Boolean(insulationObj?.include);
    const insulationVal = isInsulationIncluded
      ? Number(
        insulationObj?.appliedSell ??
        insulationObj?.sell ??
        storagePricing?.breakdown?.insulation?.sell ??
        (typeof storagePricing?.insulation === "number" ? storagePricing.insulation : 0)
      )
      : 0;

    const taxObj = storagePricing?.salesTax;
    const effectiveTaxRate = taxRate || taxObj?.rate || 0;
    const isTaxIncluded =
      includeTax !== undefined ? includeTax : (taxObj?.include ?? true);
    const taxVal =
      isTaxIncluded && effectiveTaxRate > 0
        ? Number(
          taxObj?.amount ??
          Math.round((bldSell + doorsSell + insulationVal) * (effectiveTaxRate / 100))
        )
        : 0;

    const grandTotal =
      Number(
        storagePricing?.grandTotal ??
        storagePricing?.totSell ??
        storagePricing?.totalSell
      ) ||
      bldSell +
      doorsSell +
      extrasSell +
      freightVal +
      drawingsVal +
      laborVal +
      concreteVal +
      insulationVal +
      taxVal;

    const sfPrice = totalSqFt > 0 ? grandTotal / totalSqFt : 0;
    const isSupply = scope.toLowerCase() === "supply";

    return (
      <div
        ref={ref}
        id={id || "storage-preview-document"}
        className={cn(
          "p-6 md:p-8 bg-white border border-slate-200 shadow-2xs rounded-xl space-y-6 text-slate-800 font-sans print-card",
          className
        )}
      >
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-[#1e3a8a]">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-2xl tracking-tight">
              <span className="text-slate-900 font-black">STORAGE</span>
              <span className="bg-[#2176c7] text-white px-2.5 py-0.5 rounded font-black tracking-wide">
                MATERIALS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
              METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
              <br />
              (888) 968-1222 · travis@storagematerials.com · www.storagematerials.com
            </p>
          </div>

          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              ESTIMATE
            </h3>
            <p className="text-slate-600 mt-1 text-[11px]">Date: {effectiveDate}</p>
            <p className="text-slate-600 text-[11px]">Expiration: {expDate}</p>
            <p className="text-slate-600 text-[11px]">Job #: {effectiveJobNumber}</p>
            <p className="text-slate-600 text-[11px]">Business/Tax #: 99-4515145</p>
          </div>
        </div>

        {/* Info Grid (4 Fields matching prototype layout) */}
        <div className="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PREPARED FOR
            </span>
            <p className="font-bold text-slate-900 text-sm">{effectiveCustomer}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              LOCATION
            </span>
            <p className="font-bold text-slate-900">{effectiveLocation}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PROJECT
            </span>
            <p className="font-bold text-slate-900">
              {buildings.length} self-storage building{buildings.length !== 1 ? "s" : ""} · {totalSqFt.toLocaleString()} total SF
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SCOPE
            </span>
            <p className="font-bold text-slate-900">
              {isSupply
                ? "Supply & Delivery Only"
                : scope.toLowerCase() === "install"
                  ? "Installation Only"
                  : "Supply, Delivery & Erection"}
              {isConcreteIncluded ? " · Concrete" : ""}
              {isInsulationIncluded ? " · Insulation" : ""}
            </p>
          </div>
        </div>

        {/* Total Project Investment Banner */}
        <div className="bg-[#1e3a8a] text-white p-6 rounded-xl text-center space-y-1 shadow-xs">
          <div className="text-[11px] text-blue-200 uppercase tracking-widest font-bold">
            TOTAL PROJECT INVESTMENT
          </div>
          <div className="text-3xl md:text-4xl font-black tracking-tight">
            {fmt(grandTotal)}
          </div>
          <div className="text-xs text-blue-200 font-medium pt-1">
            {fmtDec(sfPrice)}/SF · {totalSqFt.toLocaleString()} SF · See Statement of Work for full scope
          </div>
        </div>

        {/* Building Breakdown Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-[#1e3a8a] uppercase border-b border-slate-200 pb-1.5 tracking-wider">
            BUILDING BREAKDOWN
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fb] text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
                  <th className="p-2.5">Building</th>
                  <th className="p-2.5 text-center">Dimensions</th>
                  <th className="p-2.5 text-center">Slope</th>
                  <th className="p-2.5 text-center">SF</th>
                  <th className="p-2.5 text-center">Roof Type</th>
                  <th className="p-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {buildings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                      No buildings loaded yet.
                    </td>
                  </tr>
                ) : (
                  buildings.map((b, idx) => {
                    const bSqft =
                      Number(b.sqft || b.squareFootage) ||
                      Number(b.width || 0) * Number(b.length || 0);
                    const bSell = Number(b.sellPrice || 0);
                    const eave = b.loEave || b.eaveHeight ? `${b.loEave || b.eaveHeight}' eave` : "eave";
                    const dimStr = b.width && b.length ? `${b.width}' × ${b.length}' × ${eave}` : "—";
                    const rType = roofLabel(b.roofType);
                    const isSS = rType === "Standing Seam";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">
                          {b.name || `Building ${idx + 1}`}
                        </td>
                        <td className="p-2.5 text-center font-medium">
                          {dimStr}
                        </td>
                        <td className="p-2.5 text-center text-slate-600">
                          {b.slope || b.roofPitch || "0.5:12"}
                        </td>
                        <td className="p-2.5 text-center font-medium">
                          {bSqft.toLocaleString()} SF
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isSS
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {rType}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-[#1e3a8a]">
                          {fmt(bSell)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2 border-[#1e3a8a] bg-slate-50/50">
                  <td colSpan={5} className="p-2.5 text-slate-900">
                    Building Subtotal
                  </td>
                  <td className="p-2.5 text-right font-extrabold text-[#1e3a8a]">
                    {fmt(bldSell)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Two-Column Section: Pricing Summary & Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-1">
          {/* PRICING SUMMARY */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1e3a8a] uppercase border-b border-slate-200 pb-1.5 tracking-wider">
              PRICING SUMMARY
            </h4>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                <span>Buildings ({buildings.length})</span>
                <span className="font-semibold text-slate-900">{fmt(bldSell)}</span>
              </div>
              {doorsSell > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Doors & Hardware</span>
                  <span className="font-semibold text-slate-900">{fmt(doorsSell)}</span>
                </div>
              )}
              {!isSupply && laborVal > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Erection / Installation</span>
                  <span className="font-semibold text-slate-900">{fmt(laborVal)}</span>
                </div>
              )}
              {extrasSell > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Options & Add-ons</span>
                  <span className="font-semibold text-slate-900">{fmt(extrasSell)}</span>
                </div>
              )}
              {freightVal > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Shipping & Freight</span>
                  <span className="font-semibold text-slate-900">{fmt(freightVal)}</span>
                </div>
              )}
              {drawingsVal > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Engineering Drawings</span>
                  <span className="font-semibold text-slate-900">{fmt(drawingsVal)}</span>
                </div>
              )}
              {isConcreteIncluded && concreteVal > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Concrete Foundation & Slab</span>
                  <span className="font-semibold text-slate-900">{fmt(concreteVal)}</span>
                </div>
              )}
              {isInsulationIncluded && insulationVal > 0 && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Insulation Package</span>
                  <span className="font-semibold text-slate-900">{fmt(insulationVal)}</span>
                </div>
              )}
              {isTaxIncluded && taxVal > 0 && (
                <div className="flex justify-between text-amber-800 border-b border-slate-100 pb-1.5 font-medium">
                  <span>Sales Tax ({effectiveTaxRate}% on taxable items)</span>
                  <span className="font-bold text-amber-900">{fmt(taxVal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t-2 border-[#1e3a8a]">
                <span>Total</span>
                <span className="text-[#1e3a8a]">{fmt(grandTotal)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              {isTaxIncluded && taxVal > 0
                ? `Sales tax of ${effectiveTaxRate}% applied to materials, doors & insulation. Labor/erection is not taxable.`
                : "Sales tax not included — add rate in tax field if applicable. Labor/erection is not taxable. Freight is itemized above."}
            </p>
          </div>

          {/* SCOPE INCLUDED & EXCLUSIONS */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-[#1e3a8a] uppercase border-b border-slate-200 pb-1.5 tracking-wider mb-2">
                SCOPE INCLUDED
              </h4>
              <ul className="space-y-1 text-slate-600 text-[11px] leading-snug">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>
                    All {buildings.length} self-storage metal building system{buildings.length !== 1 ? "s" : ""}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Primary & secondary structural framing per engineered drawings</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>26 GA R-Loc wall panels per specifications</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Roof panels per building specifications (see SOW)</span>
                </li>
                {doors.length > 0 && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Roll-up doors, walk doors & hardware as specified</span>
                  </li>
                )}
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>All fasteners, trim, closures & sealants</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Delivery & unloading of materials at site</span>
                </li>
                {!isSupply && (
                  <li className="flex items-start gap-1.5 font-semibold text-slate-800">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Full erection of metal building system</span>
                  </li>
                )}
                {isConcreteIncluded && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Concrete slab, footings & anchor bolts</span>
                  </li>
                )}
                {isInsulationIncluded && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Roof and wall insulation system</span>
                  </li>
                )}
              </ul>
            </div>

            {/* <div>
              <h4 className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-1.5 tracking-wider mb-2">
                EXCLUSIONS
              </h4>
              <ul className="space-y-1 text-slate-600 text-[11px] leading-snug">
                {!isConcreteIncluded && (
                  <li className="flex items-start gap-1.5 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Concrete foundations, slabs & anchor bolts</span>
                  </li>
                )}
                {!isInsulationIncluded && (
                  <li className="flex items-start gap-1.5 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Insulation system</span>
                  </li>
                )}
                <li className="flex items-start gap-1.5 text-red-700">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Site work, grading & excavation</span>
                </li>
                <li className="flex items-start gap-1.5 text-red-700">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Electrical, plumbing, HVAC, fire suppression</span>
                </li>
                <li className="flex items-start gap-1.5 text-red-700">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Permits & impact fees</span>
                </li>
                <li className="flex items-start gap-1.5 text-red-700">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Landscaping, paving & striping</span>
                </li>
              </ul>
            </div> */}
          </div>
        </div>

        {/* Signature Blocks */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 mb-6">
              Steel Investments DBA Storage Materials
            </h5>
            <div className="border-b border-slate-400 pb-1 text-[10px] text-slate-400 font-medium flex justify-between">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6">
              {effectiveCustomer}
            </h5>
            <div className="border-b border-slate-400 pb-1 text-[10px] text-slate-400 font-medium flex justify-between">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-center text-[10px] text-slate-400 pt-2">
          Thanks for your Business! Reach out with any questions · (888) 968-1222 · travis@storagematerials.com
        </p>
      </div>
    );
  }
);
