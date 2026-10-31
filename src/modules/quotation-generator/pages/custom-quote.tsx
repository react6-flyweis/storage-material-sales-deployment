import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  FileCheck,
  Save,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { useLeadsLookupQuery, useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import { formatInstallAddress } from "@/lib/address";
import {
  createCustomQuoteProvider,
  updateCustomQuoteProvider,
  previewCustomQuoteProvider,
  type CreateCustomQuoteRequest,
} from "../custom-quotes.api";
import { useCustomQuoteDetailQuery } from "../estimates.hooks";

interface CalculationResult {
  totalCost: number;
  totalSell: number;
  profit: number;
  marginPercent: number;
}

export default function CustomQuote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeLocation = useLocation();

  const { setPembLeadData, setCompanyBrand } = useQuotationStore();

  // Query / navigation state
  const initialQuoteId =
    searchParams.get("id") ||
    searchParams.get("customQuoteId") ||
    (routeLocation.state as { customQuoteId?: string })?.customQuoteId ||
    "";

  const initialLeadId =
    searchParams.get("leadId") ||
    searchParams.get("lead") ||
    (routeLocation.state as { leadId?: string })?.leadId ||
    "";

  const [customQuoteId, setCustomQuoteId] = useState<string>(initialQuoteId);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId);

  // Fetch existing custom quote via React Query (supports window focus refetching)
  const { data: existingQuoteDoc, isLoading: isLoadingExistingQuote } =
    useCustomQuoteDetailQuery(initialQuoteId || undefined);

  // Fetch leads lookup list
  const { data: leadsLookupData, isLoading: isLeadsLoading } =
    useLeadsLookupQuery(undefined, 1, 100);
  const leads = useMemo(
    () => leadsLookupData?.data?.leads || [],
    [leadsLookupData]
  );

  // Fetch detailed info for selected lead
  const { data: leadDetailData, isLoading: isDetailLoading } =
    useLeadDetailQuery(selectedLeadId, Boolean(selectedLeadId));

  // Project Details Form State
  const [customerCompany, setCustomerCompany] = useState("");
  const [location, setLocation] = useState("");
  const [buildingSize, setBuildingSizeInput] = useState("");
  const [scope, setScope] = useState("Supply, Delivery & Installation");
  const [company, setCompany] = useState<"SM" | "SBD">("SM");

  // Cost and Pricing State
  const [materialCost, setMaterialCost] = useState("");
  const [freightCost, setFreightCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [targetMargin, setTargetMargin] = useState("20");
  const [fixedSellPrice, setFixedSellPrice] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState("15");

  // Scope Details State
  const [includedScope, setIncludedScope] = useState(
    "Supply and delivery of PEMB\nAll trim and accessories\nAnchor bolt plan"
  );
  const [excludedScope, setExcludedScope] = useState(
    "Foundation & Concrete\nErection/Installation\nElectrical & Plumbing"
  );

  // Calculation Results
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const isEdit = Boolean(initialQuoteId || customQuoteId);

  // Populate form fields when custom quote data is loaded
  useEffect(() => {
    if (!existingQuoteDoc) return;
    const doc = existingQuoteDoc;
    setCustomQuoteId(doc._id);
    if (doc.leadId) setSelectedLeadId(String(doc.leadId));
    if (doc.customer) setCustomerCompany(doc.customer);
    if (doc.location) setLocation(doc.location);
    if (doc.size) setBuildingSizeInput(doc.size);
    if (doc.scope) setScope(doc.scope);
    if (doc.company === "SM" || doc.company === "SBD") setCompany(doc.company);
    if (doc.matCost !== undefined) setMaterialCost(String(doc.matCost));
    if (doc.freight !== undefined) setFreightCost(String(doc.freight));
    if (doc.laborCost !== undefined) setLaborCost(String(doc.laborCost));
    if (doc.marginPct !== undefined) setTargetMargin(String(doc.marginPct));
    if (doc.sellOverride) setFixedSellPrice(String(doc.sellOverride));
    if (doc.expDays !== undefined) setQuoteValidDays(String(doc.expDays));
    if (Array.isArray(doc.inclusions)) setIncludedScope(doc.inclusions.join("\n"));
    if (Array.isArray(doc.exclusions)) setExcludedScope(doc.exclusions.join("\n"));
    if (doc.totalCost !== undefined && doc.sell !== undefined) {
      setCalcResult({
        totalCost: doc.totalCost,
        totalSell: doc.sell,
        profit: doc.profit ?? 0,
        marginPercent: doc.profPct ?? 0,
      });
    }
  }, [existingQuoteDoc]);

  // Lead selection handler
  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) {
      setCustomerCompany("");
      return;
    }

    const lookupItem = leads.find((l) => l._id === leadId);
    if (lookupItem) {
      const name =
        getLeadProjectName(lookupItem, lookupItem.customerId) ||
        `${lookupItem.customerId?.firstName || ""} ${lookupItem.customerId?.lastName || ""}`.trim() ||
        lookupItem.projectName ||
        "";
      if (name) setCustomerCompany(name);

      const resolvedLoc = formatInstallAddress(lookupItem.installAddress, lookupItem.location);
      if (resolvedLoc && resolvedLoc !== "—" && resolvedLoc !== "N/A") {
        setLocation(resolvedLoc);
      } else if (lookupItem.location) {
        setLocation(lookupItem.location);
      }

      let bSize = lookupItem.buildingType || "";
      const rawLookup = lookupItem as unknown as Record<string, unknown>;
      if (rawLookup.width && rawLookup.length && rawLookup.height) {
        bSize = `${rawLookup.width}x${rawLookup.length}x${rawLookup.height}`;
      } else if (rawLookup.width && rawLookup.length) {
        bSize = `${rawLookup.width}x${rawLookup.length}`;
      }
      if (bSize && bSize !== "—" && bSize !== "N/A") {
        setBuildingSizeInput(bSize);
      }
    }
  };

  // Populate from lookup list if leadId set initially
  useEffect(() => {
    if (!selectedLeadId || !leads.length || customerCompany) return;
    const lookupItem = leads.find((l) => l._id === selectedLeadId);
    if (lookupItem) {
      const name =
        getLeadProjectName(lookupItem, lookupItem.customerId) ||
        `${lookupItem.customerId?.firstName || ""} ${lookupItem.customerId?.lastName || ""}`.trim() ||
        lookupItem.projectName ||
        "";
      if (name) setCustomerCompany(name);

      const resolvedLoc = formatInstallAddress(lookupItem.installAddress, lookupItem.location);
      if (resolvedLoc && resolvedLoc !== "—" && resolvedLoc !== "N/A" && !location) {
        setLocation(resolvedLoc);
      } else if (lookupItem.location && !location) {
        setLocation(lookupItem.location);
      }

      let bSize = lookupItem.buildingType || "";
      const rawLookup = lookupItem as unknown as Record<string, unknown>;
      if (rawLookup.width && rawLookup.length && rawLookup.height) {
        bSize = `${rawLookup.width}x${rawLookup.length}x${rawLookup.height}`;
      } else if (rawLookup.width && rawLookup.length) {
        bSize = `${rawLookup.width}x${rawLookup.length}`;
      }
      if (bSize && bSize !== "—" && bSize !== "N/A" && !buildingSize) {
        setBuildingSizeInput(bSize);
      }
    }
  }, [selectedLeadId, leads, customerCompany, location, buildingSize]);

  // Sync detailed lead information if available
  useEffect(() => {
    if (!selectedLeadId || !leadDetailData?.data) return;
    const { lead, customer } = leadDetailData.data;
    const lookupItem = leads.find((l) => l._id === selectedLeadId);
    const rawCustomer = customer as unknown as Record<string, unknown> | undefined;

    const name =
      getLeadProjectName(
        {
          projectName: lead?.projectName,
          buildingType: lead?.buildingType,
          location: lead?.location,
          installAddress: lead?.installAddress,
        },
        customer ? { firstName: customer.firstName, name: (rawCustomer?.company as string) || (rawCustomer?.name as string) } : null
      ) ||
      (rawCustomer?.company as string) ||
      (customer?.firstName ? `${customer.firstName} ${(rawCustomer?.lastName as string) || ""}`.trim() : "") ||
      lookupItem?.projectName ||
      "";

    if (name) {
      setCustomerCompany(name);
    }

    const resolvedAddress = formatInstallAddress(lead?.installAddress, lead?.location);
    if (resolvedAddress && resolvedAddress !== "—" && resolvedAddress !== "N/A" && !location) {
      setLocation(resolvedAddress);
    }

    const rawLead = lead as unknown as Record<string, unknown> | undefined;
    let bSize = lead?.buildingType || lookupItem?.buildingType || "";
    if (rawLead?.width && rawLead?.length && rawLead?.height) {
      bSize = `${rawLead.width}x${rawLead.length}x${rawLead.height}`;
    } else if (rawLead?.width && rawLead?.length) {
      bSize = `${rawLead.width}x${rawLead.length}`;
    }
    if (bSize && bSize !== "—" && bSize !== "N/A" && !buildingSize) {
      setBuildingSizeInput(bSize);
    }
  }, [selectedLeadId, leadDetailData, leads, customerCompany, location, buildingSize]);

  const selectedLead = useMemo(
    () => leads.find((l) => l._id === selectedLeadId),
    [leads, selectedLeadId]
  );

  const calculateNumbers = (): CalculationResult => {
    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const totalCost = mat + freight + labor;

    const fixedSell = parseFloat(fixedSellPrice) || 0;
    const marginPct = parseFloat(targetMargin) || 0;

    let totalSell = 0;
    let marginPercent = 0;

    if (fixedSell > 0) {
      totalSell = fixedSell;
      marginPercent =
        totalSell > 0 ? ((totalSell - totalCost) / totalSell) * 100 : 0;
    } else {
      const marginDecimal = marginPct / 100;
      if (marginDecimal >= 1) {
        totalSell = totalCost;
        marginPercent = 0;
      } else {
        totalSell = marginDecimal > 0 ? totalCost / (1 - marginDecimal) : totalCost;
        marginPercent = marginPct;
      }
    }

    const profit = Math.max(0, totalSell - totalCost);

    return {
      totalCost,
      totalSell,
      profit,
      marginPercent,
    };
  };

  const handleCalculate = async () => {
    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;

    setIsCalculating(true);
    try {
      const preview = await previewCustomQuoteProvider({
        matCost: mat,
        freight,
        laborCost: labor,
        marginPct,
        sellOverride: fixedSell,
      });

      const res: CalculationResult = {
        totalCost: preview.totalCost,
        totalSell: preview.sell,
        profit: preview.profit,
        marginPercent: preview.profPct,
      };
      setCalcResult(res);
      toast.success(
        `Calculated: Total Sell $${Math.round(res.totalSell).toLocaleString()} (${res.marginPercent.toFixed(1)}% margin)`
      );
    } catch {
      const localResult = calculateNumbers();
      setCalcResult(localResult);
      toast.success(
        `Calculated: Total Sell $${Math.round(localResult.totalSell).toLocaleString()} (${localResult.marginPercent.toFixed(1)}% margin)`
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const saveCustomQuoteRecord = async (): Promise<string | null> => {
    if (!selectedLeadId) {
      toast.error("Please select a Lead");
      return null;
    }

    const resolvedCustomer =
      customerCompany.trim() ||
      (selectedLead ? getLeadProjectName(selectedLead, selectedLead.customerId) : "") ||
      "Lead Project";

    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;
    const validDays = parseInt(quoteValidDays) || 15;

    const payload: CreateCustomQuoteRequest = {
      leadId: selectedLeadId,
      customer: resolvedCustomer,
      location: location.trim(),
      size: buildingSize.trim(),
      scope,
      company,
      expDays: validDays,
      matCost: mat,
      freight,
      laborCost: labor,
      marginPct,
      sellOverride: fixedSell,
      inclusions: includedScope.split("\n").filter(Boolean),
      exclusions: excludedScope.split("\n").filter(Boolean),
      sow: {
        overview: `${scope} for ${buildingSize.trim() || "building"}`,
        terms: `Valid for ${validDays} days`,
      },
    };

    if (customQuoteId) {
      const updated = await updateCustomQuoteProvider(customQuoteId, payload);
      if (updated?._id) {
        setCalcResult({
          totalCost: updated.totalCost,
          totalSell: updated.sell,
          profit: updated.profit,
          marginPercent: updated.profPct,
        });
        return updated._id;
      }
      return customQuoteId;
    }

    const created = await createCustomQuoteProvider(payload);
    if (created?._id) {
      setCustomQuoteId(created._id);
      setCalcResult({
        totalCost: created.totalCost,
        totalSell: created.sell,
        profit: created.profit,
        marginPercent: created.profPct,
      });
      return created._id;
    }
    return null;
  };

  const handlePreviewQuote = async () => {
    if (!selectedLeadId) {
      toast.error("Please select a Lead");
      return;
    }

    const mat = parseFloat(materialCost) || 0;
    const freight = parseFloat(freightCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const marginPct = parseFloat(targetMargin) || 0;
    const fixedSell = parseFloat(fixedSellPrice) || null;

    setIsPreviewing(true);
    let savedQuoteId = customQuoteId;
    try {
      const resId = await saveCustomQuoteRecord();
      if (resId) {
        savedQuoteId = resId;
      }
    } catch (err) {
      console.warn("Server custom-quote creation failed, proceeding with local preview state:", err);
    } finally {
      setIsPreviewing(false);
    }

    const result = calcResult || calculateNumbers();
    const resolvedCustomer =
      customerCompany.trim() ||
      (selectedLead ? getLeadProjectName(selectedLead, selectedLead.customerId) : "") ||
      "Lead Project";

    // Save lead details and brand to store
    setPembLeadData({
      leadId: selectedLeadId,
      leadName: resolvedCustomer,
      street: location.trim(),
      cityStateZip: location.trim(),
      buildingSize: buildingSize.trim(),
    });
    setCompanyBrand(company);

    navigate("/quotation/quote-preview/view", {
      state: {
        quotationForm: {
          leadId: selectedLeadId,
          leadName: resolvedCustomer,
          cityStateZip: location.trim(),
          buildingSize: buildingSize.trim(),
          quoteDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          quoteValidDays: quoteValidDays || "15",
          companyBrand: company,
          company,
          ...(savedQuoteId ? { customQuoteId: savedQuoteId } : {}),
        },
        buildingSize: buildingSize.trim(),
        companyBrand: company,
        company,
        customPricing: {
          materialCost: mat,
          freightCost: freight,
          laborCost: labor,
          targetMargin: marginPct,
          fixedSellPrice: fixedSell || 0,
          totalCost: result.totalCost,
          totalSell: result.totalSell,
          profit: result.profit,
          scope,
          company,
          includedItems: includedScope.split("\n").filter(Boolean),
          excludedItems: excludedScope.split("\n").filter(Boolean),
        },
      },
    });
  };

  const handleGenerateQuote = async () => {
    if (!selectedLeadId) {
      toast.error("Please select a Lead");
      return;
    }

    setIsSaving(true);
    try {
      const savedQuoteId = await saveCustomQuoteRecord();
      if (!savedQuoteId) {
        toast.error(isEdit ? "Failed to save changes" : "Failed to generate custom quote");
        return;
      }

      const resolvedCustomer =
        customerCompany.trim() ||
        (selectedLead ? getLeadProjectName(selectedLead, selectedLead.customerId) : "") ||
        "Lead Project";

      // Save lead details and brand to store
      setPembLeadData({
        leadId: selectedLeadId,
        leadName: resolvedCustomer,
        street: location.trim(),
        cityStateZip: location.trim(),
        buildingSize: buildingSize.trim(),
      });
      setCompanyBrand(company);

      toast.success(isEdit ? "Quote updated successfully!" : "Quote generated successfully!");
      navigate(`/quotation/history/${savedQuoteId}`);
    } catch (err) {
      console.error("Save custom quote error:", err);
      toast.error(isEdit ? "Failed to save changes" : "Failed to generate custom quote");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingExistingQuote) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading custom quote details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Custom Quote
            </h1>
            {isEdit && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Editing Quote
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Build a quote manually with full platform approval and customer sending workflow
          </p>
        </div>
      </div>

      {/* Card 1: Project Details & Lead Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-700">
              Project & Customer Information
            </h2>
          </div>
          {isDetailLoading && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Fetching lead details...
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1: Select Lead & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Lead <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedLeadId}
                onValueChange={handleLeadChange}
                disabled={isLeadsLoading}
              >
                <SelectTrigger className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors">
                  <SelectValue
                    placeholder={isLeadsLoading ? "Loading leads..." : "Select lead..."}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {leads.map((lead) => {
                    const label = getLeadProjectName(lead, lead.customerId);
                    const custName = lead.customerId?.firstName
                      ? `${lead.customerId.firstName} ${lead.customerId.lastName ?? ""}`.trim()
                      : "";
                    return (
                      <SelectItem key={lead._id} value={lead._id}>
                        {label} {custName ? `(${custName})` : ""} {lead.jobId ? `• ${lead.jobId}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location / Site Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or full address"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Building Size, Scope & Logo / Brand */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Building Size
              </label>
              <input
                type="text"
                value={buildingSize}
                onChange={(e) => setBuildingSizeInput(e.target.value)}
                placeholder="e.g. 80x120x16 PEMB"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scope
              </label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-800 font-normal focus:border-blue-500 focus:bg-white transition-colors">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supply, Delivery & Installation">
                    Supply, Delivery & Installation
                  </SelectItem>
                  <SelectItem value="Supply & Delivery Only">
                    Supply & Delivery Only
                  </SelectItem>
                  <SelectItem value="Installation Only">
                    Installation Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Logo / Brand
              </label>
              <div className="grid grid-cols-2 gap-1.5 h-10">
                {[
                  { label: "Storage Material", value: "SM" as const },
                  { label: "Steel Building", value: "SBD" as const },
                ].map((item) => {
                  const isActive = company === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setCompany(item.value);
                        setCompanyBrand(item.value);
                      }}
                      className={cn(
                        "h-full rounded-lg font-semibold text-xs transition-colors cursor-pointer text-center flex items-center justify-center border",
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-[#f8fafc] text-slate-700 border-slate-200/90 hover:bg-slate-200"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Material Cost $, Freight Cost $, Labor Cost $ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Material Cost $
              </label>
              <input
                type="number"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Freight Cost $
              </label>
              <input
                type="number"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Labor Cost $
              </label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Row 4: Target Margin %, Fixed Sell Price $ (Optional), Quote Valid (Days) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Margin %
              </label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                placeholder="20"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fixed Sell Price $ (Optional)
              </label>
              <input
                type="number"
                value={fixedSellPrice}
                onChange={(e) => setFixedSellPrice(e.target.value)}
                placeholder="Leave blank to use margin"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quote Valid (Days)
              </label>
              <input
                type="number"
                value={quoteValidDays}
                onChange={(e) => setQuoteValidDays(e.target.value)}
                placeholder="15"
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculate}
              className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isCalculating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <button
              type="button"
              disabled={isPreviewing || isSaving}
              onClick={handlePreviewQuote}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isPreviewing ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              ) : (
                <Eye className="h-4 w-4 text-slate-600" />
              )}
              {isPreviewing ? "Opening Preview..." : "Preview"}
            </button>
            <button
              type="button"
              disabled={isSaving || isPreviewing}
              onClick={handleGenerateQuote}
              className="px-6 py-2.5 bg-[#0e3a8c] hover:bg-[#0b2f73] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                <Save className="h-4 w-4" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              {isSaving
                ? isEdit
                  ? "Saving Changes..."
                  : "Generating Quote..."
                : isEdit
                  ? "Save Changes"
                  : "Generate Quote"}
            </button>
          </div>

          {/* Optional Calculation Breakdown Summary */}
          {calcResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Total Cost
                </span>
                <span className="text-sm font-bold text-slate-800">
                  ${Math.round(calcResult.totalCost).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Estimated Sell
                </span>
                <span className="text-sm font-bold text-blue-700">
                  ${Math.round(calcResult.totalSell).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Estimated Profit
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  ${Math.round(calcResult.profit).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase">
                  Margin
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {calcResult.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Scope Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-semibold text-slate-700">
            Scope Details
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Included Scope (one per line)
              </label>
              <textarea
                rows={4}
                value={includedScope}
                onChange={(e) => setIncludedScope(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg p-3 text-sm text-slate-600 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors leading-relaxed resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Excluded Scope (one per line)
              </label>
              <textarea
                rows={4}
                value={excludedScope}
                onChange={(e) => setExcludedScope(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg p-3 text-sm text-slate-600 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
