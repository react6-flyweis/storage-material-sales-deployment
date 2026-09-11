import { apiClient } from "@/modules/auth/auth.api";

export interface SteelRatesPerLb {
  primaryFrames: number;
  secondarySteel: number;
  hssBeams: number;
  angles: number;
  openingsJambs: number;
  platesClips: number;
}

export interface SheetingRatesPerSf {
  standardScrewDown: number;
  standingSeam: number;
}

export interface FreightRules {
  ratePerLb: number;
  lbsPerTruck: number;
  accessoriesAllowancePerSf: number;
  vendorDeltaPerLb: number;
}

export interface MarkupRules {
  pembMultiplier: number;
  storageMultiplier: number;
}

export interface InstallRateItem {
  cost: number;
  sell: number;
}

export interface InstallRules {
  pembEasy: InstallRateItem;
  pembMedium: InstallRateItem;
  pembHard: InstallRateItem;
  pembTallHard: InstallRateItem;
  storageBasic: InstallRateItem;
  storageTall: InstallRateItem;
  storageOverhang: InstallRateItem;
}

export type CustomRuleMatchType = "tab_name" | "part_number" | "description";
export type CustomRuleMethod =
  | "per_lb"
  | "per_lf"
  | "per_sf"
  | "flat_each"
  | "flat_total";

export interface CustomTabRule {
  id?: string;
  matchType: CustomRuleMatchType;
  match: string;
  cat: string;
  method: CustomRuleMethod;
  rate: number;
  note?: string;
}

export interface PricingRulesData {
  steelRatesPerLb?: SteelRatesPerLb;
  sheetingRatesPerSf?: SheetingRatesPerSf;
  freight?: FreightRules;
  markup?: MarkupRules;
  install?: InstallRules;
  customTabRules?: CustomTabRule[];
}

export interface PricingRulesResponse {
  success?: boolean;
  message?: string;
  data?: {
    pricingRules?: PricingRulesData;
  } & PricingRulesData;
}

export async function getPricingRulesProvider(): Promise<PricingRulesData> {
  const response = await apiClient.get<Record<string, unknown>>(
    "/api/sales/pricing-rules"
  );
  const resData = response.data as Record<string, unknown>;
  const dataObject = resData?.data as Record<string, unknown> | undefined;

  if (dataObject?.pricingRules) {
    return dataObject.pricingRules as PricingRulesData;
  }
  if (resData?.pricingRules) {
    return resData.pricingRules as PricingRulesData;
  }
  if (resData?.data) {
    return resData.data as PricingRulesData;
  }
  return (resData as PricingRulesData) || {};
}

export async function updatePricingRulesProvider(
  payload: PricingRulesData
): Promise<PricingRulesResponse> {
  const response = await apiClient.put<PricingRulesResponse>(
    "/api/sales/pricing-rules",
    payload
  );
  return response.data;
}
