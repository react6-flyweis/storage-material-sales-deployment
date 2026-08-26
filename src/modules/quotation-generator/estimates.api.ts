import { apiClient } from "@/modules/auth/auth.api";

export interface ExtractDrawingRequest {
  fileBase64: string;
  fileName: string;
}

export interface ExtractedDrawingData {
  customer?: string;
  project?: string;
  jobnumber?: string;
  date?: string;
  width?: string;
  length?: string;
  eave?: string;
  eaveheight?: string;
  sqft?: string;
  sqfootage?: string;
  bay?: string;
  slope?: string;
  dead?: string;
  collateral?: string;
  live?: string;
  roofsnow?: string;
  snow?: string;
  wind?: string;
  exposure?: string;
  snowexp?: string;
  ipc?: string;
  risk?: string;
  siteclass?: string;
  seismiccat?: string;
  seismiczone?: string;
  seismic?: string;
  sd1?: string;
  s1?: string;
  thermal?: string;
  code?: string;
  windif?: string;
  snowif?: string;
  shearlong?: string;
  sheartrans?: string;
  deflcol?: string;
  frame?: string;
  roofpanel?: string;
  wall?: string;
  notes?: string;
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
  sf?: number;
  useManualSquareFootage?: boolean;
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
  cogsOverrideApplied?: boolean;
  marginOverrideApplied?: boolean;
  [key: string]: unknown;
}

export interface ExtractShipperResponseData {
  fileName: string;
  sheetCount: number;
  totalWeightLbs: number;
  squareFootage: number;
  tabSummary: ShipperTabSummary[];
  parsedCategories?: Record<string, unknown>;
  coverSheet?: {
    coverName?: string;
    labelMap?: Record<string, string>;
    preview?: string;
  };
  weightByCategory?: ShipperWeightByCategoryItem[];
  pricing?: ShipperPricing;
  fullQuote?: {
    grandTotal?: number;
    pricePerSf?: string | number;
    grandMargin?: number;
    [key: string]: unknown;
  } | null;
  note?: string;
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
      scope: "supply",
      roof: "screw-down",
      install: "easy",
      squareFootage: 0,
      sf: 0,
      useManualSquareFootage: false,
      blendPct: 50,
      installCostPerSf: 5.5,
      sellPerSf: 8.5,
      ...payload,
    }
  );
  return response.data;
}

export interface ComputeConcreteConfig {
  include: boolean;
  costSF?: number;
  marginPct?: number;
  thickness?: number | string;
  psi?: number | string;
  slabThickness?: string;
  psiRating?: string;
  sowItems?: string[];
  sowNotes?: string;
  [key: string]: unknown;
}

export interface ComputeInsulationConfig {
  include: boolean;
  system?: string;
  rRoof?: string;
  rWall?: string;
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
  costDollar?: number | null;
  marginPct?: number | null;
  sellDollar?: number | null;
  costPctAdj?: number | null;
  [key: string]: unknown;
}

export interface ComputeMarginOverrideConfig {
  applied: boolean;
  laborSF?: number | null;
  pct?: number | null;
  sellFixed?: number | null;
  [key: string]: unknown;
}

export interface ComputeEstimateRequest {
  parsedCategories?: Record<string, unknown>;
  jobType?: string;
  scope?: string;
  squareFootage?: number;
  sf?: number;
  useManualSquareFootage?: boolean;
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
  fullQuote?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ComputeEstimateResponse {
  success?: boolean;
  message?: string;
  data?: ComputeEstimateResponseData;
  weightByCategory?: ShipperWeightByCategoryItem[];
  pricing?: ShipperPricing;
  fullQuote?: Record<string, unknown>;
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

// ----------------------------------------------------------------------------
// SAVE ESTIMATE DRAFT / UPDATE
// ----------------------------------------------------------------------------
export interface SaveEstimatePayload extends Record<string, unknown> {
  _id?: string;
  jobType?: string;
  scope?: string;
  leadCompanyName?: string;
  customerEmail?: string;
  streetAddress?: string;
  cityStateZip?: string;
  buildingSize?: string;
  squareFootage?: number;
  sf?: number;
  useManualSquareFootage?: boolean;
  jobNumber?: string;
  sourceFileName?: string;
  parsedCategories?: Record<string, unknown>;
  tabSummary?: ShipperTabSummary[];
  pricingResult?: ShipperPricing;
  fullQuoteResult?: Record<string, unknown>;
  extractedDrawingFields?: ExtractedDrawingData;
  concreteAddon?: ComputeConcreteConfig;
  insulationAddon?: ComputeInsulationConfig;
  salesTax?: ComputeSalesTaxConfig;
  cogsOverride?: ComputeCogsOverrideConfig;
  marginOverride?: ComputeMarginOverrideConfig;
  storageData?: Record<string, unknown>;
  storagePricingResult?: Record<string, unknown>;
  status?: string;
}

export interface SaveEstimateResponse {
  success?: boolean;
  message?: string;
  data?: { estimate?: { _id: string } & SaveEstimatePayload; _id?: string };
  estimate?: { _id: string } & SaveEstimatePayload;
  _id?: string;
}

export async function saveEstimateProvider(
  payload: SaveEstimatePayload,
  estimateId?: string
): Promise<SaveEstimateResponse> {
  const targetId = estimateId || payload._id;
  const method = targetId ? "put" : "post";
  const url = targetId
    ? `/api/sales/estimates/${encodeURIComponent(targetId as string)}`
    : "/api/sales/estimates";

  const response = await apiClient.request<SaveEstimateResponse>({
    method,
    url,
    data: payload,
  });
  return response.data;
}

// ----------------------------------------------------------------------------
// ESTIMATES HISTORY & LIBRARY
// ----------------------------------------------------------------------------
export interface EstimatesListResponse {
  success?: boolean;
  message?: string;
  data?: SaveEstimatePayload[] | { estimates?: SaveEstimatePayload[]; items?: SaveEstimatePayload[] };
  estimates?: SaveEstimatePayload[];
  items?: SaveEstimatePayload[];
}

export async function getEstimatesListProvider(
  limit = 30
): Promise<EstimatesListResponse> {
  const response = await apiClient.get<EstimatesListResponse>(
    `/api/sales/estimates?limit=${limit}`
  );
  return response.data;
}

export async function getEstimateByIdProvider(
  id: string
): Promise<SaveEstimateResponse> {
  const response = await apiClient.get<SaveEstimateResponse>(
    `/api/sales/estimates/${encodeURIComponent(id)}`
  );
  return response.data;
}

export interface HistorySummaryResponse {
  success?: boolean;
  data?: {
    allTime?: { totalQuotes?: number; totalValue?: number; totalProfit?: number };
    totalQuotes?: number;
    totalValue?: number;
    totalProfit?: number;
  };
  allTime?: { totalQuotes?: number; totalValue?: number; totalProfit?: number };
}

export async function getHistorySummaryProvider(): Promise<HistorySummaryResponse> {
  const response = await apiClient.get<HistorySummaryResponse>(
    "/api/sales/estimates/history/summary"
  );
  return response.data;
}

// ----------------------------------------------------------------------------
// STORAGE COG EXTRACTION
// ----------------------------------------------------------------------------
export interface ExtractStorageCogRequest {
  fileBase64: string;
  fileName: string;
  salesTax?: ComputeSalesTaxConfig;
}

export interface ExtractStorageCogResponse {
  success?: boolean;
  message?: string;
  project?: {
    customer?: string;
    location?: string;
    date?: string;
    jobNumber?: string;
    [key: string]: unknown;
  };
  buildings?: Array<Record<string, unknown>>;
  doors?: Array<Record<string, unknown>>;
  extras?: Array<Record<string, unknown>>;
  shippingDefault?: number | Record<string, unknown>;
  format?: string;
  storagePricing?: Record<string, unknown>;
  summary?: {
    buildingCount?: number;
    totalSqft?: number;
    subtotalSell?: number;
    [key: string]: unknown;
  };
  data?: {
    project?: {
      customer?: string;
      location?: string;
      date?: string;
      jobNumber?: string;
      [key: string]: unknown;
    };
    buildings?: Array<Record<string, unknown>>;
    doors?: Array<Record<string, unknown>>;
    extras?: Array<Record<string, unknown>>;
    shippingDefault?: number | Record<string, unknown>;
    format?: string;
    storagePricing?: Record<string, unknown>;
    summary?: {
      buildingCount?: number;
      totalSqft?: number;
      subtotalSell?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function extractStorageCogProvider(
  payload: ExtractStorageCogRequest
): Promise<ExtractStorageCogResponse> {
  const response = await apiClient.post<ExtractStorageCogResponse>(
    "/api/sales/estimates/extract-storage-cog",
    payload
  );
  return response.data;
}

export interface ComputeStorageRequest {
  storageData?: Record<string, unknown>;
  concrete?: ComputeConcreteConfig;
  insulation?: ComputeInsulationConfig;
  salesTax?: ComputeSalesTaxConfig;
  [key: string]: unknown;
}

export interface StorageConcretePricing {
  include?: boolean;
  thickness?: number | null;
  psi?: number | null;
  costSF?: number;
  marginPct?: number;
  sellSF?: number;
  cost?: number;
  sell?: number;
  appliedSell?: number;
  profit?: number;
  sowItems?: string[];
  sowNotes?: string;
}

export interface StorageInsulationPricing {
  include?: boolean;
  system?: string;
  systemLabel?: string;
  rRoof?: string;
  rWall?: string;
  costSF?: number;
  marginPct?: number;
  sellSF?: number;
  cost?: number;
  sell?: number;
  appliedSell?: number;
  profit?: number;
}

export interface StorageSalesTaxPricing {
  rate?: number;
  amount?: number;
  taxableBase?: number;
  include?: boolean;
  note?: string;
}

export interface StorageBreakdownCategory {
  sell?: number;
  cogs?: number;
  profit?: number;
}

export interface StoragePricingBreakdown {
  buildings?: StorageBreakdownCategory;
  doors?: StorageBreakdownCategory;
  install?: StorageBreakdownCategory;
  concrete?: StorageBreakdownCategory;
  insulation?: StorageBreakdownCategory;
  extras?: StorageBreakdownCategory;
}

export interface StoragePricingSubtotal {
  materials?: number;
  passThrough?: number;
}

export interface StorageBuildingPricingItem {
  name?: string;
  width?: number;
  length?: number;
  loEave?: number;
  hiEave?: number;
  eaveHeight?: number;
  roofPitch?: string;
  slope?: string;
  sqft?: number;
  squareFootage?: number;
  psf?: number;
  cogs?: number;
  cost?: number;
  markup?: number;
  sellPrice?: number;
  roofType?: string;
  wallPanel?: string;
  roofPanel?: string;
  wallColor?: string;
  doors?: string;
  sell?: number;
  sfSell?: string;
}

export interface StorageDoorPricingItem {
  type?: string;
  size?: string;
  unitCost?: number;
  costPerUnit?: number;
  qty?: number;
  quantity?: number;
  count?: number;
  cogs?: number;
  totalCost?: number;
  markup?: number;
  sale?: number;
  sellPerUnit?: number;
  totalSell?: number;
  color?: string;
  sell?: number;
}

export interface StoragePricingResult {
  buildings?: StorageBuildingPricingItem[];
  doors?: StorageDoorPricingItem[];
  extras?: Array<Record<string, unknown>>;
  totalSqft?: number;
  totalSqFt?: number;
  squareFootage?: number;
  buildingSell?: number;
  buildingCogs?: number;
  buildingsSubtotal?: number;
  doorSell?: number;
  doorCogs?: number;
  doorsSubtotal?: number;
  extrasSell?: number;
  extrasCogs?: number;
  extrasSubtotal?: number;
  shipping?: number;
  freight?: number;
  drawings?: number;
  installSell?: number;
  installCost?: number;
  installSellPerSf?: number;
  installCostPerSf?: number;
  labor?: number;
  concrete?: StorageConcretePricing;
  insulation?: StorageInsulationPricing;
  salesTax?: StorageSalesTaxPricing;
  grandTotal?: number;
  pricePerSf?: string | number;
  profit?: number;
  totalCogs?: number;
  marginPercent?: number;
  breakdown?: StoragePricingBreakdown;
  subtotal?: StoragePricingSubtotal;
}

export interface ComputeStorageResponse {
  success?: boolean;
  message?: string;
  data?: { storagePricing?: StoragePricingResult };
  storagePricing?: StoragePricingResult;
}

export async function computeStorageProvider(
  payload: ComputeStorageRequest
): Promise<ComputeStorageResponse> {
  const response = await apiClient.post<ComputeStorageResponse>(
    "/api/sales/estimates/compute-storage",
    payload
  );
  return response.data;
}

// ----------------------------------------------------------------------------
// DOCUMENT PREVIEW & PDF DOWNLOAD
// ----------------------------------------------------------------------------
export interface PreviewDocumentRequest {
  leadCompanyName?: string;
  customerEmail?: string;
  streetAddress?: string;
  cityStateZip?: string;
  buildingSize?: string;
  squareFootage?: number;
  jobNumber?: string;
  jobType?: string;
  pricingResult?: ShipperPricing;
  fullQuote?: Record<string, unknown>;
  extractedDrawingFields?: ExtractedDrawingData;
  drawingAttachments?: Array<{ name?: string; fileBase64?: string; includeInQuote?: boolean;[key: string]: unknown }>;
  sections?: string[];
  storageData?: Record<string, unknown>;
  storagePricingResult?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PreviewDocumentResponse {
  success?: boolean;
  message?: string;
  data?: { assembledHtml?: string; quoteHtml?: string };
  assembledHtml?: string;
  quoteHtml?: string;
}

export async function previewDocumentProvider(
  payload: PreviewDocumentRequest
): Promise<PreviewDocumentResponse> {
  const response = await apiClient.post<PreviewDocumentResponse>(
    "/api/sales/estimates/documents/preview",
    payload
  );
  return response.data;
}

export interface DownloadPdfResponse {
  success?: boolean;
  message?: string;
  data?: { fileBase64?: string; mimeType?: string; fileName?: string };
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
}

export async function downloadPdfProvider(
  payload: PreviewDocumentRequest,
  estimateId?: string
): Promise<DownloadPdfResponse> {
  const url = estimateId
    ? `/api/sales/estimates/${encodeURIComponent(estimateId)}/documents/pdf`
    : "/api/sales/estimates/documents/pdf";

  const response = await apiClient.post<DownloadPdfResponse>(url, payload);
  return response.data;
}

// ----------------------------------------------------------------------------
// COGS & MARGIN PREVIEW HELPERS
// ----------------------------------------------------------------------------
export interface PreviewCogsRequest {
  pricingResult?: ShipperPricing;
  cogsOverride?: ComputeCogsOverrideConfig;
}

export interface PreviewCogsData {
  preview?: {
    fromShipper?: {
      cost?: number;
      sell?: number;
      margin?: number;
      sf?: number;
    };
    adjusted?: {
      cost?: number;
      sell?: number;
      matMargin?: number;
      grandSell?: number;
      grandCost?: number;
      profit?: number;
      totalMargin?: number;
      sfPrice?: string | number;
      costDiff?: number;
      sellDiff?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

export interface PreviewCogsResponse {
  success?: boolean;
  message?: string;
  data?: PreviewCogsData;
  preview?: PreviewCogsData["preview"];
}

export async function previewCogsProvider(
  payload: PreviewCogsRequest
): Promise<PreviewCogsResponse> {
  const response = await apiClient.post<PreviewCogsResponse>(
    "/api/sales/estimates/cogs/preview",
    payload
  );
  return response.data;
}

export interface PreviewMarginRequest {
  pricingResult?: ShipperPricing;
  marginOverride?: ComputeMarginOverrideConfig;
}

export interface PreviewMarginResponse {
  success?: boolean;
  data?: { preview?: { adjusted?: { totSell?: number; sfPrice?: number; totCost?: number; profit?: number; profPct?: number }; originalSell?: number } };
  preview?: { adjusted?: { totSell?: number; sfPrice?: number; totCost?: number; profit?: number; profPct?: number }; originalSell?: number };
}

export async function previewMarginProvider(
  payload: PreviewMarginRequest
): Promise<PreviewMarginResponse> {
  const response = await apiClient.post<PreviewMarginResponse>(
    "/api/sales/estimates/margin/preview",
    payload
  );
  return response.data;
}
