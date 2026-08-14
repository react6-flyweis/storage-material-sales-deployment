import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteSowTabProps {
  buildingSize?: string;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
}

export function QuoteSowTab({
  buildingSize = "125X550X36.42",
  onBackToBreakdown,
  onQuotePreview,
}: QuoteSowTabProps) {
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <div className="space-y-6">
      {/* AI SOW Editor Banner */}
      <div className="bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="text-amber-600">✏️</span>
          <span className="text-blue-900 font-extrabold">AI SOW Editor</span>
        </div>
        <p className="text-xs text-slate-600">
          Describe a change and Claude will update the SOW instantly
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'Add structural framing requirement' or 'Add extra steel column spec'"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <Button
            type="button"
            className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            Apply <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          </Button>
        </div>
      </div>

      {/* Document View Box */}
      <div className="border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-2xs space-y-6 text-slate-800">
        {/* Document Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-600 font-medium">(888) 968-1222</p>
          </div>

          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              STATEMENT OF WORK
            </h3>
            <p className="text-slate-600 mt-1 text-[11px]">Date: July 31, 2026</p>
          </div>
        </div>

        {/* Title Bar */}
        <div className="text-center py-2 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900">
            Pre-Engineered Metal Building Supply, Delivery & Installation
          </h2>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECT NAME
              </span>
              <span className="font-bold text-slate-900 text-sm">Customer Project</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LOCATION
              </span>
              <span className="font-bold text-slate-900">TBD</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUILDING SIZE
              </span>
              <span className="font-bold text-slate-900">{buildingSize} Storage</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CUSTOMER
              </span>
              <span className="font-bold text-slate-900 text-sm">Customer</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PREPARED BY
              </span>
              <span className="font-bold text-slate-900">Storage Materials</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DATE
              </span>
              <span className="font-bold text-slate-900">July 31, 2026</span>
            </div>
          </div>
        </div>

        {/* SOW Content Sections */}
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* 1. PROJECT OVERVIEW */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              1. PROJECT OVERVIEW
            </h4>
            <p>
              Storage Materials Will Furnish And Install A Complete Pre-Engineered Metal Building (PEMB) Package Based On Preliminary Drawings.
            </p>
            <div className="space-y-1 pt-1 font-medium">
              <p className="font-semibold text-slate-900">Building Summary:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                <li>Approx 125x550x36.42 Eave Height</li>
                <li>Clear Span Rigid Frame Structure</li>
                <li>Roof System: 26 GA Galvalume (R-Panel, Screw-Down)</li>
                <li>Wall System: 26 GA Panel (Color TBD / R-Panel)</li>
                <li>Design Loads Per Engineered Drawings</li>
              </ul>
            </div>
          </div>

          {/* 2. SCOPE OF WORK - INCLUSIONS */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              2. SCOPE OF WORK — INCLUSIONS
            </h4>
            <div className="space-y-2.5 pl-1">
              <div>
                <p className="font-bold text-slate-900">2.1 Primary Structural System</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>Rigid Frames (Rafters & Columns)</li>
                  <li>Base Plates And Welded Connections</li>
                  <li>Anchor Bolt Plans (For Reference Only)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.2 Secondary Framing</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>Purlins (Roof)</li>
                  <li>Girts (Walls)</li>
                  <li>Eave Struts</li>
                  <li>Bracing (Rod/Cable/Portal As Designed)</li>
                  <li>Flange Bracing</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.3 Roof System</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>26 GA Galvalume Roof Panels (25-Year System)</li>
                  <li>Ridge Cap</li>
                  <li>Closure Strips</li>
                  <li>Fasteners (Self-Drilling Screws)</li>
                  <li>Sealants (Standard PEMB Package)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.4 Wall System</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>26 GA Wall Panels</li>
                  <li>Base Trim, Corner Trim, J-Trim</li>
                  <li>Standard Pedestrian Trims</li>
                  <li>Fasteners And Closures</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.5 Trim & Accessories</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>Ridge, Eave, Rake, Corner, Base Trim Package</li>
                  <li>Downspouts And Gutters (If Shown On Plans)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.6 Labor & Equipment</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>Full Erection Crew And Supervision</li>
                  <li>Lifts, Telehandlers, And Equipment</li>
                  <li>Offloading, Staging, And Site Coordination</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900">2.7 Delivery</p>
                <ul className="list-disc list-inside text-slate-600 pl-2">
                  <li>Freight To Jobsite (Standard Truck Delivery)</li>
                  <li>Unloading By Others</li>
                  <li>Delivered In Bundled/Packaged Condition</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. EXCLUSIONS (BY OTHERS) */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              3. EXCLUSIONS (BY OTHERS)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Concrete Foundation, Slab, And Anchor Bolts</li>
              <li>Insulation System</li>
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
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              4. CUSTOMER RESPONSIBILITIES
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Adequate Site Access For Delivery Trucks</li>
              <li>Offloading Equipment (Forklift/Crane)</li>
              <li>Secure Material Storage After Delivery</li>
              <li>Verification Of Dimensions And Openings</li>
            </ul>
          </div>

          {/* 5. DELIVERY & LEAD TIME */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              5. DELIVERY & LEAD TIME
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Estimated Lead Time: 8-10 Weeks (Subject To Approval & Production)</li>
              <li>Delivery: FOB Jobsite</li>
              <li>Partial Shipments May Occur</li>
            </ul>
          </div>

          {/* 6. TERMS & CONDITIONS */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              6. TERMS & CONDITIONS
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Drawings Are PRELIMINARY — NOT FOR CONSTRUCTION Until Stamped</li>
              <li>Final Pricing Subject To Approved Drawings And Material Selection</li>
              <li>Storage Materials Not Responsible For Installation Errors, Foundation Discrepancies, Or Field Modifications</li>
            </ul>
          </div>

          {/* 7. WARRANTY */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              7. WARRANTY
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Paint Finish Warranty: Typically 25 Years</li>
              <li>Structural Steel: Per PEMB Manufacturer Standard Warranty</li>
            </ul>
          </div>
        </div>

        {/* Investment Banner */}
        <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
            TOTAL PROJECT INVESTMENT
          </div>
          <div className="text-3xl md:text-4xl font-extrabold">$326,563</div>
          <div className="text-xs text-blue-200 font-medium">
            $4.75/SF BUILDING · INSTALLATION ONLY
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
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToBreakdown}
          className="border-slate-300 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          ← Back to Breakdown
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          ✏️ Edit Manually
        </Button>
        <Button
          type="button"
          onClick={onQuotePreview}
          className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Quote Preview →
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          Print SOW
        </Button>
      </div>
    </div>
  );
}
