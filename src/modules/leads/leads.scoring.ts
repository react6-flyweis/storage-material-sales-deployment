import type { LeadScoreBreakdown } from "./leads.api";

export type LeadScoreBreakdownItem = {
  label: string;
  value: number;
  max: number;
  hint: string;
};

export const LEAD_SCORE_BREAKDOWN_CONFIG = [
  {
    key: "projectSize",
    label: "Project Size",
    max: 25,
    hint: "Building scope and fit for your target segment",
  },
  {
    key: "budgetSignals",
    label: "Budget Signals",
    max: 25,
    hint: "Budget confidence based on conversations",
  },
  {
    key: "timeline",
    label: "Timeline",
    max: 20,
    hint: "Urgency and readiness to move forward",
  },
  {
    key: "decisionMaker",
    label: "Decision Maker",
    max: 15,
    hint: "Access to final buyer or key stakeholder",
  },
  {
    key: "projectClarity",
    label: "Project Clarity",
    max: 15,
    hint: "How specific the project details are",
  },
] as const;

export const buildLeadScoreBreakdown = (
  scoreBreakdown?: LeadScoreBreakdown,
): LeadScoreBreakdownItem[] =>
  LEAD_SCORE_BREAKDOWN_CONFIG.map((item) => ({
    label: item.label,
    value: scoreBreakdown?.[item.key]?.points ?? 0,
    max: item.max,
    hint: scoreBreakdown?.[item.key]?.reason ?? item.hint,
  }));

export const getLeadScoreFillColorClass = (score: number) => {
  if (score < 30) return "bg-blue-500";
  if (score < 50) return "bg-green-500";
  if (score < 80) return "bg-amber-500";
  return "bg-red-500";
};

export const getLeadScoreTextColorClass = (score: number) => {
  if (score < 30) return "text-blue-700";
  if (score < 50) return "text-green-700";
  if (score < 80) return "text-amber-700";
  return "text-red-700";
};

export const getLeadScoreTag = (score: number) => {
  if (score < 30) return "COLD";
  if (score < 50) return "GOOD";
  if (score < 80) return "WARM";
  return "HOT";
};
