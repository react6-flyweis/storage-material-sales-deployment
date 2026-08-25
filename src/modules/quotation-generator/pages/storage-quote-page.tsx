import { useState, useTransition, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import {
  ArrowLeft,
  FileSpreadsheet,
  Building2,
  DoorOpen,
  DollarSign,
  TrendingUp,
  Layers,
  Wrench,
  Loader2,
  User,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsLookupQuery, useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import {
  extractStorageCogProvider,
  computeStorageProvider,
  saveEstimateProvider,
  taxLookupProvider,
  type SaveEstimatePayload,
} from "../estimates.api";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import {
  StoragePreviewDocument,
  type StorageData,
  type StoragePricing,
  type StorageBuildingItem,
  type StorageDoorItem,
  type StorageExtraItem,
} from "../components/storage-preview-document";
import { StorageSowPreviewDocument } from "../components/storage-sow-preview-document";
import { ContractPreviewDocument } from "../components/contract-preview-document";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
  });
}

function fmt(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + Math.round(num).toLocaleString();
}

function fmtDec(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + num.toFixed(2);
}

export default function StorageQuotePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, startTransition] = useTransition();

  const navState = useMemo(
    () =>
      (location.state || {}) as {
        storageData?: StorageData;
        storagePricing?: StoragePricing;
        estimateId?: string;
        sourceFileName?: string;
        customerLeadName?: string;
        customerAddress?: string;
        customerEmail?: string;
        jobNumber?: string;
      },
    [location.state]
  );

  const {
    scope,
    buildingSize: storeBuildingSize,
    setBuildingSize,
    squareFootage: storeSquareFootage,
    setSquareFootage,
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
    concreteInclude,
    setConcreteInclude,
    concreteCostSf,
    setConcreteCostSf,
    concreteMarginPct,
    setConcreteMarginPct,
    insulationInclude,
    setInsulationInclude,
    insulationCogsSf,
    setInsulationCogsSf,
    insulationMarginPct,
    setInsulationMarginPct,
    taxZip,
    setTaxZip,
    taxRate,
    setTaxRate,
    includeTax,
    setIncludeTax,
    storageData: storeStorageData,
    setStorageData,
    storagePricing: storeStoragePricing,
    setStoragePricing,
    storageFileName: storeStorageFileName,
    setStorageFileName,
    storageEstimateId: storeStorageEstimateId,
    setStorageEstimateId,
    storageGlobalMarkup: storeGlobalMarkup,
    setStorageGlobalMarkup,
    storageShipping: storeShipping,
    setStorageShipping,
    storageDrawingsCost: storeDrawingsCost,
    setStorageDrawingsCost,
    storageCustomerLeadName: storeCustomerLeadName,
    setStorageCustomerLeadName,
    storageCustomerAddress: storeCustomerAddress,
    setStorageCustomerAddress,
    storageCustomerEmail: storeCustomerEmail,
    setStorageCustomerEmail,
    storageJobNumber: storeJobNumber,
    setStorageJobNumber,
    storageDrawings,
    setStorageDrawings,
    concreteSlabThickness,
    setConcreteSlabThickness,
    concretePsiRating,
    setConcretePsiRating,
    concreteNotes,
    setConcreteNotes,
    insulationSystem,
    setInsulationSystem,
    insulationRValueRoof,
    setInsulationRValueRoof,
    insulationRValueWalls,
    setInsulationRValueWalls,
  } = useQuotationStore();

  const storageData = (storeStorageData as StorageData | null) || navState.storageData || null;
  const storagePricing = (storeStoragePricing as StoragePricing | null) || navState.storagePricing || null;
  const estimateId = storeStorageEstimateId || navState.estimateId || null;
  const sourceFileName = storeStorageFileName || navState.sourceFileName || "";
  const globalMarkup = storeGlobalMarkup ?? 25;
  const shippingVal = storeShipping ?? 12000;
  const drawingsVal = storeDrawingsCost ?? 0;
  const customerLeadName = storeCustomerLeadName || navState.customerLeadName || storageData?.project?.customer || "";
  const customerAddress = storeCustomerAddress || navState.customerAddress || storageData?.project?.location || "";
  const customerEmail = storeCustomerEmail || navState.customerEmail || "";
  const jobNumber = storeJobNumber || navState.jobNumber || storageData?.project?.jobNumber || "";

  useEffect(() => {
    if (navState.storageData && !storeStorageData) setStorageData(navState.storageData as Record<string, unknown>);
    if (navState.storagePricing && !storeStoragePricing) setStoragePricing(navState.storagePricing as Record<string, unknown>);
    if (navState.estimateId && !storeStorageEstimateId) setStorageEstimateId(navState.estimateId);
    if (navState.sourceFileName && !storeStorageFileName) setStorageFileName(navState.sourceFileName);
    if (navState.customerLeadName && !storeCustomerLeadName) setStorageCustomerLeadName(navState.customerLeadName);
    if (navState.customerAddress && !storeCustomerAddress) setStorageCustomerAddress(navState.customerAddress);
    if (navState.customerEmail && !storeCustomerEmail) setStorageCustomerEmail(navState.customerEmail);
    if (navState.jobNumber && !storeJobNumber) setStorageJobNumber(navState.jobNumber);
  }, [navState, storeStorageData, storeStoragePricing, storeStorageEstimateId, storeStorageFileName, storeCustomerLeadName, storeCustomerAddress, storeCustomerEmail, storeJobNumber, setStorageData, setStoragePricing, setStorageEstimateId, setStorageFileName, setStorageCustomerLeadName, setStorageCustomerAddress, setStorageCustomerEmail, setStorageJobNumber]);

  const setGlobalMarkup = setStorageGlobalMarkup;
  const setShippingVal = setStorageShipping;
  const setDrawingsVal = setStorageDrawingsCost;
  const setCustomerLeadName = setStorageCustomerLeadName;
  const setCustomerAddress = setStorageCustomerAddress;
  const setCustomerEmail = setStorageCustomerEmail;
  const setJobNumber = setStorageJobNumber;
  const setConcreteThickness = (v: 4 | 6) => setConcreteSlabThickness(v === 4 ? '4"' : '6"');
  const concreteThickness: 4 | 6 = concreteSlabThickness === '4"' ? 4 : 6;
  const concretePsi = concretePsiRating;
  const setConcretePsi = setConcretePsiRating;
  const setSourceFileName = setStorageFileName;
  const insulationRoofR = insulationRValueRoof || "R-19";
  const setInsulationRoofR = setInsulationRValueRoof;
  const insulationWallR = insulationRValueWalls || "R-13";
  const setInsulationWallR = setInsulationRValueWalls;

  const [searchParams] = useSearchParams();
  const initialLeadId =
    searchParams.get("lead") ||
    searchParams.get("leadId") ||
    (location.state as { leadId?: string })?.leadId ||
    "";
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId);

  // Fetch leads lookup list
  const { data: leadsLookupData, isLoading: isLeadsLoading } = useLeadsLookupQuery(undefined, 1, 100);
  const leads = useMemo(() => leadsLookupData?.data?.leads || (Array.isArray(leadsLookupData?.data) ? leadsLookupData.data : []), [leadsLookupData]);
  const activeLeadId = selectedLeadId || leads[0]?._id || "";

  // Fetch detailed info for selected lead
  const { data: leadDetailData, isLoading: isDetailLoading } = useLeadDetailQuery(
    activeLeadId,
    Boolean(activeLeadId)
  );

  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lookupItem = leads.find((l) => l._id === leadId);
    if (lookupItem) {
      const name =
        getLeadProjectName(lookupItem, lookupItem.customerId) ||
        `${lookupItem.customerId?.firstName || ""} ${lookupItem.customerId?.lastName || ""}`.trim() ||
        lookupItem.projectName ||
        "";
      if (name) setCustomerLeadName(name);
      if (lookupItem.customerId?.email) setCustomerEmail(lookupItem.customerId.email);
      if (lookupItem.location) setCustomerAddress(lookupItem.location);
      if (lookupItem.jobId) setJobNumber(lookupItem.jobId);

      let bSize = lookupItem.buildingType || "";
      if (lookupItem.width && lookupItem.length && lookupItem.height) {
        bSize = `${lookupItem.width}x${lookupItem.length}x${lookupItem.height}`;
      } else if (lookupItem.width && lookupItem.length) {
        bSize = `${lookupItem.width}x${lookupItem.length}`;
      }
      if (bSize) setBuildingSize(bSize);

      let sqft = Number(lookupItem.sqft) || 0;
      if (!sqft && lookupItem.width && lookupItem.length) {
        sqft = Number(lookupItem.width) * Number(lookupItem.length);
      }
      if (!sqft && bSize) {
        const match = bSize.toLowerCase().match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
        if (match) sqft = parseFloat(match[1]) * parseFloat(match[2]);
      }
      if (sqft > 0) setSquareFootage(sqft);
    }
  };

  // Update customer fields when lead detail query resolves
  useEffect(() => {
    if (!selectedLeadId || !leadDetailData?.data) return;
    const { lead, customer } = leadDetailData.data;
    const lookupItem = leads.find((l) => l._id === selectedLeadId);

    const name =
      getLeadProjectName(
        {
          projectName: lead?.projectName,
          buildingType: lead?.buildingType,
          location: lead?.location,
        },
        customer ? { firstName: customer.firstName, lastName: customer.lastName } : null
      ) ||
      (customer ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() : "") ||
      lookupItem?.projectName ||
      "";

    let bSize = lead?.buildingType || lookupItem?.buildingType || "";
    if (lead?.width && lead?.length && lead?.height) {
      bSize = `${lead.width}x${lead.length}x${lead.height}`;
    } else if (lead?.width && lead?.length) {
      bSize = `${lead.width}x${lead.length}`;
    }

    let sqft = 0;
    if (lead?.sqft) {
      sqft = Number(lead.sqft) || 0;
    } else if (lead?.width && lead?.length) {
      sqft = Number(lead.width) * Number(lead.length);
    } else if (lookupItem?.sqft) {
      sqft = Number(lookupItem.sqft) || 0;
    }

    if (!sqft && bSize) {
      const match = bSize.toLowerCase().match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
      if (match) sqft = parseFloat(match[1]) * parseFloat(match[2]);
    }

    if (name) setCustomerLeadName(name);
    if (customer?.email) setCustomerEmail(customer.email);
    if (lead?.location) setCustomerAddress(lead.location);
    if (lead?.jobId) setJobNumber(lead.jobId);
    if (bSize) setBuildingSize(bSize);
    if (sqft > 0) setSquareFootage(sqft);
  }, [selectedLeadId, leadDetailData, leads, setCustomerLeadName, setCustomerEmail, setCustomerAddress, setJobNumber, setBuildingSize, setSquareFootage]);

  const [activeTab, setActiveTab] = useState<
    | "breakdown"
    | "quote"
    | "sow"
    | "margin"
    | "concrete"
    | "insulation"
    | "drawings"
    | "contract"
  >("breakdown");

  const [isUploading, setIsUploading] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTaxLookingUp, setIsTaxLookingUp] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API-driven recalculation
  const triggerApiCompute = useCallback(
    async (currentStorageData: StorageData | null) => {
      if (!currentStorageData) return;
      setIsComputing(true);
      try {
        const payload = {
          storageData: {
            buildings: currentStorageData.buildings || [],
            doors: currentStorageData.doors || [],
            extras: currentStorageData.extras || [],
            shipping: shippingVal,
            drawings: drawingsVal,
            installSellPerSf: scope.toLowerCase() === "supply" ? 0 : installSell,
            installCostPerSf: scope.toLowerCase() === "supply" ? 0 : installCost,
          },
          concrete: {
            include: concreteInclude,
            costSF: concreteCostSf,
            marginPct: concreteMarginPct,
            thickness: concreteThickness,
            psi: concretePsi,
          },
          insulation: {
            include: insulationInclude,
            costSF: insulationCogsSf,
            marginPct: insulationMarginPct,
            system: insulationSystem,
            rRoof: insulationRoofR,
            rWall: insulationWallR,
          },
          salesTax: {
            rate: taxRate,
            include: includeTax,
          },
        };

        const res = await computeStorageProvider(payload);
        const data = res.data || res;
        if (data?.storagePricing) {
          setStoragePricing(data.storagePricing as StoragePricing);
        }
      } catch (err) {
        console.error("Failed to compute storage pricing via API:", err);
      } finally {
        setIsComputing(false);
      }
    },
    [
      shippingVal,
      drawingsVal,
      scope,
      installSell,
      installCost,
      concreteInclude,
      concreteCostSf,
      concreteMarginPct,
      concreteThickness,
      concretePsi,
      insulationInclude,
      insulationCogsSf,
      insulationMarginPct,
      insulationSystem,
      insulationRoofR,
      insulationWallR,
      taxRate,
      includeTax,
      setStoragePricing,
    ]
  );

  // Debounced API computation trigger when inputs change
  useEffect(() => {
    if (!storageData) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerApiCompute(storageData);
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [storageData, triggerApiCompute]);

  // Handle File Upload via POST /api/sales/estimates/extract-storage-cog
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setFeedbackMsg({ type: "info", text: `Uploading and extracting ${file.name} via backend API...` });

    try {
      const base64 = await fileToBase64(file);
      const apiRes = await extractStorageCogProvider({
        fileBase64: base64,
        fileName: file.name,
      });

      const responsePayload = apiRes.data || apiRes;

      const buildingsList: StorageBuildingItem[] = (
        responsePayload.buildings || []
      ).map((b: Record<string, unknown>, idx: number) => {
        const cogs = Number(b.cogs || b.cost || 0);
        const markup = Number(b.markup ?? 25);
        const sqft = Number(b.sqft || b.squareFootage || 0);
        const psf = sqft > 0 ? cogs / sqft : Number(b.psf || 0);
        return {
          name: String(b.name || `Building ${idx + 1}`),
          width: Number(b.width || 0),
          length: Number(b.length || 0),
          loEave: Number(b.loEave || b.eaveHeight || 0),
          hiEave: Number(b.hiEave || b.loEave || b.eaveHeight || 0),
          eaveHeight: Number(b.loEave || b.eaveHeight || 0),
          roofPitch: String(b.roofPitch || b.pitch || "0.5:12"),
          slope: String(b.slope || b.roofPitch || "0.5:12"),
          sqft,
          squareFootage: sqft,
          psf,
          cogs,
          cost: cogs,
          markup,
          sellPrice: Number(b.sellPrice) || Math.round(cogs * (1 + markup / 100)),
          roofType: String(b.roofType || "screw-down"),
          wallPanel: String(b.wallPanel || b.wallColor || "26ga R-Loc"),
          roofPanel: String(b.roofPanel || "26ga Galvalume"),
          wallColor: String(b.wallPanel || b.wallColor || "26ga R-Loc"),
          doors: String(b.doors || ""),
        };
      });

      const doorsList: StorageDoorItem[] = (
        responsePayload.doors || []
      ).map((d: Record<string, unknown>) => {
        const qty = Number(d.qty || d.quantity || d.count || 0);
        const unitCost = Number(d.unitCost || d.costPerUnit || 0);
        const cogs = Number(d.cogs || d.totalCost || qty * unitCost);
        const markup = Number(d.markup ?? 25);
        return {
          type: String(d.type || "Trac-Rite"),
          size: String(d.size || "8' x 7'"),
          unitCost,
          costPerUnit: unitCost,
          qty,
          quantity: qty,
          count: qty,
          cogs,
          totalCost: cogs,
          markup,
          sale: Number(d.sale || d.totalSell) || Math.round(cogs * (1 + markup / 100)),
          sellPerUnit: Number(d.sellPerUnit) || Math.round(unitCost * (1 + markup / 100)),
          totalSell: Number(d.sale || d.totalSell) || Math.round(cogs * (1 + markup / 100)),
          color: String(d.color || "Standard"),
        };
      });

      const extrasList: StorageExtraItem[] = (
        responsePayload.extras || []
      ).map((x: Record<string, unknown>) => {
        const cogs = Number(x.cogs || x.cost || 0);
        const markup = Number(x.markup ?? 25);
        return {
          name: String(x.name || x.item || "Extra Item"),
          item: String(x.item || x.name || "Extra Item"),
          cogs,
          cost: cogs,
          markup,
          sale: Number(x.sale || x.sellPrice) || Math.round(cogs * (1 + markup / 100)),
          sellPrice: Number(x.sale || x.sellPrice) || Math.round(cogs * (1 + markup / 100)),
          note: String(x.note || ""),
          include: x.include !== false,
        };
      });

      const shipVal =
        typeof responsePayload.shippingDefault === "number"
          ? responsePayload.shippingDefault
          : Number((responsePayload.shippingDefault as Record<string, unknown>)?.freightCost) || 12000;
      setShippingVal(shipVal);

      const proj = responsePayload.project || {};
      if (proj.customer) setCustomerLeadName(String(proj.customer));
      if (proj.location) setCustomerAddress(String(proj.location));
      if (proj.jobNumber) setJobNumber(String(proj.jobNumber));

      const newStorageData: StorageData = {
        buildings: buildingsList,
        doors: doorsList,
        extras: extrasList,
        shippingDefault: {
          freightCost: shipVal,
          freightSell: shipVal,
          trucks: 1,
        },
        project: {
          customer: String(proj.customer || ""),
          location: String(proj.location || ""),
          quoteDate: String(proj.date || ""),
          jobNumber: String(proj.jobNumber || ""),
        },
      };

      setStorageData(newStorageData);
      setSourceFileName(file.name);

      if (responsePayload.storagePricing) {
        setStoragePricing(responsePayload.storagePricing as StoragePricing);
      } else {
        triggerApiCompute(newStorageData);
      }

      setFeedbackMsg({
        type: "success",
        text: `✓ Backend successfully extracted ${buildingsList.length} buildings and ${doorsList.length} door types from ${file.name}!`,
      });
    } catch (err: unknown) {
      console.error("Storage COG backend extract error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to extract Storage COG file via API.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  // Tax lookup handler
  const handleTaxLookup = async () => {
    if (!taxZip || taxZip.trim().length !== 5) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter a valid 5-digit ZIP code.",
      });
      return;
    }
    setIsTaxLookingUp(true);
    try {
      const res = await taxLookupProvider(taxZip);
      const data = res.data ?? res;
      const rateVal =
        typeof data === "number"
          ? data
          : (data as { rate?: number; taxRate?: number })?.rate ??
          (data as { rate?: number; taxRate?: number })?.taxRate ??
          res.rate ??
          0;

      setTaxRate(rateVal);
      setFeedbackMsg({
        type: "success",
        text: `✓ Sales tax rate for ZIP ${taxZip}: ${rateVal}%`,
      });
    } catch (err) {
      console.error("Tax lookup error:", err);
      setFeedbackMsg({
        type: "error",
        text: "Could not fetch tax rate for this ZIP. Enter manually.",
      });
    } finally {
      setIsTaxLookingUp(false);
    }
  };

  // Save Storage Draft via API
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload: SaveEstimatePayload = {
        _id: estimateId || undefined,
        jobType: "Storage",
        scope: scope.toLowerCase() === "supply" ? "Supply" : scope.toLowerCase() === "install" ? "Install" : "Both",
        leadCompanyName:
          customerLeadName || storageData?.project?.customer || "Storage Project",
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        jobNumber: jobNumber || storageData?.project?.jobNumber || "",
        sourceFileName,
        storageData: storageData as Record<string, unknown>,
        storagePricingResult: storagePricing as Record<string, unknown>,
        concreteAddon: {
          include: concreteInclude,
          costSF: concreteCostSf,
          marginPct: concreteMarginPct,
          thickness: concreteThickness,
          psi: concretePsi,
        },
        insulationAddon: {
          include: insulationInclude,
          costSF: insulationCogsSf,
          marginPct: insulationMarginPct,
          system: insulationSystem,
          rRoof: insulationRoofR,
          rWall: insulationWallR,
        },
        salesTax: {
          rate: taxRate,
          include: includeTax,
          zip: taxZip,
        },
        status: "draft",
      };

      const res = await saveEstimateProvider(payload, estimateId || undefined);
      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id;
      if (savedId) {
        setEstimateId(savedId);
      }
      setFeedbackMsg({
        type: "success",
        text: "✓ Storage estimate draft saved to database successfully!",
      });
    } catch (err) {
      console.error("Failed to save storage estimate:", err);
      setFeedbackMsg({ type: "error", text: "Failed to save draft." });
    } finally {
      setIsSaving(false);
    }
  };

  // Apply global markup to all buildings
  const handleApplyGlobalMarkup = () => {
    if (!storageData) return;
    const updated = (storageData.buildings || []).map((b) => {
      const cogs = Number(b.cost || b.cogs || 0);
      return {
        ...b,
        markup: globalMarkup,
        sellPrice: Math.round(cogs * (1 + globalMarkup / 100)),
      };
    });
    const updatedData = { ...storageData, buildings: updated };
    setStorageData(updatedData);
    triggerApiCompute(updatedData);
  };

  // Building table inline row helpers
  const handleUpdateBuilding = (
    index: number,
    field: keyof StorageBuildingItem,
    value: string | number
  ) => {
    if (!storageData?.buildings) return;
    const updated = [...storageData.buildings];
    const b = { ...updated[index], [field]: value };

    if (field === "width" || field === "length") {
      const w = field === "width" ? Number(value) : Number(b.width || 0);
      const l = field === "length" ? Number(value) : Number(b.length || 0);
      b.sqft = w * l;
      b.squareFootage = w * l;
    }
    if (field === "psf") {
      const psf = Number(value);
      const sqft = Number(b.sqft || 0);
      b.cogs = psf * sqft;
      b.cost = psf * sqft;
    }
    if (field === "markup" || field === "cost" || field === "cogs" || field === "psf") {
      const cogs = Number(b.cost || b.cogs || 0);
      const mu = Number(b.markup ?? 25);
      b.sellPrice = Math.round(cogs * (1 + mu / 100));
    }
    updated[index] = b;
    const updatedData = { ...storageData, buildings: updated };
    setStorageData(updatedData);
  };

  const handleAddBuilding = () => {
    const newBld: StorageBuildingItem = {
      name: `Building ${(storageData?.buildings?.length || 0) + 1}`,
      width: 50,
      length: 150,
      loEave: 14,
      hiEave: 14,
      eaveHeight: 14,
      pitch: "0.5:12",
      roofPitch: "0.5:12",
      slope: "0.5:12",
      sqft: 7500,
      squareFootage: 7500,
      psf: 5.5,
      cogs: 41250,
      cost: 41250,
      markup: globalMarkup,
      sellPrice: Math.round(41250 * (1 + globalMarkup / 100)),
      roofType: "screw-down",
      wallPanel: "26ga R-Loc",
      roofPanel: "26ga Galvalume",
      wallColor: "Standard",
    };
    const updatedData = {
      ...storageData,
      buildings: [...(storageData?.buildings || []), newBld],
    };
    setStorageData(updatedData);
  };

  const handleRemoveBuilding = (index: number) => {
    if (!storageData?.buildings) return;
    const updated = storageData.buildings.filter((_, i) => i !== index);
    const updatedData = { ...storageData, buildings: updated };
    setStorageData(updatedData);
  };

  // Door table inline row helpers
  const handleUpdateDoor = (
    index: number,
    field: keyof StorageDoorItem,
    value: string | number
  ) => {
    if (!storageData?.doors) return;
    const updated = [...storageData.doors];
    const d = { ...updated[index], [field]: value };
    const qty = Number(d.qty || d.quantity || 0);
    const uCost = Number(d.unitCost || d.costPerUnit || 0);
    const mu = Number(d.markup ?? 25);
    const cogs = qty * uCost;
    d.cogs = cogs;
    d.totalCost = cogs;
    d.sale = Math.round(cogs * (1 + mu / 100));
    d.totalSell = Math.round(cogs * (1 + mu / 100));
    d.sellPerUnit = Math.round(uCost * (1 + mu / 100));
    updated[index] = d;
    const updatedData = { ...storageData, doors: updated };
    setStorageData(updatedData);
  };

  const handleAddDoor = () => {
    const newDoor: StorageDoorItem = {
      type: "Janus 650",
      size: "9' x 7'",
      unitCost: 380,
      costPerUnit: 380,
      qty: 10,
      quantity: 10,
      count: 10,
      cogs: 3800,
      totalCost: 3800,
      markup: 25,
      sale: Math.round(3800 * 1.25),
      totalSell: Math.round(3800 * 1.25),
      sellPerUnit: Math.round(380 * 1.25),
      color: "Standard",
    };
    const updatedData = {
      ...storageData,
      doors: [...(storageData?.doors || []), newDoor],
    };
    setStorageData(updatedData);
  };

  const handleRemoveDoor = (index: number) => {
    if (!storageData?.doors) return;
    const updated = storageData.doors.filter((_, i) => i !== index);
    const updatedData = { ...storageData, doors: updated };
    setStorageData(updatedData);
  };

  // Extras table inline row helpers
  const handleUpdateExtra = (
    index: number,
    field: keyof StorageExtraItem,
    value: string | number | boolean
  ) => {
    if (!storageData?.extras) return;
    const updated = [...storageData.extras];
    const x = { ...updated[index], [field]: value };
    const cogs = Number(x.cogs || x.cost || 0);
    const mu = Number(x.markup ?? 25);
    x.sale = Math.round(cogs * (1 + mu / 100));
    x.sellPrice = Math.round(cogs * (1 + mu / 100));
    updated[index] = x;
    const updatedData = { ...storageData, extras: updated };
    setStorageData(updatedData);
  };

  const handleAddExtra = () => {
    const newExtra: StorageExtraItem = {
      name: "Custom Trim / Sealant Line",
      item: "Custom Trim / Sealant Line",
      cogs: 500,
      cost: 500,
      markup: 25,
      sale: 625,
      sellPrice: 625,
      note: "Standard accessories",
      include: true,
    };
    const updatedData = {
      ...storageData,
      extras: [...(storageData?.extras || []), newExtra],
    };
    setStorageData(updatedData);
  };

  const handleRemoveExtra = (index: number) => {
    if (!storageData?.extras) return;
    const updated = storageData.extras.filter((_, i) => i !== index);
    const updatedData = { ...storageData, extras: updated };
    setStorageData(updatedData);
  };

  // Navigate to Storage Preview Page
  const handleNavigatePreview = () => {
    startTransition(() => {
      navigate("/quotation/storage-preview", {
        state: {
          storageData,
          storagePricing,
          estimateId,
          sourceFileName,
          customerLeadName,
          customerAddress,
          customerEmail,
          jobNumber,
          scope,
          concreteInclude,
          insulationInclude,
          includeTax,
          taxRate,
        },
      });
    });
  };

  const buildings = storageData?.buildings || [];
  const doors = storageData?.doors || [];
  const extras = storageData?.extras || [];

  const totalSqFt = Number(storagePricing?.totalSqFt || storagePricing?.squareFootage || 0);
  const grandTotal = Number(storagePricing?.grandTotal || storagePricing?.totSell || storagePricing?.totalSell || 0);
  const totalCost = Number(storagePricing?.totalCost || storagePricing?.totCost || 0);
  const totalProfit = Number(storagePricing?.profit || grandTotal - totalCost);
  const marginPct = Number(storagePricing?.marginPercent || (grandTotal > 0 ? (totalProfit / grandTotal) * 100 : 0));
  const sfPrice = Number(storagePricing?.pricePerSf || storagePricing?.sfPrice || (totalSqFt > 0 ? grandTotal / totalSqFt : 0));
  const totalDoorsCount = doors.reduce(
    (acc, d) => acc + Number(d.qty || d.quantity || d.count || 0),
    0
  );

  const laborProfit = installSell - installCost;
  const laborMarginPct =
    installSell > 0 ? (laborProfit / installSell) * 100 : 0;

  return (
    <div className="space-y-5 p-5">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-primary text-primary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Storage Quote
              </h1>
              {isComputing && (
                <span className="text-[11px] text-blue-600 flex items-center gap-1 font-semibold">
                  <Loader2 className="h-3 w-3 animate-spin" /> Computing...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || !storageData}
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer font-semibold text-xs flex items-center gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={handleNavigatePreview}
            disabled={!storageData}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-5 py-2 rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>Preview Quote</span>
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${feedbackMsg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : feedbackMsg.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" && (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Sticker KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-white border-l-4 border-l-blue-600 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Sell</span>
            <DollarSign className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-900 mt-1">
            {fmt(grandTotal)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {fmtDec(sfPrice)}/SF · {totalSqFt.toLocaleString()} SF
          </div>
        </Card>

        <Card className="p-3.5 bg-white border-l-4 border-l-slate-600 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total COGS</span>
            <Layers className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">
            {fmt(totalCost)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Materials & Labor Cost
          </div>
        </Card>

        <Card className="p-3.5 bg-white border-l-4 border-l-emerald-600 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Gross Profit</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {fmt(totalProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            {marginPct.toFixed(1)}% margin
          </div>
        </Card>

        <Card className="p-3.5 bg-white border-l-4 border-l-indigo-600 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Buildings</span>
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-900 mt-1">
            {buildings.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {totalSqFt.toLocaleString()} SF Total
          </div>
        </Card>

        <Card className="p-3.5 bg-white border-l-4 border-l-purple-600 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Roll-Up Doors</span>
            <DoorOpen className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-purple-900 mt-1">
            {totalDoorsCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {doors.length} Door Types
          </div>
        </Card>

        <Card className="p-3.5 bg-white border-l-4 border-l-amber-500 shadow-2xs rounded-xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Scope & Labor</span>
            <Wrench className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">
            {scope}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Labor profit: ${laborProfit.toFixed(2)}/SF
          </div>
        </Card>
      </div>

      {/* Customer & Project Info Collapsible Card */}
      {/* Customer & Project Info Card */}
      <Card className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        {/* Card Header: Select Lead Section */}
        <CardHeader className="border-b bg-slate-50/50 p-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Select Lead
            </label>
            <Select
              value={selectedLeadId || activeLeadId}
              onValueChange={handleLeadChange}
              disabled={isLeadsLoading}
            >
              <SelectTrigger className="w-full max-w-md bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg">
                <SelectValue
                  placeholder={
                    isLeadsLoading ? "Loading leads..." : "Select lead"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => {
                  const label = getLeadProjectName(
                    lead,
                    lead.customerId
                  );
                  return (
                    <SelectItem key={lead._id} value={lead._id}>
                      {label} (
                      {lead.customerId?.firstName
                        ? `${lead.customerId.firstName} ${lead.customerId.lastName ?? ""}`.trim()
                        : "N/A"}
                      )
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Card Content: Customer & Project Info Form */}
        <CardContent className="p-6">
          {/* Customer & Project Information Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                Customer & Project Information{" "}
                {isDetailLoading ? (
                  <span className="text-blue-600 font-normal text-sm flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching details...
                  </span>
                ) : (
                  <span className="text-blue-600 font-normal text-sm">
                    (Auto-Fill after Lead Selection)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer details auto-populate Quote, Statement of Work & Contract documents
              </p>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Customer / Company
                </label>
                <Input
                  value={customerLeadName}
                  onChange={(e) => setCustomerLeadName(e.target.value)}
                  placeholder="e.g. Garry Baright"
                  className="h-9 text-xs bg-slate-50 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Customer Email
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Street Address
                </label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  City, State ZIP
                </label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Modena, NY 12548"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Building Size
                </label>
                <Input
                  value={storeBuildingSize || (navState.buildingSize as string) || (buildings.length > 0 ? `${buildings.length} Buildings` : "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBuildingSize(val);
                    const match = val.toLowerCase().match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
                    if (match) {
                      const computed = parseFloat(match[1]) * parseFloat(match[2]);
                      if (computed > 0) setSquareFootage(computed);
                    }
                  }}
                  placeholder="e.g. 40x100x14"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Square Footage
                </label>
                <Input
                  value={totalSqFt > 0 ? String(totalSqFt) : storeSquareFootage > 0 ? String(storeSquareFootage) : (navState.squareFootage ? String(navState.squareFootage) : "")}
                  onChange={(e) => setSquareFootage(Number(e.target.value) || 0)}
                  placeholder="e.g. 4000"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Job Number
                </label>
                <Input
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  placeholder="8098"
                  className="h-9 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Quote Date
                </label>
                <Input
                  defaultValue={new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  className="h-9 text-xs bg-slate-50"
                />
              </div>
            </div>
          </CardContent>
      </Card>

      {/* Step 1: COG Sheet Upload */}
      <Card className="border border-slate-200 bg-white rounded-xl shadow-xs p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Step 1 — Upload COG Sheet Excel
              </h3>

            </div>
          </div>
          {sourceFileName && (
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {sourceFileName}
            </span>
          )}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center cursor-pointer"
          onClick={() => document.getElementById("storage-cog-file-input")?.click()}
        >
          <input
            id="storage-cog-file-input"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs font-bold">Extracting via Backend API...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {sourceFileName
                  ? "Drop new file to replace COG data"
                  : "Drop COG Sheet Excel here"}
              </div>
              <p className="text-[11px] text-slate-500">
                .xlsx only · COG Sheet + Storage Sheet tabs · click to browse
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Storage Results Area with Tabs */}
      {storageData && (
        <div className="space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab("breakdown")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "breakdown"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              📊 Buildings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quote")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "quote"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              Quote
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sow")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "sow"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              Statement of Work
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("margin")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "margin"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              💰 Margin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("concrete")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "concrete"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              🪨 Concrete
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("insulation")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "insulation"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              🧱 Insulation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drawings")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "drawings"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              📐 Drawings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contract")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${activeTab === "contract"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              📄 Contract
            </button>
          </div>

          {/* TAB 1: BUILDINGS BREAKDOWN */}
          {activeTab === "breakdown" && (
            <div className="space-y-4">
              {/* Buildings Table */}
              <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      🏗️ Buildings
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Edit inline · markup per building or apply global
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddBuilding}
                      className="h-8 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Building
                    </Button>
                    <span className="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                      {buildings.length} bldgs · {totalSqFt.toLocaleString()} SF
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-225">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                        <th className="p-2.5">Building</th>
                        <th className="p-2.5 text-right">Width</th>
                        <th className="p-2.5 text-right">Length</th>
                        <th className="p-2.5 text-right">Lo Eave</th>
                        <th className="p-2.5 text-right">Hi Eave</th>
                        <th className="p-2.5">Slope</th>
                        <th className="p-2.5 text-right">SF</th>
                        <th className="p-2.5 text-right">COGS</th>
                        <th className="p-2.5 text-right">$/SF COGS</th>
                        <th className="p-2.5 text-right">Markup %</th>
                        <th className="p-2.5 text-right">Sell</th>
                        <th className="p-2.5">Wall</th>
                        <th className="p-2.5">Roof Type</th>
                        <th className="p-2.5 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {buildings.map((b, idx) => {
                        const bSqft = Number(b.sqft || 0);
                        const bCogs = Number(b.cost || b.cogs || 0);
                        const bSell = Number(b.sellPrice || 0);
                        const psf = bSqft > 0 ? (bCogs / bSqft).toFixed(2) : "0.00";
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <Input
                                value={b.name || ""}
                                onChange={(e) =>
                                  handleUpdateBuilding(idx, "name", e.target.value)
                                }
                                className="h-8 w-24 text-xs font-semibold"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={b.width !== undefined ? b.width : ""}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "width",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-16 text-right text-xs"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={b.length !== undefined ? b.length : ""}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "length",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-16 text-right text-xs"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={b.loEave !== undefined ? b.loEave : (b.eaveHeight || "")}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "loEave",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-14 text-right text-xs"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={b.hiEave !== undefined ? b.hiEave : (b.loEave || "")}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "hiEave",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-14 text-right text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={b.slope || b.roofPitch || "0.5:12"}
                                onChange={(e) =>
                                  handleUpdateBuilding(idx, "slope", e.target.value)
                                }
                                className="h-8 w-18 text-xs"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-800">
                              {bSqft.toLocaleString()}
                            </td>
                            <td className="p-2 text-right font-semibold text-amber-700">
                              {fmt(bCogs)}
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                step="0.1"
                                value={b.psf !== undefined ? b.psf : psf}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "psf",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-18 text-right text-xs"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={b.markup !== undefined ? b.markup : 25}
                                onChange={(e) =>
                                  handleUpdateBuilding(
                                    idx,
                                    "markup",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-16 text-right text-xs font-bold text-emerald-700"
                              />
                            </td>
                            <td className="p-2 text-right font-extrabold text-blue-900">
                              {fmt(bSell)}
                            </td>
                            <td className="p-2 text-slate-600 font-medium">
                              {String(b.wallPanel || b.wallColor || "26ga R-Loc")}
                            </td>
                            <td className="p-2">
                              <select
                                value={b.roofType || "screw-down"}
                                onChange={(e) =>
                                  handleUpdateBuilding(idx, "roofType", e.target.value)
                                }
                                className="h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                              >
                                <option value="screw-down">Screw-Down</option>
                                <option value="standing-seam">Standing Seam</option>
                                <option value="r-panel">R-Panel</option>
                                <option value="galvalume">Galvalume</option>
                              </select>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBuilding(idx)}
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                        <td className="p-2.5">Totals</td>
                        <td colSpan={5}></td>
                        <td className="p-2.5 text-right">{totalSqFt.toLocaleString()} SF</td>
                        <td className="p-2.5 text-right text-amber-700">
                          {fmt(storagePricing?.buildingsSubtotal ? (storagePricing.buildingsSubtotal * 0.8) : 0)}
                        </td>
                        <td></td>
                        <td></td>
                        <td className="p-2.5 text-right text-blue-900">
                          {fmt(storagePricing?.buildingsSubtotal)}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Pricing Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Global Material Markup */}
                <Card className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    📦 Material Markup %
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <span className="text-sm font-bold text-blue-900 w-12 text-right">
                      {globalMarkup}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Adjusts sell price on all buildings.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyGlobalMarkup}
                    className="w-full h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
                  >
                    Apply to All Buildings
                  </Button>
                </Card>

                {/* 2. Erection / Labor */}
                <Card className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                    🏗️ Erection / Labor
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                      <span>Cost $/SF:</span>
                      <span className="text-amber-700 font-bold">${installCost.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.25"
                      value={installCost}
                      onChange={(e) => setInstallCost(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                      <span>Sell $/SF:</span>
                      <span className="text-emerald-700 font-bold">${installSell.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.25"
                      value={installSell}
                      onChange={(e) => setInstallSell(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="p-2 bg-white/80 rounded text-[11px] font-bold text-emerald-700 border border-emerald-100 flex justify-between">
                    <span>Labor Margin:</span>
                    <span>${laborProfit.toFixed(2)}/SF ({laborMarginPct.toFixed(1)}%)</span>
                  </div>
                </Card>

                {/* 3. Shipping & Drawings & Tax */}
                <Card className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    🚚 Shipping & Drawings
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Shipping / Freight $
                    </label>
                    <Input
                      type="number"
                      value={shippingVal}
                      onChange={(e) => setShippingVal(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Engineering Drawings $
                    </label>
                    <Input
                      type="number"
                      value={drawingsVal}
                      onChange={(e) => setDrawingsVal(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs bg-slate-50 font-bold"
                    />
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Input
                        value={taxZip}
                        onChange={(e) => setTaxZip(e.target.value)}
                        placeholder="ZIP"
                        maxLength={5}
                        className="h-7 text-xs w-20 text-center font-bold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTaxLookup}
                        disabled={isTaxLookingUp}
                        className="h-7 px-2 text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        {isTaxLookingUp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Lookup"}
                      </Button>
                      <Input
                        type="number"
                        step="0.25"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs flex-1 font-bold"
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTax}
                        onChange={(e) => setIncludeTax(e.target.checked)}
                        className="h-3.5 w-3.5 rounded accent-blue-600"
                      />
                      <span>Include tax on quote</span>
                    </label>
                  </div>
                </Card>

                {/* 4. Grand Total Summary Box */}
                <Card className="p-4 bg-[#1e3a8a] text-white rounded-xl flex flex-col justify-between shadow-md">
                  <div>
                    <div className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                      Grand Total
                    </div>
                    <div className="text-2xl font-black mt-1">
                      {fmt(grandTotal)}
                    </div>
                    <div className="text-[11px] text-blue-200 mt-1 font-medium leading-tight">
                      ${sfPrice}/SF · {totalSqFt.toLocaleString()} total SF
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/20 mt-2">
                    <div className="text-emerald-400 font-extrabold text-xs flex items-center justify-between">
                      <span>💰 {fmt(totalProfit)} profit</span>
                      <span>{marginPct.toFixed(1)}% margin</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Doors & Hardware Table */}
              <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      🚪 Doors & Hardware
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Edit qty, unit cost, markup inline
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDoor}
                    className="h-8 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Door Type
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5 text-right">Unit Cost</th>
                        <th className="p-2.5 text-right">QTY</th>
                        <th className="p-2.5 text-right">COGS Total</th>
                        <th className="p-2.5 text-right">Markup %</th>
                        <th className="p-2.5 text-right">Sale Total</th>
                        <th className="p-2.5 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {doors.map((d, idx) => {
                        const qty = Number(d.qty || d.quantity || 0);
                        const uCost = Number(d.unitCost || d.costPerUnit || 0);
                        const cogsTot = Number(d.cogs || d.totalCost || qty * uCost);
                        const saleTot = Number(d.sale || d.totalSell || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <Input
                                value={d.type || ""}
                                onChange={(e) =>
                                  handleUpdateDoor(idx, "type", e.target.value)
                                }
                                className="h-8 w-32 text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={d.size || ""}
                                onChange={(e) =>
                                  handleUpdateDoor(idx, "size", e.target.value)
                                }
                                className="h-8 w-24 text-xs font-bold"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={d.unitCost !== undefined ? d.unitCost : (d.costPerUnit || "")}
                                onChange={(e) =>
                                  handleUpdateDoor(
                                    idx,
                                    "unitCost",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-20 text-right text-xs"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={d.qty !== undefined ? d.qty : (d.quantity || "")}
                                onChange={(e) =>
                                  handleUpdateDoor(
                                    idx,
                                    "qty",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-16 text-right text-xs font-bold text-blue-700"
                              />
                            </td>
                            <td className="p-2 text-right font-semibold text-amber-700">
                              {fmt(cogsTot)}
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                value={d.markup !== undefined ? d.markup : 25}
                                onChange={(e) =>
                                  handleUpdateDoor(
                                    idx,
                                    "markup",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-16 text-right text-xs font-bold"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-blue-900">
                              {fmt(saleTot)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDoor(idx)}
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                        <td colSpan={4} className="p-2.5">Total Doors ({totalDoorsCount} Units)</td>
                        <td className="p-2.5 text-right text-amber-700">
                          {fmt(storagePricing?.doorsSubtotal ? storagePricing.doorsSubtotal * 0.8 : 0)}
                        </td>
                        <td></td>
                        <td className="p-2.5 text-right text-blue-900">
                          {fmt(storagePricing?.doorsSubtotal)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Options & Add-ons (Extras) Table */}
              <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      ⚙️ Options & Add-ons
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Insulation, concrete, seals, extras — check to include in total
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddExtra}
                    className="h-8 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Line
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">COGS $</th>
                        <th className="p-2.5 text-right">Markup %</th>
                        <th className="p-2.5 text-right">Sale $</th>
                        <th className="p-2.5">Note</th>
                        <th className="p-2.5 text-center">Include</th>
                        <th className="p-2.5 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {extras.map((x, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <Input
                              value={x.name || x.item || ""}
                              onChange={(e) =>
                                handleUpdateExtra(idx, "name", e.target.value)
                              }
                              className="h-8 w-44 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <Input
                              type="number"
                              value={x.cogs !== undefined ? x.cogs : (x.cost || "")}
                              onChange={(e) =>
                                handleUpdateExtra(
                                  idx,
                                  "cogs",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8 w-24 text-right text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <Input
                              type="number"
                              value={x.markup !== undefined ? x.markup : 25}
                              onChange={(e) =>
                                handleUpdateExtra(
                                  idx,
                                  "markup",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8 w-16 text-right text-xs font-bold"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-blue-900">
                            {fmt(Number(x.sale || x.sellPrice || 0))}
                          </td>
                          <td className="p-2">
                            <Input
                              value={x.note || ""}
                              onChange={(e) =>
                                handleUpdateExtra(idx, "note", e.target.value)
                              }
                              placeholder="Note..."
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={x.include !== false}
                              onChange={(e) =>
                                handleUpdateExtra(idx, "include", e.target.checked)
                              }
                              className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveExtra(idx)}
                              className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                        <td colSpan={3} className="p-2.5">Options Total (included)</td>
                        <td className="p-2.5 text-right text-blue-900">
                          {fmt(storagePricing?.extrasSubtotal)}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  onClick={() => setActiveTab("quote")}
                  className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  Generate Quote →
                </Button>
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold cursor-pointer"
                  >
                    💾 Save to History
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNavigatePreview}
                    className="bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                  >
                    🗂 Generate Full Package
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUOTE PREVIEW */}
          {activeTab === "quote" && (
            <div className="space-y-4">
              <StoragePreviewDocument
                storageData={storageData}
                storagePricing={storagePricing}
                scope={scope}
                customerLeadName={customerLeadName}
                customerAddress={customerAddress}
                customerEmail={customerEmail}
                jobNumber={jobNumber}
                concreteInclude={concreteInclude}
                insulationInclude={insulationInclude}
                includeTax={includeTax}
                taxRate={taxRate}
              />
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("breakdown")}
                  className="text-xs font-semibold cursor-pointer"
                >
                  ← Edit Buildings
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("sow")}
                    className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white text-xs font-bold cursor-pointer"
                  >
                    View SOW →
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNavigatePreview}
                    className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold cursor-pointer"
                  >
                    🗂 Full Package
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATEMENT OF WORK */}
          {activeTab === "sow" && (
            <div className="space-y-4">
              <StorageSowPreviewDocument
                storageData={storageData}
                storagePricing={storagePricing}
                scope={scope}
                customerLeadName={customerLeadName}
                customerAddress={customerAddress}
                jobNumber={jobNumber}
                concreteInclude={concreteInclude}
                insulationInclude={insulationInclude}
              />
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("quote")}
                  className="text-xs font-semibold cursor-pointer"
                >
                  ← Quote
                </Button>
                <Button
                  type="button"
                  onClick={handleNavigatePreview}
                  className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold cursor-pointer"
                >
                  🗂 Full Package
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: MARGIN */}
          {activeTab === "margin" && (
            <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  💰 Margin Override
                </h3>
                <p className="text-[11px] text-slate-500">
                  Override the blended project margin — overrides per-building markups
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Target Overall Margin %
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <Input
                      type="number"
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(parseInt(e.target.value) || 0)}
                      className="w-20 text-right font-bold text-xs"
                    />
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyGlobalMarkup}
                    className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white text-xs font-bold cursor-pointer"
                  >
                    Apply Overall Margin
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    At this margin:
                  </span>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {fmt(grandTotal)}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    ${sfPrice}/SF · {marginPct.toFixed(1)}% total margin
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: CONCRETE */}
          {activeTab === "concrete" && (
            <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    🪨 Concrete — Cost, Profit & SOW
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Priced per total SF of all building footprints · defaults to $7.25/SF
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={concreteInclude}
                    onChange={(e) => setConcreteInclude(e.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                  <span>Include Concrete</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">
                    Slab Thickness
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConcreteThickness(4)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${concreteThickness === 4
                        ? "bg-blue-100 border-blue-600 text-blue-900"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      4" Slab
                    </button>
                    <button
                      type="button"
                      onClick={() => setConcreteThickness(6)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${concreteThickness === 6
                        ? "bg-blue-100 border-blue-600 text-blue-900"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      6" Slab
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      PSI Rating
                    </label>
                    <select
                      value={concretePsi}
                      onChange={(e) => setConcretePsi(e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                    >
                      <option value="3000">3000 PSI</option>
                      <option value="4000">4000 PSI</option>
                      <option value="5000">5000 PSI</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Install Cost $/SF
                    </label>
                    <Input
                      type="number"
                      step="0.25"
                      value={concreteCostSf}
                      onChange={(e) => setConcreteCostSf(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Target Margin %
                    </label>
                    <Input
                      type="number"
                      step="1"
                      value={concreteMarginPct}
                      onChange={(e) => setConcreteMarginPct(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      Concrete Result ({totalSqFt.toLocaleString()} SF)
                    </span>
                    <div className="text-xl font-black text-blue-900 mt-1">
                      {fmt(storagePricing?.concrete)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">
                    {concreteThickness}" · {concretePsi} PSI · {concreteMarginPct}% margin
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Additional Concrete SOW Notes
                </label>
                <textarea
                  value={concreteNotes}
                  onChange={(e) => setConcreteNotes(e.target.value)}
                  placeholder="e.g. Pier excavation, 10mm vapor barrier, smooth finish..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
                />
              </div>
            </Card>
          )}

          {/* TAB 6: INSULATION */}
          {activeTab === "insulation" && (
            <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    🧱 Insulation — Cost, Profit & SOW
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Priced per total SF · set COGS $/SF then target margin
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insulationInclude}
                    onChange={(e) => setInsulationInclude(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600"
                  />
                  <span>Include Insulation</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">
                    System
                  </div>
                  <div className="space-y-1.5">
                    {(["vinyl", "double", "spray"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInsulationSystem(s)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold border transition-all text-left cursor-pointer ${insulationSystem === s
                          ? "bg-purple-100 border-purple-600 text-purple-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                      >
                        {s === "vinyl"
                          ? "Vinyl-Backed Batt"
                          : s === "double"
                            ? "Double-Layer Batt"
                            : "Spray Foam"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      R-Value Roof / Wall
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={insulationRoofR}
                        onChange={(e) => setInsulationRoofR(e.target.value)}
                        placeholder="R-19"
                        className="h-8 text-xs font-bold"
                      />
                      <Input
                        value={insulationWallR}
                        onChange={(e) => setInsulationWallR(e.target.value)}
                        placeholder="R-13"
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      COGS $/SF / Target Margin %
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={insulationCogsSf}
                        onChange={(e) =>
                          setInsulationCogsSf(parseFloat(e.target.value) || 0)
                        }
                        className="h-8 text-xs font-bold"
                      />
                      <Input
                        type="number"
                        step="1"
                        value={insulationMarginPct}
                        onChange={(e) =>
                          setInsulationMarginPct(parseFloat(e.target.value) || 0)
                        }
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-purple-900 uppercase font-bold">
                      Insulation Result
                    </span>
                    <div className="text-xl font-black text-purple-900 mt-1">
                      {fmt(storagePricing?.insulation)}
                    </div>
                  </div>
                  <div className="text-xs text-purple-800 font-semibold">
                    Roof {insulationRoofR} / Wall {insulationWallR} · {insulationMarginPct}% margin
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 7: DRAWINGS */}
          {activeTab === "drawings" && (
            <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    📐 Building Drawings & Plans
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add layout plans or elevations to include in the quote package
                  </p>
                </div>
                <label className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs">
                  + Add Drawings
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setStorageDrawings((prev) => [
                            ...prev,
                            {
                              name: file.name,
                              data: ev.target?.result as string,
                              includeInPackage: true,
                            },
                          ]);
                        };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {storageDrawings.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                  No drawings added yet. Click "+ Add Drawings" to attach layout plans.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {storageDrawings.map((d, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2 text-xs space-y-1.5"
                    >
                      <div className="font-bold text-slate-800 truncate">
                        {d.name}
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={d.includeInPackage}
                          onChange={(e) => {
                            const updated = [...storageDrawings];
                            updated[i].includeInPackage = e.target.checked;
                            setStorageDrawings(updated);
                          }}
                          className="h-3.5 w-3.5 accent-blue-600"
                        />
                        <span>Include in quote</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 8: CONTRACT */}
          {activeTab === "contract" && (
            <div className="space-y-4">
              <ContractPreviewDocument
                effectiveDate={new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                customerLegalName={customerLeadName || "Customer Legal Entity"}
                customerAddress={customerAddress}
                totalContractValue={fmt(grandTotal)}
                contractType={
                  scope.toLowerCase() === "both"
                    ? "Mini Storage Supply, Delivery & Installation"
                    : "Mini Storage Supply & Delivery Only"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
