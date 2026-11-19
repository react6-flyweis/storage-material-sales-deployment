export type TourId = "sales-pipeline" | "leads-deep-dive" | "quotation-deep-dive";

export interface TourStepBranchConfig {
  tourId: TourId;
  label: string;
  description?: string;
  resumeStepIndex?: number;
}

export interface TourStepConfig {
  id: string;
  route: string;
  element: string;
  title: string;
  description: string;
  speechText?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  branch?: TourStepBranchConfig;
}

export interface TourDefinition {
  id: TourId;
  name: string;
  description: string;
  estimatedMinutes: number;
  steps: TourStepConfig[];
}
