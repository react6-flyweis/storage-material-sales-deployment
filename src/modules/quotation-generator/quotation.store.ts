import { create } from "zustand";
import type {
  ExtractDrawingResponseData,
  ExtractShipperResponseData,
} from "./estimates.api";

export interface QuotationState {
  // Shared fields between Sidebar, Sticky Header, and Quotation Views
  jobType: "PEMB" | "Storage";
  scope: "Supply" | "Install" | "Both";
  roofType: string;
  installCost: number;
  installSell: number;
  blendPercentage: number;
  installDifficulty: string;
  squareFootage: number;

  // PEMB Specific State
  pembLeadId: string;
  pembLeadName: string;
  pembEmail: string;
  pembStreet: string;
  pembCityStateZip: string;
  pembJobNumber: string;
  pembBuildingSize: string;
  pembSquareFootage: string;
  pembQuoteDate: string;
  pembExtractedDrawing: ExtractDrawingResponseData | null;
  pembExtractedShipper: ExtractShipperResponseData | null;
  pembPdfFileName: string;
  pembEstimateId: string | null;

  // Concrete settings
  concreteInclude: boolean;
  concreteCostSf: number;
  concreteMarginPct: number;
  concreteSlabThickness: '4"' | '6"';
  concretePsiRating: string;
  concreteNotes: string;
  concreteInclusions: string[];

  // Insulation settings
  insulationInclude: boolean;
  insulationSystem: "Vinyl-backed (single layer)" | "Double-layer system" | "Spray Foam";
  insulationRValueRoof: string;
  insulationRValueWalls: string;
  insulationCogsSf: number;
  insulationMarginPct: number;
  insulationNotes: string;
  insulationInclusions: string[];

  // Sales Tax settings
  taxZip: string;
  taxRate: number;
  includeTax: boolean;
  isTaxLoading: boolean;

  // COGS Override settings
  cogsOverrideApplied: boolean;
  cogsCostInput: string;
  cogsCostAdjustPercent: number;
  cogsMaterialMargin: number;
  cogsFixedSellPrice: string;

  // Margin Override settings
  marginOverrideApplied: boolean;
  marginLaborOverride: string;
  marginTargetMargin: string;
  marginFixedSellOverride: string;

  // Storage Specific State
  storageData: Record<string, unknown> | null;
  storagePricing: Record<string, unknown> | null;
  storageFileName: string;
  storageEstimateId: string | null;
  storageGlobalMarkup: number;
  storageShipping: number;
  storageDrawingsCost: number;
  storageCustomerLeadName: string;
  storageCustomerAddress: string;
  storageCustomerEmail: string;
  storageJobNumber: string;
  storageDrawings: Array<{ name: string; data: string; includeInPackage: boolean }>;

  // Actions
  setJobType: (jobType: "PEMB" | "Storage") => void;
  setScope: (scope: "Supply" | "Install" | "Both") => void;
  setRoofType: (roofType: string) => void;
  setInstallCost: (cost: number) => void;
  setInstallSell: (sell: number) => void;
  setBlendPercentage: (percentage: number) => void;
  setInstallDifficulty: (installDifficulty: string) => void;
  buildingSize: string;
  setBuildingSize: (buildingSize: string) => void;
  setSquareFootage: (squareFootage: number) => void;

  // PEMB Actions
  setPembLeadData: (data: {
    leadId?: string;
    leadName?: string;
    email?: string;
    street?: string;
    cityStateZip?: string;
    jobNumber?: string;
    buildingSize?: string;
    squareFootage?: string;
    quoteDate?: string;
  }) => void;
  setPembExtractedDrawing: (data: ExtractDrawingResponseData | null) => void;
  setPembExtractedShipper: (data: ExtractShipperResponseData | null) => void;
  setPembPdfFileName: (fileName: string) => void;
  setPembEstimateId: (id: string | null) => void;
  resetPembState: () => void;

  // Storage Actions
  setStorageData: (data: Record<string, unknown> | null) => void;
  setStoragePricing: (pricing: Record<string, unknown> | null) => void;
  setStorageFileName: (fileName: string) => void;
  setStorageEstimateId: (id: string | null) => void;
  setStorageGlobalMarkup: (markup: number) => void;
  setStorageShipping: (shipping: number) => void;
  setStorageDrawingsCost: (cost: number) => void;
  setStorageCustomerLeadName: (name: string) => void;
  setStorageCustomerAddress: (address: string) => void;
  setStorageCustomerEmail: (email: string) => void;
  setStorageJobNumber: (jobNumber: string) => void;
  setStorageDrawings: (
    drawings: Array<{ name: string; data: string; includeInPackage: boolean }>
  ) => void;
  resetStorageState: () => void;

  // Concrete Actions
  setConcreteInclude: (concreteInclude: boolean) => void;
  setConcreteCostSf: (concreteCostSf: number) => void;
  setConcreteMarginPct: (concreteMarginPct: number) => void;
  setConcreteSlabThickness: (slabThickness: '4"' | '6"') => void;
  setConcretePsiRating: (psiRating: string) => void;
  setConcreteNotes: (concreteNotes: string) => void;
  setConcreteInclusions: (concreteInclusions: string[]) => void;
  toggleConcreteInclusion: (item: string) => void;
  resetConcreteSettings: () => void;

  // Insulation Actions
  setInsulationInclude: (insulationInclude: boolean) => void;
  setInsulationSystem: (
    insulationSystem: "Vinyl-backed (single layer)" | "Double-layer system" | "Spray Foam"
  ) => void;
  setInsulationRValueRoof: (insulationRValueRoof: string) => void;
  setInsulationRValueWalls: (insulationRValueWalls: string) => void;
  setInsulationCogsSf: (insulationCogsSf: number) => void;
  setInsulationMarginPct: (insulationMarginPct: number) => void;
  setInsulationNotes: (insulationNotes: string) => void;
  setInsulationInclusions: (insulationInclusions: string[]) => void;
  toggleInsulationInclusion: (item: string) => void;
  resetInsulationSettings: () => void;

  // Sales Tax Actions
  setTaxZip: (taxZip: string) => void;
  setTaxRate: (taxRate: number) => void;
  setIncludeTax: (includeTax: boolean) => void;
  setIsTaxLoading: (isTaxLoading: boolean) => void;

  // COGS Actions
  setCogsOverrideApplied: (applied: boolean) => void;
  setCogsCostInput: (cogsCostInput: string) => void;
  setCogsCostAdjustPercent: (cogsCostAdjustPercent: number) => void;
  setCogsMaterialMargin: (cogsMaterialMargin: number) => void;
  setCogsFixedSellPrice: (cogsFixedSellPrice: string) => void;
  resetCogsSettings: () => void;

  // Margin Actions
  setMarginOverrideApplied: (applied: boolean) => void;
  setMarginLaborOverride: (marginLaborOverride: string) => void;
  setMarginTargetMargin: (marginTargetMargin: string) => void;
  setMarginFixedSellOverride: (marginFixedSellOverride: string) => void;
  resetMarginSettings: () => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  jobType: "PEMB",
  scope: "Supply",
  roofType: "screw-down",
  installCost: 5.5,
  installSell: 8.5,
  blendPercentage: 50,
  installDifficulty: "easy",
  buildingSize: "",
  squareFootage: 0,

  // Concrete initial state
  concreteInclude: true,
  concreteCostSf: 7.25,
  concreteMarginPct: 25,
  concreteSlabThickness: '6"',
  concretePsiRating: "4000 PSI",
  concreteNotes: "",
  concreteInclusions: [
    "Pier excavation & placement",
    "Reinforced rebar system (tied)",
    "10mm vapor barrier",
    'Smooth finish (±1/10" tolerance)',
    "All labor, equipment & materials",
  ],

  // Insulation initial state
  insulationInclude: false,
  insulationSystem: "Vinyl-backed (single layer)",
  insulationRValueRoof: "R-19",
  insulationRValueWalls: "R-13",
  insulationCogsSf: 1.5,
  insulationMarginPct: 25,
  insulationNotes: "",
  insulationInclusions: [
    "Roof insulation",
    "Wall insulation",
    "Vapor retarder / facing",
    "All labor & installation",
    "Seam tape & fasteners",
  ],

  // Sales Tax initial state
  taxZip: "51503",
  taxRate: 7,
  includeTax: true,
  isTaxLoading: false,

  // COGS Override initial state
  cogsOverrideApplied: false,
  cogsCostInput: "",
  cogsCostAdjustPercent: 0,
  cogsMaterialMargin: 0,
  cogsFixedSellPrice: "",

  // Margin Override initial state
  marginOverrideApplied: false,
  marginLaborOverride: "",
  marginTargetMargin: "",
  marginFixedSellOverride: "",


  // PEMB initial state
  pembLeadId: "",
  pembLeadName: "",
  pembEmail: "",
  pembStreet: "",
  pembCityStateZip: "",
  pembJobNumber: "",
  pembBuildingSize: "",
  pembSquareFootage: "",
  pembQuoteDate: "",
  pembExtractedDrawing: null,
  pembExtractedShipper: null,
  pembPdfFileName: "",
  pembEstimateId: null,

  // Storage initial state
  storageData: null,
  storagePricing: null,
  storageFileName: "",
  storageEstimateId: null,
  storageGlobalMarkup: 25,
  storageShipping: 12000,
  storageDrawingsCost: 0,
  storageCustomerLeadName: "",
  storageCustomerAddress: "",
  storageCustomerEmail: "",
  storageJobNumber: "",
  storageDrawings: [],

  // General Setters
  setJobType: (jobType) =>
    set((state) => ({
      jobType,
      ...(jobType === "Storage"
        ? {
          installCost:
            state.installCost === 5.5 || state.installCost === 5.85
              ? 2.5
              : state.installCost,
          installSell:
            state.installSell === 8.5 || state.installSell === 9.0
              ? 3.25
              : state.installSell,
        }
        : {
          installCost:
            state.installCost === 2.5 ? 5.5 : state.installCost,
          installSell:
            state.installSell === 3.25 ? 8.5 : state.installSell,
        }),
    })),
  setScope: (scope) => set({ scope }),
  setRoofType: (roofType) => set({ roofType }),
  setInstallCost: (installCost) => set({ installCost }),
  setInstallSell: (installSell) => set({ installSell }),
  setBlendPercentage: (blendPercentage) => set({ blendPercentage }),
  setInstallDifficulty: (installDifficulty) => set({ installDifficulty }),
  setBuildingSize: (buildingSize) => set({ buildingSize }),
  setSquareFootage: (squareFootage) => set({ squareFootage }),

  // PEMB Actions
  setPembLeadData: (data) =>
    set((state) => ({
      pembLeadId: data.leadId !== undefined ? data.leadId : state.pembLeadId,
      pembLeadName: data.leadName !== undefined ? data.leadName : state.pembLeadName,
      pembEmail: data.email !== undefined ? data.email : state.pembEmail,
      pembStreet: data.street !== undefined ? data.street : state.pembStreet,
      pembCityStateZip: data.cityStateZip !== undefined ? data.cityStateZip : state.pembCityStateZip,
      pembJobNumber: data.jobNumber !== undefined ? data.jobNumber : state.pembJobNumber,
      pembBuildingSize: data.buildingSize !== undefined ? data.buildingSize : state.pembBuildingSize,
      pembSquareFootage: data.squareFootage !== undefined ? data.squareFootage : state.pembSquareFootage,
      pembQuoteDate: data.quoteDate !== undefined ? data.quoteDate : state.pembQuoteDate,
      buildingSize: data.buildingSize || state.buildingSize,
      squareFootage: data.squareFootage
        ? parseFloat(data.squareFootage) || state.squareFootage
        : state.squareFootage,
    })),
  setPembExtractedDrawing: (pembExtractedDrawing) => set({ pembExtractedDrawing }),
  setPembExtractedShipper: (pembExtractedShipper) => set({ pembExtractedShipper }),
  setPembPdfFileName: (pembPdfFileName) => set({ pembPdfFileName }),
  setPembEstimateId: (pembEstimateId) => set({ pembEstimateId }),
  resetPembState: () =>
    set({
      pembLeadId: "",
      pembLeadName: "",
      pembEmail: "",
      pembStreet: "",
      pembCityStateZip: "",
      pembJobNumber: "",
      pembBuildingSize: "",
      pembSquareFootage: "",
      pembQuoteDate: "",
      pembExtractedDrawing: null,
      pembExtractedShipper: null,
      pembPdfFileName: "",
      pembEstimateId: null,
    }),

  // Storage Actions
  setStorageData: (storageData) => set({ storageData }),
  setStoragePricing: (storagePricing) => set({ storagePricing }),
  setStorageFileName: (storageFileName) => set({ storageFileName }),
  setStorageEstimateId: (storageEstimateId) => set({ storageEstimateId }),
  setStorageGlobalMarkup: (storageGlobalMarkup) => set({ storageGlobalMarkup }),
  setStorageShipping: (storageShipping) => set({ storageShipping }),
  setStorageDrawingsCost: (storageDrawingsCost) => set({ storageDrawingsCost }),
  setStorageCustomerLeadName: (storageCustomerLeadName) =>
    set({ storageCustomerLeadName }),
  setStorageCustomerAddress: (storageCustomerAddress) =>
    set({ storageCustomerAddress }),
  setStorageCustomerEmail: (storageCustomerEmail) =>
    set({ storageCustomerEmail }),
  setStorageJobNumber: (storageJobNumber) => set({ storageJobNumber }),
  setStorageDrawings: (storageDrawings) => set({ storageDrawings }),
  resetStorageState: () =>
    set({
      storageData: null,
      storagePricing: null,
      storageFileName: "",
      storageEstimateId: null,
      storageGlobalMarkup: 25,
      storageShipping: 12000,
      storageDrawingsCost: 0,
      storageCustomerLeadName: "",
      storageCustomerAddress: "",
      storageCustomerEmail: "",
      storageJobNumber: "",
      storageDrawings: [],
    }),

  // Concrete Actions
  setConcreteInclude: (concreteInclude) => set({ concreteInclude }),
  setConcreteCostSf: (concreteCostSf) => set({ concreteCostSf }),
  setConcreteMarginPct: (concreteMarginPct) => set({ concreteMarginPct }),
  setConcreteSlabThickness: (concreteSlabThickness) => set({ concreteSlabThickness }),
  setConcretePsiRating: (concretePsiRating) => set({ concretePsiRating }),
  setConcreteNotes: (concreteNotes) => set({ concreteNotes }),
  setConcreteInclusions: (concreteInclusions) => set({ concreteInclusions }),
  toggleConcreteInclusion: (item) =>
    set((state) => ({
      concreteInclusions: state.concreteInclusions.includes(item)
        ? state.concreteInclusions.filter((i) => i !== item)
        : [...state.concreteInclusions, item],
    })),
  resetConcreteSettings: () =>
    set({
      concreteInclude: true,
      concreteCostSf: 7.25,
      concreteMarginPct: 25,
      concreteSlabThickness: '6"',
      concretePsiRating: "4000 PSI",
      concreteNotes: "",
      concreteInclusions: [
        "Pier excavation & placement",
        "Reinforced rebar system (tied)",
        "10mm vapor barrier",
        'Smooth finish (±1/10" tolerance)',
        "All labor, equipment & materials",
      ],
    }),

  // Insulation Actions
  setInsulationInclude: (insulationInclude) => set({ insulationInclude }),
  setInsulationSystem: (insulationSystem) => set({ insulationSystem }),
  setInsulationRValueRoof: (insulationRValueRoof) => set({ insulationRValueRoof }),
  setInsulationRValueWalls: (insulationRValueWalls) => set({ insulationRValueWalls }),
  setInsulationCogsSf: (insulationCogsSf) => set({ insulationCogsSf }),
  setInsulationMarginPct: (insulationMarginPct) => set({ insulationMarginPct }),
  setInsulationNotes: (insulationNotes) => set({ insulationNotes }),
  setInsulationInclusions: (insulationInclusions) => set({ insulationInclusions }),
  toggleInsulationInclusion: (item) =>
    set((state) => ({
      insulationInclusions: state.insulationInclusions.includes(item)
        ? state.insulationInclusions.filter((i) => i !== item)
        : [...state.insulationInclusions, item],
    })),
  resetInsulationSettings: () =>
    set({
      insulationInclude: false,
      insulationSystem: "Vinyl-backed (single layer)",
      insulationRValueRoof: "R-19",
      insulationRValueWalls: "R-13",
      insulationCogsSf: 1.5,
      insulationMarginPct: 25,
      insulationNotes: "",
      insulationInclusions: [
        "Roof insulation",
        "Wall insulation",
        "Vapor retarder / facing",
        "All labor & installation",
        "Seam tape & fasteners",
      ],
    }),

  // Sales Tax Actions
  setTaxZip: (taxZip) => set({ taxZip }),
  setTaxRate: (taxRate) => set({ taxRate }),
  setIncludeTax: (includeTax) => set({ includeTax }),
  setIsTaxLoading: (isTaxLoading) => set({ isTaxLoading }),

  // COGS Actions
  setCogsOverrideApplied: (cogsOverrideApplied) => set({ cogsOverrideApplied }),
  setCogsCostInput: (cogsCostInput) => set({ cogsCostInput }),
  setCogsCostAdjustPercent: (cogsCostAdjustPercent) => set({ cogsCostAdjustPercent }),
  setCogsMaterialMargin: (cogsMaterialMargin) => set({ cogsMaterialMargin }),
  setCogsFixedSellPrice: (cogsFixedSellPrice) => set({ cogsFixedSellPrice }),
  resetCogsSettings: () =>
    set({
      cogsOverrideApplied: false,
      cogsCostInput: "",
      cogsCostAdjustPercent: 0,
      cogsMaterialMargin: 0,
      cogsFixedSellPrice: "",
    }),

  // Margin Actions
  setMarginOverrideApplied: (marginOverrideApplied) => set({ marginOverrideApplied }),
  setMarginLaborOverride: (marginLaborOverride) => set({ marginLaborOverride }),
  setMarginTargetMargin: (marginTargetMargin) => set({ marginTargetMargin }),
  setMarginFixedSellOverride: (marginFixedSellOverride) => set({ marginFixedSellOverride }),
  resetMarginSettings: () =>
    set({
      marginOverrideApplied: false,
      marginLaborOverride: "",
      marginTargetMargin: "",
      marginFixedSellOverride: "",
    }),
}));
