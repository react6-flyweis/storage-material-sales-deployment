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
  ownerId?: string;
  steelRatesPerLb?: SteelRatesPerLb;
  sheetingRatesPerSf?: SheetingRatesPerSf;
  freight?: FreightRules;
  markup?: MarkupRules;
  install?: InstallRules;
  customTabRules?: CustomTabRule[];
  // Flat v7 rate fields
  primary?: number;
  secondary?: number;
  hss?: number;
  angle?: number;
  opening?: number;
  plate?: number;
  sheet?: number;
  ss?: number;
  truck?: number;
  pembMu?: number;
  storMu?: number;
  bdCost?: number;
  bdSell?: number;
  ndCost?: number;
  ndSell?: number;
  cfCost?: number;
  cfSell?: number;
  redIron?: number;
  galvSteel?: number;
  mandoor?: number;
  screwEach?: number;
  [key: string]: unknown;
}

export interface PricingRulesResponse {
  success?: boolean;
  message?: string;
  data?: {
    pricingRules?: PricingRulesData;
  } & PricingRulesData;
  pricingRules?: PricingRulesData;
}

export function normalizePricingRules(raw: unknown): PricingRulesData {
  if (!raw || typeof raw !== "object") return {};
  const rec = raw as Record<string, unknown>;
  const base = (rec.pricingRules || rec.data || rec) as Record<string, unknown>;
  const rules = (base.pricingRules || base) as Record<string, unknown>;

  const steelRatesPerLb: SteelRatesPerLb = {
    primaryFrames: Number(
      rules.primary ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)
          ?.primaryFrames ??
        1.71
    ),
    secondarySteel: Number(
      rules.secondary ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)
          ?.secondarySteel ??
        1.45
    ),
    hssBeams: Number(
      rules.hss ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)
          ?.hssBeams ??
        1.65
    ),
    angles: Number(
      rules.angle ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)?.angles ??
        1.55
    ),
    openingsJambs: Number(
      rules.opening ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)
          ?.openingsJambs ??
        1.6
    ),
    platesClips: Number(
      rules.plate ??
        (rules.steelRatesPerLb as Record<string, unknown> | undefined)
          ?.platesClips ??
        1.7
    ),
  };

  const sheetingRatesPerSf: SheetingRatesPerSf = {
    standardScrewDown: Number(
      rules.sheet ??
        (rules.sheetingRatesPerSf as Record<string, unknown> | undefined)
          ?.standardScrewDown ??
        1.45
    ),
    standingSeam: Number(
      rules.ss ??
        (rules.sheetingRatesPerSf as Record<string, unknown> | undefined)
          ?.standingSeam ??
        1.85
    ),
  };

  const freightVal =
    rules.freight && typeof rules.freight === "object"
      ? (rules.freight as Record<string, unknown>)
      : null;
  const freight: FreightRules = {
    ratePerLb: Number(
      (typeof rules.freight === "number" ? rules.freight : freightVal?.ratePerLb) ??
        0.13
    ),
    lbsPerTruck: Number(rules.truck ?? freightVal?.lbsPerTruck ?? 45000),
    accessoriesAllowancePerSf: Number(
      freightVal?.accessoriesAllowancePerSf ?? 0.05
    ),
    vendorDeltaPerLb: Number(freightVal?.vendorDeltaPerLb ?? 0.03),
  };

  const markupVal =
    rules.markup && typeof rules.markup === "object"
      ? (rules.markup as Record<string, unknown>)
      : null;
  const markup: MarkupRules = {
    pembMultiplier: Number(rules.pembMu ?? markupVal?.pembMultiplier ?? 1.3),
    storageMultiplier: Number(
      rules.storMu ?? markupVal?.storageMultiplier ?? 1.25
    ),
  };

  const installVal =
    rules.install && typeof rules.install === "object"
      ? (rules.install as Record<string, unknown>)
      : null;
  const pembEasyVal = installVal?.pembEasy as Record<string, unknown> | undefined;
  const pembMedVal = installVal?.pembMedium as Record<string, unknown> | undefined;
  const pembHardVal = installVal?.pembHard as Record<string, unknown> | undefined;
  const pembTallHardVal = installVal?.pembTallHard as Record<string, unknown> | undefined;
  const storBasicVal = installVal?.storageBasic as Record<string, unknown> | undefined;
  const storTallVal = installVal?.storageTall as Record<string, unknown> | undefined;
  const storOverVal = installVal?.storageOverhang as Record<string, unknown> | undefined;

  const install: InstallRules = {
    pembEasy: {
      cost: Number(rules.bdCost ?? pembEasyVal?.cost ?? 4.5),
      sell: Number(rules.bdSell ?? pembEasyVal?.sell ?? 6.5),
    },
    pembMedium: {
      cost: Number(rules.ndCost ?? pembMedVal?.cost ?? 5.0),
      sell: Number(rules.ndSell ?? pembMedVal?.sell ?? 7.2),
    },
    pembHard: {
      cost: Number(rules.cfCost ?? pembHardVal?.cost ?? 5.5),
      sell: Number(rules.cfSell ?? pembHardVal?.sell ?? 8.0),
    },
    pembTallHard: {
      cost: Number(pembTallHardVal?.cost ?? 6.0),
      sell: Number(pembTallHardVal?.sell ?? 9.0),
    },
    storageBasic: {
      cost: Number(rules.bdCost ?? storBasicVal?.cost ?? 4.5),
      sell: Number(rules.bdSell ?? storBasicVal?.sell ?? 6.5),
    },
    storageTall: {
      cost: Number(rules.cfCost ?? storTallVal?.cost ?? 5.5),
      sell: Number(rules.cfSell ?? storTallVal?.sell ?? 8.0),
    },
    storageOverhang: {
      cost: Number(storOverVal?.cost ?? 5.0),
      sell: Number(storOverVal?.sell ?? 7.5),
    },
  };

  const customTabRules = Array.isArray(rules.customTabRules)
    ? (rules.customTabRules as CustomTabRule[])
    : [];

  return {
    ...rules,
    steelRatesPerLb,
    sheetingRatesPerSf,
    freight,
    markup,
    install,
    customTabRules,
    primary: steelRatesPerLb.primaryFrames,
    secondary: steelRatesPerLb.secondarySteel,
    hss: steelRatesPerLb.hssBeams,
    angle: steelRatesPerLb.angles,
    opening: steelRatesPerLb.openingsJambs,
    plate: steelRatesPerLb.platesClips,
    sheet: sheetingRatesPerSf.standardScrewDown,
    ss: sheetingRatesPerSf.standingSeam,
    truck: freight.lbsPerTruck,
    pembMu: markup.pembMultiplier,
    storMu: markup.storageMultiplier,
    bdCost: install.pembEasy.cost,
    bdSell: install.pembEasy.sell,
    ndCost: install.pembMedium.cost,
    ndSell: install.pembMedium.sell,
    cfCost: install.pembHard.cost,
    cfSell: install.pembHard.sell,
    redIron: Number(rules.redIron ?? 0.05),
    galvSteel: Number(rules.galvSteel ?? 0.1),
    mandoor: Number(rules.mandoor ?? 1200),
    screwEach: Number(rules.screwEach ?? 0.15),
  };
}

export function flattenPricingRules(data: Partial<PricingRulesData>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  if (data.steelRatesPerLb) {
    result.primary = data.steelRatesPerLb.primaryFrames;
    result.secondary = data.steelRatesPerLb.secondarySteel;
    result.hss = data.steelRatesPerLb.hssBeams;
    result.angle = data.steelRatesPerLb.angles;
    result.opening = data.steelRatesPerLb.openingsJambs;
    result.plate = data.steelRatesPerLb.platesClips;
  }
  if (data.sheetingRatesPerSf) {
    result.sheet = data.sheetingRatesPerSf.standardScrewDown;
    result.ss = data.sheetingRatesPerSf.standingSeam;
  }
  if (data.freight) {
    result.freight = data.freight.ratePerLb;
    result.truck = data.freight.lbsPerTruck;
  }
  if (data.markup) {
    result.pembMu = data.markup.pembMultiplier;
    result.storMu = data.markup.storageMultiplier;
  }
  if (data.install) {
    result.bdCost = data.install.pembEasy?.cost;
    result.bdSell = data.install.pembEasy?.sell;
    result.ndCost = data.install.pembMedium?.cost;
    result.ndSell = data.install.pembMedium?.sell;
    result.cfCost = data.install.pembHard?.cost;
    result.cfSell = data.install.pembHard?.sell;
  }
  return result;
}

export async function getPricingRulesProvider(): Promise<PricingRulesData> {
  const response = await apiClient.get<Record<string, unknown>>(
    "/api/sales/pricing-rules"
  );
  return normalizePricingRules(response.data);
}

export async function updatePricingRulesProvider(
  payload: PricingRulesData
): Promise<PricingRulesResponse> {
  const flatPayload = flattenPricingRules(payload);
  const response = await apiClient.put<PricingRulesResponse>(
    "/api/sales/pricing-rules",
    flatPayload
  );
  return response.data;
}
