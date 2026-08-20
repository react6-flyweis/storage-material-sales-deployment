import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit3, Check, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import type { ExtractShipperResponseData } from "../estimates.api";

interface QuoteSowTabProps {
  buildingSize?: string;
  sqFt?: string | number;
  extractedShipper?: ExtractShipperResponseData;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
}

export function QuoteSowTab({
  buildingSize = "",
  sqFt = "",
  extractedShipper,
  onBackToBreakdown,
  onQuotePreview,
}: QuoteSowTabProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    jobType,
    scope,
    roofType,
    squareFootage: storeSqFt,
    includeTax,
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

  const isSupply = scope.toLowerCase() === "supply" || scope.toLowerCase() === "both";
  const isInstall = scope.toLowerCase() === "install" || scope.toLowerCase() === "both";

  const effectiveSqFt =
    parseFloat(String(sqFt || "")) ||
    extractedShipper?.squareFootage ||
    storeSqFt ||
    68750;

  const totalSellPrice =
    extractedShipper?.pricing?.totSell ??
    extractedShipper?.pricing?.matSell ??
    326563;

  const pricePerSf =
    extractedShipper?.pricing?.sfPrice ??
    (totalSellPrice && effectiveSqFt ? (totalSellPrice / effectiveSqFt).toFixed(2) : "4.75");

  const formattedInvestment = typeof totalSellPrice === "number"
    ? `$${Math.round(totalSellPrice).toLocaleString()}`
    : `$${totalSellPrice}`;

  const formattedPricePerSf = typeof pricePerSf === "number"
    ? `$${pricePerSf.toFixed(2)}/SF`
    : (String(pricePerSf).startsWith("$") ? pricePerSf : `$${pricePerSf}/SF`);

  const displayBuildingSize =
    buildingSize.trim() ||
    (effectiveSqFt ? `${effectiveSqFt.toLocaleString()} SF ${jobType}` : "125X550X36.42 Storage");

  const [documentTitle, setDocumentTitle] = useState(
    `Pre-Engineered Metal Building ${scope === "Supply" ? "Supply & Delivery" : scope === "Install" ? "Installation" : "Supply, Delivery & Installation"}`
  );

  const [projectOverviewText, setProjectOverviewText] = useState(
    `Storage Materials Will Furnish ${isInstall ? "And Install " : ""}A Complete ${jobType} Pre-Engineered Metal Building Package Based On Preliminary Drawings.`
  );

  const [buildingSummaryItems, setBuildingSummaryItems] = useState<string[]>([]);
  const [primaryStructuralItems, setPrimaryStructuralItems] = useState<string[]>([]);
  const [secondaryFramingItems, setSecondaryFramingItems] = useState<string[]>([]);
  const [roofSystemItems, setRoofSystemItems] = useState<string[]>([]);
  const [wallSystemItems, setWallSystemItems] = useState<string[]>([]);
  const [trimAccessoriesItems, setTrimAccessoriesItems] = useState<string[]>([]);
  const [laborEquipmentItems, setLaborEquipmentItems] = useState<string[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<string[]>([]);
  const [editableConcreteInclusions, setEditableConcreteInclusions] = useState<string[]>([]);
  const [editableConcreteNotes, setEditableConcreteNotes] = useState<string>("");
  const [editableInsulationInclusions, setEditableInsulationInclusions] = useState<string[]>([]);
  const [editableInsulationNotes, setEditableInsulationNotes] = useState<string>("");
  const [customInclusions, setCustomInclusions] = useState<string[]>([]);
  const [exclusionsItems, setExclusionsItems] = useState<string[]>([]);
  const [customerResponsibilitiesItems, setCustomerResponsibilitiesItems] = useState<string[]>([]);
  const [deliveryLeadTimeItems, setDeliveryLeadTimeItems] = useState<string[]>([]);
  const [termsConditionsItems, setTermsConditionsItems] = useState<string[]>([]);
  const [warrantyItems, setWarrantyItems] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>("");

  const syncDefaultsFromDynamicData = () => {
    setDocumentTitle(
      `Pre-Engineered Metal Building ${scope === "Supply" ? "Supply & Delivery" : scope === "Install" ? "Installation" : "Supply, Delivery & Installation"}`
    );
    setProjectOverviewText(
      `Storage Materials Will Furnish ${isInstall ? "And Install " : ""}A Complete ${jobType} Pre-Engineered Metal Building Package Based On Preliminary Drawings.`
    );

    const weights = extractedShipper?.weightByCategory || [];
    const mainFramesWeight = weights.find((w) =>
      w.category.toLowerCase().includes("columns") || w.category.toLowerCase().includes("rafters")
    )?.weightLbs;

    const purlinsWeight = weights.find((w) =>
      w.category.toLowerCase().includes("purlin") || w.category.toLowerCase().includes("girt")
    )?.weightLbs;

    const SheetingWeight = weights.find((w) =>
      w.category.toLowerCase().includes("sheeting") || w.category.toLowerCase().includes("roof")
    )?.weightLbs;

    setBuildingSummaryItems([
      `Approx ${effectiveSqFt.toLocaleString()} SF (${displayBuildingSize})`,
      `${jobType} Clear Span Rigid Frame Structure`,
      `Roof System: 26 GA Galvalume (${roofType} System)`,
      `Wall System: 26 GA Panel (Color TBD / R-Panel)`,
      `Total Steel Weight: ${(extractedShipper?.totalWeightLbs || 145000).toLocaleString()} lbs`,
    ]);

    setPrimaryStructuralItems([
      `Rigid Frames (Rafters & Columns)${mainFramesWeight ? ` — ${mainFramesWeight.toLocaleString()} lbs` : ""}`,
      "Base Plates And Welded Connections",
      "Anchor Bolt Plans (For Reference Only)",
    ]);

    setSecondaryFramingItems([
      `Purlins (Roof) & Girts (Walls)${purlinsWeight ? ` — ${purlinsWeight.toLocaleString()} lbs` : ""}`,
      "Eave Struts",
      "Bracing (Rod/Cable/Portal As Designed)",
      "Flange Bracing",
    ]);

    setRoofSystemItems([
      `26 GA Galvalume Roof Panels (${roofType} System${SheetingWeight ? ` — ${SheetingWeight.toLocaleString()} lbs` : ""})`,
      "Ridge Cap",
      "Closure Strips",
      "Fasteners (Self-Drilling Screws)",
      "Sealants (Standard PEMB Package)",
    ]);

    setWallSystemItems([
      "26 GA Wall Panels",
      "Base Trim, Corner Trim, J-Trim",
      "Standard Pedestrian Trims",
      "Fasteners And Closures",
    ]);

    setTrimAccessoriesItems([
      "Ridge, Eave, Rake, Corner, Base Trim Package",
      "Downspouts And Gutters (If Shown On Plans)",
    ]);

    setLaborEquipmentItems([
      "Full Erection Crew And Supervision",
      "Lifts, Telehandlers, And Equipment",
      "Offloading, Staging, And Site Coordination",
    ]);

    setDeliveryItems([
      "Freight To Jobsite (Standard Truck Delivery)",
      "Unloading By Others (Unless Installation Included)",
      "Delivered In Bundled/Packaged Condition",
    ]);

    setEditableConcreteInclusions(concreteInclusions || []);
    setEditableConcreteNotes(concreteNotes || "");
    setEditableInsulationInclusions(insulationInclusions || []);
    setEditableInsulationNotes(insulationNotes || "");

    setExclusionsItems([
      ...(!isInstall ? ["Building Erection & Labor (Supply Only Contract)"] : []),
      ...(!isSupply ? ["Building Materials & Freight (Installation Only Contract)"] : []),
      ...(!concreteInclude ? ["Concrete Foundation, Slab, And Anchor Bolts"] : []),
      ...(!insulationInclude ? ["Insulation System"] : []),
      "Doors (Overhead, Roll-Up, Man Doors - Unless Noted)",
      "Windows, Louvers, Or Ventilation Systems",
      "Interior Liner Panels",
      "Cranes, Equipment, Or Unloading (Unless Noted)",
      "Permits, Impact Fees, Or Inspections",
      "Electrical, Plumbing, HVAC, Fire Suppression",
      ...(!includeTax ? ["Sales Tax (Unless Applicable / Invoiced Separately)"] : []),
    ]);

    setCustomerResponsibilitiesItems([
      "Adequate Site Access For Delivery Trucks",
      "Offloading Equipment (Forklift/Crane)",
      "Secure Material Storage After Delivery",
      "Verification Of Dimensions And Openings",
    ]);

    setDeliveryLeadTimeItems([
      "Estimated Lead Time: 8-10 Weeks (Subject To Approval & Production)",
      "Delivery: FOB Jobsite",
      "Partial Shipments May Occur",
    ]);

    setTermsConditionsItems([
      "Drawings Are PRELIMINARY — NOT FOR CONSTRUCTION Until Stamped",
      "Final Pricing Subject To Approved Drawings And Material Selection",
      "Storage Materials Not Responsible For Installation Errors, Foundation Discrepancies, Or Field Modifications",
    ]);

    setWarrantyItems([
      "Paint Finish Warranty: Typically 25 Years",
      "Structural Steel: Per PEMB Manufacturer Standard Warranty",
    ]);
  };

  useEffect(() => {
    if (!isEditing) {
      syncDefaultsFromDynamicData();
    }
  }, [
    effectiveSqFt,
    jobType,
    scope,
    roofType,
    concreteInclude,
    concreteInclusions,
    concreteNotes,
    insulationInclude,
    insulationInclusions,
    insulationNotes,
    includeTax,
    extractedShipper?.totalWeightLbs,
  ]);

  const handleApplyAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    const newPrompt = aiPrompt.trim();
    setCustomInclusions((prev) => [...prev, newPrompt]);
    setAiFeedback(`✨ Added "${newPrompt}" to Scope of Work inclusions!`);
    setAiPrompt("");
    setTimeout(() => setAiFeedback(null), 4000);
  };

  const handleItemChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    val: string
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    defaultText = "New item text"
  ) => {
    setter((prev) => [...prev, defaultText]);
  };

  const handleRemoveItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="text-amber-600">✏️</span>
            <span className="text-blue-900 font-extrabold">AI SOW Editor</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 h-7 px-2.5 rounded flex items-center gap-1 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Done Editing
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Edit Manually
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-600">
          Describe a change and Claude will update the SOW instantly, or edit texts directly below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyAiPrompt();
              }
            }}
            placeholder="e.g. 'Add structural framing requirement' or 'Add extra steel column spec'"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <Button
            type="button"
            onClick={handleApplyAiPrompt}
            className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            Apply <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          </Button>
        </div>
        {aiFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{aiFeedback}</span>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Edit3 className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Manual Edit Mode Active — You can edit all titles, grid info, overview, and list items.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={syncDefaultsFromDynamicData}
              className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100/60 text-xs px-3 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" /> Reset to Dynamic Data
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      <div className="border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-2xs space-y-6 text-slate-800">
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
            <p className="text-slate-600 mt-1 text-[11px]">
              Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="text-center py-2 border-b border-slate-200 space-y-1">
          {isEditing ? (
            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Document Title
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full text-center text-base font-extrabold text-slate-900 border border-amber-300 rounded-md px-3 py-1.5 bg-amber-50/30 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          ) : (
            <h2 className="text-base font-extrabold text-slate-900">{documentTitle}</h2>
          )}
        </div>

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
                BUILDING SIZE & SQ FT
              </span>
              <span className="font-bold text-slate-900">{displayBuildingSize}</span>
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
                PREPARED BY & SCOPE
              </span>
              <span className="font-bold text-slate-900">
                Storage Materials ({scope.toUpperCase()})
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DATE
              </span>
              <span className="font-bold text-slate-900">July 31, 2026</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              1. PROJECT OVERVIEW
            </h4>
            {isEditing ? (
              <textarea
                value={projectOverviewText}
                onChange={(e) => setProjectOverviewText(e.target.value)}
                rows={3}
                className="w-full border border-amber-300 rounded-lg p-2.5 text-xs text-slate-800 bg-amber-50/30 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <p>{projectOverviewText}</p>
            )}
            <div className="space-y-1.5 pt-1 font-medium">
              <p className="font-semibold text-slate-900">Building Summary:</p>
              {isEditing ? (
                <div className="space-y-2 pl-1">
                  {buildingSummaryItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(setBuildingSummaryItems, idx, e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveItem(setBuildingSummaryItems, idx)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddItem(setBuildingSummaryItems, "New Summary Item")}
                    className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-7 px-2.5 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                  >
                    <Plus className="h-3 w-3" /> Add Summary Line
                  </Button>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                  {buildingSummaryItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              2. SCOPE OF WORK — INCLUSIONS
            </h4>
            <div className="space-y-3 pl-1">
              <div>
                <p className="font-bold text-slate-900">2.1 Primary Structural System</p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {primaryStructuralItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(setPrimaryStructuralItems, idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem(setPrimaryStructuralItems, idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem(setPrimaryStructuralItems, "New Spec Item")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {primaryStructuralItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">2.2 Secondary Framing</p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {secondaryFramingItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(setSecondaryFramingItems, idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem(setSecondaryFramingItems, idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem(setSecondaryFramingItems, "New Framing Item")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {secondaryFramingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">2.3 Roof System</p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {roofSystemItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(setRoofSystemItems, idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem(setRoofSystemItems, idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem(setRoofSystemItems, "New Roof Spec")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {roofSystemItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">2.4 Wall System</p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {wallSystemItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(setWallSystemItems, idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem(setWallSystemItems, idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem(setWallSystemItems, "New Wall Spec")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {wallSystemItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">2.5 Trim & Accessories</p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {trimAccessoriesItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(setTrimAccessoriesItems, idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem(setTrimAccessoriesItems, idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem(setTrimAccessoriesItems, "New Trim Item")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {trimAccessoriesItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              {isInstall && (
                <div>
                  <p className="font-bold text-slate-900">2.6 Labor & Equipment</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1 pl-2">
                      {laborEquipmentItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(setLaborEquipmentItems, idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem(setLaborEquipmentItems, idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem(setLaborEquipmentItems, "New Labor Spec")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Item
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {laborEquipmentItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {isSupply && (
                <div>
                  <p className="font-bold text-slate-900">2.7 Delivery</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1 pl-2">
                      {deliveryItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(setDeliveryItems, idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem(setDeliveryItems, idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem(setDeliveryItems, "New Delivery Spec")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Item
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {deliveryItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {concreteInclude && (
                <div>
                  <p className="font-bold text-slate-900">
                    2.8 Concrete Foundation & Slab ({concreteSlabThickness} · {concretePsiRating})
                  </p>
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1 pl-2">
                      {editableConcreteInclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(setEditableConcreteInclusions, idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem(setEditableConcreteInclusions, idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem(setEditableConcreteInclusions, "New Concrete Inclusion")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Concrete Inclusion
                      </Button>
                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Concrete Note"
                          value={editableConcreteNotes}
                          onChange={(e) => setEditableConcreteNotes(e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {editableConcreteInclusions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {editableConcreteNotes && <li>Note: {editableConcreteNotes}</li>}
                    </ul>
                  )}
                </div>
              )}
              {insulationInclude && (
                <div>
                  <p className="font-bold text-slate-900">
                    2.9 Insulation System ({insulationSystem} · Roof {insulationRValueRoof} / Wall {insulationRValueWalls})
                  </p>
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1 pl-2">
                      {editableInsulationInclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(setEditableInsulationInclusions, idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem(setEditableInsulationInclusions, idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem(setEditableInsulationInclusions, "New Insulation Inclusion")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Insulation Inclusion
                      </Button>
                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Insulation Note"
                          value={editableInsulationNotes}
                          onChange={(e) => setEditableInsulationNotes(e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {editableInsulationInclusions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {editableInsulationNotes && <li>Note: {editableInsulationNotes}</li>}
                    </ul>
                  )}
                </div>
              )}
              {(customInclusions.length > 0 || isEditing) && (
                <div>
                  <p className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                    <span>2.10 Custom Inclusions / Requirements</span>
                  </p>
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1 pl-2">
                      {customInclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(setCustomInclusions, idx, e.target.value)}
                            className="flex-1 border border-blue-300 rounded px-2 py-1 text-xs text-slate-800 bg-blue-50/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem(setCustomInclusions, idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem(setCustomInclusions, "Custom SOW Requirement")}
                        className="border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Custom Inclusion
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-blue-900 font-medium pl-2">
                      {customInclusions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              3. EXCLUSIONS (BY OTHERS)
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {exclusionsItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(setExclusionsItems, idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(setExclusionsItems, idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(setExclusionsItems, "New Exclusion Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Exclusion
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {exclusionsItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              4. CUSTOMER RESPONSIBILITIES
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {customerResponsibilitiesItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(setCustomerResponsibilitiesItems, idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(setCustomerResponsibilitiesItems, idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(setCustomerResponsibilitiesItems, "New Responsibility Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Responsibility
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {customerResponsibilitiesItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              5. DELIVERY & LEAD TIME
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {deliveryLeadTimeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(setDeliveryLeadTimeItems, idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(setDeliveryLeadTimeItems, idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(setDeliveryLeadTimeItems, "New Delivery Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {deliveryLeadTimeItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              6. TERMS & CONDITIONS
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {termsConditionsItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(setTermsConditionsItems, idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(setTermsConditionsItems, idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(setTermsConditionsItems, "New Term Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Term
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {termsConditionsItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              7. WARRANTY
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {warrantyItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(setWarrantyItems, idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(setWarrantyItems, idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(setWarrantyItems, "New Warranty Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Warranty Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {warrantyItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          {(customNotes || isEditing) && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider">
                8. ADDITIONAL SPECIAL INSTRUCTIONS & NOTES
              </h4>
              {isEditing ? (
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter any additional custom notes, special terms, or jobsite instructions..."
                  rows={3}
                  className="w-full border border-blue-300 rounded-lg p-2.5 text-xs text-slate-800 bg-blue-50/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 italic">
                  {customNotes}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
            TOTAL PROJECT INVESTMENT
          </div>
          <div className="text-3xl md:text-4xl font-extrabold">{formattedInvestment}</div>
          <div className="text-xs text-blue-200 font-medium uppercase">
            {formattedPricePerSf} · {displayBuildingSize} · {scope}
          </div>
        </div>
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
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
            isEditing
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              : "border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" /> Done Editing
            </>
          ) : (
            <>✏️ Edit Manually</>
          )}
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
          onClick={() => window.print()}
          className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          Print SOW
        </Button>
      </div>
    </div>
  );
}
