import { apiClient } from "@/modules/auth/auth.api";

export interface ExtractDrawingRequest {
  fileBase64: string;
  fileName: string;
}

export interface ExtractedDrawingData {
  customer?: string;
  project?: string;
  jobnumber?: string;
  width?: string;
  length?: string;
  eave?: string;
  sqft?: string;
  snow?: string;
  wind?: string;
  exposure?: string;
  slope?: string;
  dead?: string;
  collateral?: string;
  [key: string]: string | undefined;
}

export interface ExtractDrawingResponseData {
  fileName: string;
  textItemCount: number;
  filledCount: number;
  extracted: ExtractedDrawingData;
  rawTextPreview: string;
  note?: string;
}

export interface ExtractDrawingResponse {
  success: boolean;
  message?: string;
  data: ExtractDrawingResponseData;
}

export async function extractDrawingProvider(
  payload: ExtractDrawingRequest
): Promise<ExtractDrawingResponse> {
  const response = await apiClient.post<ExtractDrawingResponse>(
    "/api/sales/estimates/extract-drawing",
    payload
  );
  return response.data;
}

export interface ExtractShipperRequest {
  fileBase64: string;
  fileName: string;
  jobType?: string;
  scope?: "supply" | "install" | "both" | string;
  roof?: "screw-down" | "standing-seam" | string;
  install?: string;
  squareFootage?: number;
  blendPct?: number;
  installCostPerSf?: number;
  sellPerSf?: number;
}

export interface ShipperTabSummary {
  sheetName: string;
  category: string;
  weightLbs: number;
}

export interface ShipperWeightByCategoryItem {
  category: string;
  weightLbs: number;
  rate?: number;
  price?: number;
}

export interface ShipperPricingRow {
  cat: string;
  label: string;
  wt: number;
  rate: string | number;
  price: number;
  tag?: string;
  notes?: string;
}

export interface ShipperPricing {
  rows?: ShipperPricingRow[];
  matCost?: number;
  totWt?: number;
  freight?: number;
  trucks?: number;
  instCost?: number;
  instSell?: number;
  totCost?: number;
  matSell?: number;
  totSell?: number;
  profit?: number;
  profPct?: string | number;
  sfPrice?: string | number;
  blendLabel?: string;
  vendorBlendSavings?: number;
  [key: string]: unknown;
}

export interface ExtractShipperResponseData {
  fileName: string;
  sheetCount: number;
  totalWeightLbs: number;
  squareFootage: number;
  tabSummary: ShipperTabSummary[];
  parsedCategories?: Record<string, { weight: number; [key: string]: unknown }>;
  coverSheet?: {
    coverName?: string;
    labelMap?: Record<string, string>;
  };
  weightByCategory?: ShipperWeightByCategoryItem[];
  pricing?: ShipperPricing;
}

export interface ExtractShipperResponse {
  success: boolean;
  message?: string;
  data: ExtractShipperResponseData;
}

export async function extractShipperProvider(
  payload: ExtractShipperRequest
): Promise<ExtractShipperResponse> {
  const response = await apiClient.post<ExtractShipperResponse>(
    "/api/sales/estimates/extract-shipper",
    {
      jobType: "PEMB",
      scope: "both",
      roof: "screw-down",
      install: "medium",
      squareFootage: 0,
      blendPct: 50,
      installCostPerSf: 5.85,
      sellPerSf: 9.0,
      ...payload,
    }
  );
  return response.data;
}

export interface ComputeConcreteConfig {
  include: boolean;
  costSF?: number;
  marginPct?: number;
  slabThickness?: string;
  psiRating?: string;
  [key: string]: unknown;
}

export interface ComputeInsulationConfig {
  include: boolean;
  system?: string;
  rValueRoof?: string;
  rValueWalls?: string;
  costSF?: number;
  cogsSF?: number;
  marginPct?: number;
  [key: string]: unknown;
}

export interface ComputeSalesTaxConfig {
  rate: number;
  include: boolean;
  zip?: string;
  [key: string]: unknown;
}

export interface ComputeCogsOverrideConfig {
  applied: boolean;
  costInput?: number;
  costAdjustPercent?: number;
  materialMargin?: number;
  fixedSellPrice?: number;
  [key: string]: unknown;
}

export interface ComputeMarginOverrideConfig {
  applied: boolean;
  laborOverride?: number;
  targetMargin?: number;
  fixedSellOverride?: number;
  [key: string]: unknown;
}

export interface ComputeEstimateRequest {
  parsedCategories?: Record<string, unknown>;
  jobType?: string;
  scope?: string;
  squareFootage?: number;
  blendPct?: number;
  roof?: string;
  install?: string;
  installCostPerSf?: number;
  sellPerSf?: number;
  concrete?: ComputeConcreteConfig;
  insulation?: ComputeInsulationConfig;
  salesTax?: ComputeSalesTaxConfig;
  cogsOverride?: ComputeCogsOverrideConfig;
  marginOverride?: ComputeMarginOverrideConfig;
  [key: string]: unknown;
}

export interface ComputeEstimateResponseData {
  weightByCategory?: ShipperWeightByCategoryItem[];
  pricing?: ShipperPricing;
  [key: string]: unknown;
}

export interface ComputeEstimateResponse {
  success?: boolean;
  message?: string;
  data?: ComputeEstimateResponseData;
  weightByCategory?: ShipperWeightByCategoryItem[];
  pricing?: ShipperPricing;
}

export async function computeEstimateProvider(
  payload: ComputeEstimateRequest
): Promise<ComputeEstimateResponse> {
  const response = await apiClient.post<ComputeEstimateResponse>(
    "/api/sales/estimates/compute",
    payload
  );
  return response.data;
}

export interface TaxLookupResponseData {
  zip?: string;
  rate?: number;
  taxRate?: number;
  state?: string;
  city?: string;
  [key: string]: unknown;
}

export interface TaxLookupResponse {
  success?: boolean;
  message?: string;
  rate?: number;
  data?: TaxLookupResponseData | number;
  [key: string]: unknown;
}

export async function taxLookupProvider(
  zip: string
): Promise<TaxLookupResponse> {
  const response = await apiClient.get<TaxLookupResponse>(
    `/api/sales/estimates/tax-lookup/${encodeURIComponent(zip.trim())}`
  );
  return response.data;
}
