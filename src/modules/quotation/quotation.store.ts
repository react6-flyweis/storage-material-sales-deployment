import { create } from "zustand";

export interface QuotationState {
  // Shared fields between Sidebar and Quotation Views
  jobType: "PEMB" | "Storage";
  scope: "Supply" | "Install" | "Both";
  roofType: string;
  installCost: number;
  installSell: number;
  blendPercentage: number;

  // Actions
  setJobType: (jobType: "PEMB" | "Storage") => void;
  setScope: (scope: "Supply" | "Install" | "Both") => void;
  setRoofType: (roofType: string) => void;
  setInstallCost: (cost: number) => void;
  setInstallSell: (sell: number) => void;
  setBlendPercentage: (percentage: number) => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  jobType: "Storage",
  scope: "Install",
  roofType: "Screw-down",
  installCost: 5.5,
  installSell: 8.5,
  blendPercentage: 50,

  setJobType: (jobType) => set({ jobType }),
  setScope: (scope) => set({ scope }),
  setRoofType: (roofType) => set({ roofType }),
  setInstallCost: (installCost) => set({ installCost }),
  setInstallSell: (installSell) => set({ installSell }),
  setBlendPercentage: (blendPercentage) => set({ blendPercentage }),
}));
