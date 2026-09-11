import { useState } from "react";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { useQuotationPricing, type UseQuotationPricingParams } from "./use-quotation-pricing";
import type { ShipperWeightByCategoryItem } from "../estimates.api";

export type UseSowDocumentParams = UseQuotationPricingParams;

export interface SowDocumentState {
  documentTitle: string;
  projectOverviewText: string;
  buildingSummaryItems: string[];
  primaryStructuralItems: string[];
  secondaryFramingItems: string[];
  roofSystemItems: string[];
  wallSystemItems: string[];
  trimAccessoriesItems: string[];
  laborEquipmentItems: string[];
  deliveryItems: string[];
  editableConcreteInclusions: string[];
  editableConcreteNotes: string;
  editableInsulationInclusions: string[];
  editableInsulationNotes: string;
  customInclusions: string[];
  exclusionsItems: string[];
  customerResponsibilitiesItems: string[];
  deliveryLeadTimeItems: string[];
  termsConditionsItems: string[];
  warrantyItems: string[];
  customNotes: string;
}

export function useSowDocument(params: UseSowDocumentParams = {}) {
  const {
    extractedShipper,
    sqFt,
    buildingSize,
    quotationForm,
    extractedDrawing,
  } = params;

  const pricingData = useQuotationPricing({
    extractedShipper,
    sqFt,
    buildingSize,
    quotationForm,
    extractedDrawing,
  });

  const {
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
  } = useQuotationStore();

  const isSupply = scope.toLowerCase() === "supply" || scope.toLowerCase() === "both";
  const isInstall = scope.toLowerCase() === "install" || scope.toLowerCase() === "both";

  const initialWeights: ShipperWeightByCategoryItem[] = extractedShipper?.weightByCategory || [];
  const mainFramesWeight = initialWeights.find((w) =>
    w.category.toLowerCase().includes("columns") || w.category.toLowerCase().includes("rafters")
  )?.weightLbs;

  const purlinsWeight = initialWeights.find((w) =>
    w.category.toLowerCase().includes("purlin") || w.category.toLowerCase().includes("girt")
  )?.weightLbs;

  const sheetingWeight = initialWeights.find((w) =>
    w.category.toLowerCase().includes("sheeting") || w.category.toLowerCase().includes("roof")
  )?.weightLbs;

  const getDefaultState = (): SowDocumentState => ({
    documentTitle: `Pre-Engineered Metal Building ${scope === "Supply"
      ? "Supply & Delivery"
      : scope === "Install"
        ? "Installation"
        : "Supply, Delivery & Installation"
      }`,
    projectOverviewText: `Storage Materials Will Furnish ${isInstall ? "And Install " : ""
      }A Complete ${jobType} Pre-Engineered Metal Building Package Based On Preliminary Drawings.`,
    buildingSummaryItems: [
      `Approx ${pricingData.effectiveSqFt.toLocaleString()} SF (${pricingData.displayBuildingSize})`,
      `${jobType} Clear Span Rigid Frame Structure`,
      `Roof System: 26 GA Galvalume (${roofType} System)`,
      `Wall System: 26 GA Panel (Color TBD / R-Panel)`,
      `Total Steel Weight: ${(extractedShipper?.totalWeightLbs || 145000).toLocaleString()} lbs`,
    ],
    primaryStructuralItems: [
      `Rigid Frames (Rafters & Columns)${mainFramesWeight ? ` — ${mainFramesWeight.toLocaleString()} lbs` : ""
      }`,
      "Base Plates And Welded Connections",
      "Anchor Bolt Plans (For Reference Only)",
    ],
    secondaryFramingItems: [
      `Purlins (Roof) & Girts (Walls)${purlinsWeight ? ` — ${purlinsWeight.toLocaleString()} lbs` : ""
      }`,
      "Eave Struts",
      "Bracing (Rod/Cable/Portal As Designed)",
      "Flange Bracing",
    ],
    roofSystemItems: [
      `26 GA Galvalume Roof Panels (${roofType} System${sheetingWeight ? ` — ${sheetingWeight.toLocaleString()} lbs` : ""
      })`,
      "Ridge Cap",
      "Closure Strips",
      "Fasteners (Self-Drilling Screws)",
      "Sealants (Standard PEMB Package)",
    ],
    wallSystemItems: [
      "26 GA Wall Panels",
      "Base Trim, Corner Trim, J-Trim",
      "Standard Pedestrian Trims",
      "Fasteners And Closures",
    ],
    trimAccessoriesItems: [
      "Ridge, Eave, Rake, Corner, Base Trim Package",
      "Downspouts And Gutters (If Shown On Plans)",
    ],
    laborEquipmentItems: [
      "Full Erection Crew And Supervision",
      "Lifts, Telehandlers, And Equipment",
      "Offloading, Staging, And Site Coordination",
    ],
    deliveryItems: [
      "Freight To Jobsite (Standard Truck Delivery)",
      "Unloading By Others (Unless Installation Included)",
      "Delivered In Bundled/Packaged Condition",
    ],
    editableConcreteInclusions: concreteInclusions || [],
    editableConcreteNotes: concreteNotes || "",
    editableInsulationInclusions: insulationInclusions || [],
    editableInsulationNotes: insulationNotes || "",
    customInclusions: [],
    exclusionsItems: [
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
    ],
    customerResponsibilitiesItems: [
      "Adequate Site Access For Delivery Trucks",
      "Offloading Equipment (Forklift/Crane)",
      "Secure Material Storage After Delivery",
      "Verification Of Dimensions And Openings",
    ],
    deliveryLeadTimeItems: [
      "Estimated Lead Time: 8-10 Weeks (Subject To Approval & Production)",
      "Delivery: FOB Jobsite",
      "Partial Shipments May Occur",
    ],
    termsConditionsItems: [
      "Drawings Are PRELIMINARY — NOT FOR CONSTRUCTION Until Stamped",
      "Final Pricing Subject To Approved Drawings And Material Selection",
      "Storage Materials Not Responsible For Installation Errors, Foundation Discrepancies, Or Field Modifications",
    ],
    warrantyItems: [
      "Paint Finish Warranty: Typically 25 Years",
      "Structural Steel: Per PEMB Manufacturer Standard Warranty",
    ],
    customNotes: "",
  });

  const [state, setState] = useState<SowDocumentState>(getDefaultState);

  const handleItemChange = (
    key: keyof Pick<
      SowDocumentState,
      | "buildingSummaryItems"
      | "primaryStructuralItems"
      | "secondaryFramingItems"
      | "roofSystemItems"
      | "wallSystemItems"
      | "trimAccessoriesItems"
      | "laborEquipmentItems"
      | "deliveryItems"
      | "editableConcreteInclusions"
      | "editableInsulationInclusions"
      | "customInclusions"
      | "exclusionsItems"
      | "customerResponsibilitiesItems"
      | "deliveryLeadTimeItems"
      | "termsConditionsItems"
      | "warrantyItems"
    >,
    index: number,
    value: string
  ) => {
    setState((prev) => {
      const arr = [...prev[key]];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  };

  const handleAddItem = (
    key: keyof Pick<
      SowDocumentState,
      | "buildingSummaryItems"
      | "primaryStructuralItems"
      | "secondaryFramingItems"
      | "roofSystemItems"
      | "wallSystemItems"
      | "trimAccessoriesItems"
      | "laborEquipmentItems"
      | "deliveryItems"
      | "editableConcreteInclusions"
      | "editableInsulationInclusions"
      | "customInclusions"
      | "exclusionsItems"
      | "customerResponsibilitiesItems"
      | "deliveryLeadTimeItems"
      | "termsConditionsItems"
      | "warrantyItems"
    >,
    defaultText = "New item text"
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: [...prev[key], defaultText],
    }));
  };

  const handleRemoveItem = (
    key: keyof Pick<
      SowDocumentState,
      | "buildingSummaryItems"
      | "primaryStructuralItems"
      | "secondaryFramingItems"
      | "roofSystemItems"
      | "wallSystemItems"
      | "trimAccessoriesItems"
      | "laborEquipmentItems"
      | "deliveryItems"
      | "editableConcreteInclusions"
      | "editableInsulationInclusions"
      | "customInclusions"
      | "exclusionsItems"
      | "customerResponsibilitiesItems"
      | "deliveryLeadTimeItems"
      | "termsConditionsItems"
      | "warrantyItems"
    >,
    index: number
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const setFieldValue = <K extends keyof SowDocumentState>(
    key: K,
    value: SowDocumentState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomInclusion = (text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      customInclusions: [...prev.customInclusions, text.trim()],
    }));
  };

  const resetToDefaults = () => {
    setState(getDefaultState());
  };

  return {
    state,
    setState,
    pricingData,
    isSupply,
    isInstall,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    setFieldValue,
    addCustomInclusion,
    resetToDefaults,
  };
}

export type UseSowDocumentReturn = ReturnType<typeof useSowDocument>;
