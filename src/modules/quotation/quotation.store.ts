import { create } from "zustand";

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

  // Actions
  setJobType: (jobType: "PEMB" | "Storage") => void;
  setScope: (scope: "Supply" | "Install" | "Both") => void;
  setRoofType: (roofType: string) => void;
  setInstallCost: (cost: number) => void;
  setInstallSell: (sell: number) => void;
  setBlendPercentage: (percentage: number) => void;
  setInstallDifficulty: (installDifficulty: string) => void;
  setSquareFootage: (squareFootage: number) => void;

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
  scope: "Both",
  roofType: "screw-down",
  installCost: 5.85,
  installSell: 9.0,
  blendPercentage: 50,
  installDifficulty: "medium",
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
  cogsCostInput: "525000",
  cogsCostAdjustPercent: 0,
  cogsMaterialMargin: 20,
  cogsFixedSellPrice: "",

  // Margin Override initial state
  marginOverrideApplied: false,
  marginLaborOverride: "",
  marginTargetMargin: "",
  marginFixedSellOverride: "",

  // General Setters
  setJobType: (jobType) => set({ jobType }),
  setScope: (scope) => set({ scope }),
  setRoofType: (roofType) => set({ roofType }),
  setInstallCost: (installCost) => set({ installCost }),
  setInstallSell: (installSell) => set({ installSell }),
  setBlendPercentage: (blendPercentage) => set({ blendPercentage }),
  setInstallDifficulty: (installDifficulty) => set({ installDifficulty }),
  setSquareFootage: (squareFootage) => set({ squareFootage }),

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
      cogsCostInput: "525000",
      cogsCostAdjustPercent: 0,
      cogsMaterialMargin: 20,
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
