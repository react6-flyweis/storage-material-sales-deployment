import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Printer, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function QuotePreviewPage() {
  const navigate = useNavigate();

  // File state for PDF dropzone
  const [selectedPdf, setSelectedPdf] = useState<{ name: string } | null>({
    name: "Steel_Building_Preliminary_Drawing_Vector.pdf",
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedPdf({ name: file.name });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPdf({ name: file.name });
    }
  };

  const handleClearAll = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4" />
            Generate & Print PDF
          </Button>
          <Button
            type="button"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs"
          >
            Save to History
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 max-w-5xl">
        {/* Building drawings & plans Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-xl">
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
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800">
          {/* Estimate Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
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
              <p className="text-slate-600 mt-1 text-[11px]">Date: August 1, 2026</p>
              <p className="text-slate-600 text-[11px]">Expiration: August 16, 2026</p>
              <p className="text-slate-600 text-[11px]">Business/Tax #: 99-4515145</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  PREPARED FOR
                </span>
                <span className="font-bold text-slate-900 text-sm">Council Bluffs, IA 51503</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  BUILDING
                </span>
                <span className="font-bold text-slate-900 text-sm">20×150×8.5 PEMB</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  ROOF SYSTEM
                </span>
                <span className="font-bold text-slate-900 text-sm">26 GA Galvalume (R-Panel, Screw-Down)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  LOCATION
                </span>
                <span className="font-bold text-slate-900 text-sm">TBD</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  SCOPE
                </span>
                <span className="font-bold text-slate-900 text-sm">Pre-Engineered Metal Building Supply & Delivery Only</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  TOTAL WEIGHT
                </span>
                <span className="font-bold text-slate-900 text-sm">9,508 Lbs · 1 Truck</span>
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
              $6.13/SF · 3,000 SF · FREIGHT INCLUDED
            </div>
          </div>

          {/* Pricing Summary, Scope Included, Exclusions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs pt-2">
            {/* PRICING SUMMARY */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                PRICING SUMMARY
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
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
                <div className="flex justify-between text-slate-900 font-bold border-b border-slate-900 pb-2 pt-1">
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
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                SCOPE INCLUDED
              </h4>
              <ul className="space-y-2 text-slate-600 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Full Storage Structural System</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Screw-Down Metal Roof Panels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Wall Panels, Trim & Accessories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>All Fasteners, Sealants & Closures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Freight To Jobsite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Labor & Installation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Equipment & Supervision</span>
                </li>
              </ul>
            </div>

            {/* EXCLUSIONS */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
                EXCLUSIONS
              </h4>
              <ul className="space-y-2 text-slate-600 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Concrete Foundation & Slab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Insulation System</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Electrical, Plumbing, HVAC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Fire Suppression</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Permits & Engineering</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-10 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 mb-10">Steel Investments DBA Storage Materials</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-10">Council Bluffs, IA 51503</h5>
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
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
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
              <p className="text-slate-600 mt-1 text-[11px]">Date: August 1, 2026</p>
            </div>
          </div>

          {/* Installation Only Banner */}
          <div className="text-center py-2 border-b border-slate-200 text-sm font-bold text-slate-900">
            Installation Only
          </div>

          {/* Info Grid */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  PROJECT NAME
                </span>
                <span className="font-bold text-slate-900 text-sm">Customer Project</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  LOCATION
                </span>
                <span className="font-bold text-slate-900 text-sm">TBD</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  BUILDING SIZE
                </span>
                <span className="font-bold text-slate-900 text-sm">125×550×36.42 Storage</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  CUSTOMER
                </span>
                <span className="font-bold text-slate-900 text-sm">Customer</span>
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
                <span className="font-bold text-slate-900 text-sm">July 31, 2026</span>
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
                Storage Materials Will Furnish And Install A Complete Pre-Engineered Metal Building (PEMB) Package Based On Preliminary Drawings.
              </p>
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Building Summary:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>Approx. 125×550×36.42 Eave Height</li>
                  <li>Clear Span Rigid Frame Structure</li>
                  <li>Roof System: 26 GA Galvalume (R-Panel, Screw-Down)</li>
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
                    <li>26 GA Galvalume Roof Panels (25 Year System)</li>
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
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.6 Labor & Equipment</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>Full Erection Crew And Supervision</li>
                    <li>Lifts, Telehandlers, And Equipment</li>
                    <li>Offloading, Staging, And Site Coordination</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">2.7 Delivery</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    <li>Freight To Jobsite (Standard Truck Delivery)</li>
                    <li>Unloading By Others</li>
                    <li>Delivered In Bundled/Packaged Condition</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. EXCLUSIONS (BY OTHERS) */}
            <div>
              <h4 className="font-bold text-[#1E3A8A] uppercase border-b border-slate-200 pb-1.5 mb-2 tracking-wider">
                3. EXCLUSIONS (BY OTHERS)
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
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
            <div className="text-3xl md:text-4xl font-extrabold">$326,563</div>
            <div className="text-xs text-blue-200 font-medium">
              $4.75/SF BUILDING - INSTALLATION ONLY
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-10 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 mb-10">Steel Investments DBA Storage Materials</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-10">Customer</h5>
              <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
                <span>Authorized Signature</span>
                <span>Date</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Printable Fabrication & Supply Agreement Card Box */}
        <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-800">
          <h3 className="text-lg font-bold text-slate-900 text-center">
            Fabrication & Supply Agreement
          </h3>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-800">Fabrication & Supply Agreement</p>
            <p>
              This Fabrication & Supply Agreement ("Agreement"), Dated As Of July 31, 2026 ("Effective Date"), Is Entered Into By And Between Steel Investments, LLC ("Steel"), And Council Bluffs, IA 51503 ("Customer").
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
              <p>Total Contract Value: $18,396</p>
              <p>Scope: Fabrication And Supply Of Pre-Engineered Metal Building Materials And Systems.</p>
            </div>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <h4 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">
              SIGNATURES
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
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
                <h5 className="font-bold text-slate-900 uppercase">[CUSTOMER LEGAL ENTITY NAME]</h5>
                <div className="border-b border-slate-300 flex justify-between pb-1 text-[10px] text-slate-400 font-medium pt-8">
                  <span>Authorized Signature</span>
                  <span>Date</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  <p>[E-MAIL ADDRESS]</p>
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
