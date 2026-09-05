import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileDropzoneCard, type FileItem } from "@/components/ui/file-dropzone-card";
import { QuoteBreakdownTab } from "./quote-breakdown-tab";
import { QuoteDetailTab } from "./quote-detail-tab";
import { QuoteSowTab } from "./quote-sow-tab";
import { QuoteMarginTab } from "./quote-margin-tab";
import { QuoteCogsTab } from "./quote-cogs-tab";
import { QuoteConcreteTab } from "./quote-concrete-tab";
import { QuoteInsulationTab } from "./quote-insulation-tab";
import { QuoteContractTab } from "./quote-contract-tab";
import {
  extractShipperProvider,
  computeEstimateProvider,
  saveEstimateProvider,
  type ExtractShipperResponseData,
  type ExtractDrawingResponseData,
  type ComputeEstimateRequest,
} from "../estimates.api";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

function normalizeRoof(roof: string): string {
  const r = (roof || "").toLowerCase();
  if (r.includes("standing")) return "standing-seam";
  if (r.includes("screw")) return "screw-down";
  if (r.includes("tpo") || r.includes("membrane")) return "membrane";
  if (r.includes("imp") || r.includes("insulated")) return "imp";
  return r.replace(/\s+/g, "-") || "screw-down";
}

function normalizeScope(scope?: string): "supply" | "install" | "both" {
  const s = (scope || "supply").toLowerCase();
  if (s === "install") return "install";
  if (s === "both") return "both";
  return "supply";
}

const tabs = [
  { id: "breakdown", label: "Breakdown" },
  { id: "quote", label: "Quote" },
  { id: "sow", label: "Statement of Work" },
  { id: "margin", label: "Margin" },
  { id: "cogs", label: "COGS" },
  { id: "concrete", label: "Concrete" },
  { id: "insulation", label: "Insulation" },
  { id: "contract", label: "Contract" },
];

interface QuoteBreakdownPricingSectionProps {
  extractedShipper?: ExtractShipperResponseData;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  pdfFileName?: string;
  estimateId?: string | null;
  onShipperExtracted?: (data: ExtractShipperResponseData) => void;
}

export function QuoteBreakdownPricingSection({
  extractedShipper: initialShipper,
  quotationForm,
  extractedDrawing,
  pdfFileName,
  estimateId: propEstimateId,
  onShipperExtracted,
}: QuoteBreakdownPricingSectionProps) {
  const [activeTab, setActiveTab] = useState("breakdown");
  const [shipperData, setShipperData] = useState<ExtractShipperResponseData | undefined>(
    initialShipper
  );
  const [file, setFile] = useState<FileItem | null>(
    initialShipper
      ? { name: initialShipper.fileName, size: `${initialShipper.totalWeightLbs} lbs` }
      : null
  );
  const [isParsing, setIsParsing] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  // Read all quotation settings from store
  const {
    jobType,
    scope,
    roofType,
    installCost,
    installSell,
    blendPercentage,
    installDifficulty,
    concreteInclude,
    concreteCostSf,
    concreteMarginPct,
    concreteSlabThickness,
    concretePsiRating,
    concreteNotes,
    concreteInclusions,
    insulationInclude,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationCogsSf,
    insulationMarginPct,
    insulationNotes,
    insulationInclusions,
    taxZip,
    taxRate,
    includeTax,
    cogsOverrideApplied,
    cogsCostInput,
    cogsCostAdjustPercent,
    cogsMaterialMargin,
    cogsFixedSellPrice,
    marginOverrideApplied,
    marginLaborOverride,
    marginTargetMargin,
    marginFixedSellOverride,
    pembExtractedShipper,
    pembLeadId,
    pembEstimateId,
    setPembEstimateId,
  } = useQuotationStore();

  const effectiveInitial = initialShipper || pembExtractedShipper || undefined;

  const [estimateId, setEstimateId] = useState<string | null>(
    propEstimateId || pembEstimateId || null
  );

  useEffect(() => {
    const eid = propEstimateId || pembEstimateId;
    setEstimateId(eid || null);
  }, [propEstimateId, pembEstimateId]);

  // Page-specific local state
  const [sqFt, setSqFt] = useState(
    effectiveInitial?.squareFootage ? String(effectiveInitial.squareFootage) : ""
  );
  const [isManualSqFt, setIsManualSqFt] = useState(false);
  const [buildingSize, setBuildingSize] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSqFtChange = useCallback((val: string) => {
    setSqFt(val);
    setIsManualSqFt(true);
  }, []);

  useEffect(() => {
    const s = initialShipper || pembExtractedShipper;
    if (s) {
      setShipperData(s);
      setFile({ name: s.fileName, size: `${s.totalWeightLbs} lbs` });
      if (s.squareFootage) {
        setSqFt(String(s.squareFootage));
      }
    } else {
      setShipperData(undefined);
      setFile(null);
      setSqFt("");
    }
  }, [initialShipper, pembExtractedShipper]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const navigate = useNavigate();

  const handleNavigateToPreview = useCallback(() => {
    const activeEstimateId =
      estimateId || propEstimateId || pembEstimateId || undefined;
    navigate("/quotation/quote-preview/view", {
      state: {
        quotationForm,
        extractedDrawing,
        extractedShipper: shipperData,
        sqFt,
        buildingSize,
        additionalNotes,
        pdfFileName,
        estimateId: activeEstimateId,
      },
    });
  }, [
    navigate,
    quotationForm,
    extractedDrawing,
    shipperData,
    sqFt,
    buildingSize,
    additionalNotes,
    pdfFileName,
    estimateId,
    propEstimateId,
    pembEstimateId,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!shipperData) return;
    setIsSavingDraft(true);
    try {
      const activeEstimateId =
        estimateId || propEstimateId || pembEstimateId || undefined;
      const parsedSqFt = parseFloat(sqFt) || shipperData.squareFootage || 0;
      const effectiveCostPerSf = installCost > 0 ? installCost : (jobType === "Storage" ? 2.5 : 5.5);
      const effectiveSellPerSf = installSell > 0 ? installSell : (jobType === "Storage" ? 3.25 : 8.5);
      const cogsCostVal = parseFloat(cogsCostInput) || undefined;
      const cogsSellVal = parseFloat(cogsFixedSellPrice) || undefined;
      const marginLaborVal = parseFloat(marginLaborOverride) || undefined;
      const marginTargetVal = parseFloat(marginTargetMargin) || undefined;
      const marginSellVal = parseFloat(marginFixedSellOverride) || undefined;

      const res = await saveEstimateProvider(
        {
          _id: activeEstimateId,
          leadId: quotationForm?.leadId || pembLeadId || undefined,
          jobType,
          scope: normalizeScope(scope),
          roofType: normalizeRoof(roofType),
          leadCompanyName: quotationForm?.leadName || extractedDrawing?.extracted?.customer || "",
          customerEmail: quotationForm?.email || "",
          streetAddress: quotationForm?.street || "",
          cityStateZip: quotationForm?.cityStateZip || "",
          buildingSize: buildingSize || quotationForm?.buildingSize || "",
          squareFootage: parsedSqFt,
          sf: parsedSqFt,
          useManualSquareFootage: isManualSqFt,
          jobNumber: quotationForm?.jobNumber || extractedDrawing?.extracted?.jobnumber || "",
          sourceFileName: pdfFileName || shipperData.fileName || "",
          blendPct: blendPercentage,
          installLevel: installDifficulty || "easy",
          installCostPerSf: effectiveCostPerSf,
          sellPerSf: effectiveSellPerSf,
          parsedCategories: shipperData.parsedCategories,
          tabSummary: shipperData.tabSummary,
          breakdownRows: shipperData.pricing?.rows,
          pricingResult: shipperData.pricing,
          fullQuoteResult: shipperData.fullQuote || (shipperData.pricing as Record<string, unknown> | undefined),
          extractedDrawingFields: extractedDrawing?.extracted,
          concreteAddon: {
            include: concreteInclude,
            costSF: concreteCostSf,
            marginPct: concreteMarginPct,
            thickness: concreteSlabThickness,
            psi: concretePsiRating,
            slabThickness: concreteSlabThickness,
            psiRating: concretePsiRating,
            sowNotes: concreteNotes,
            sowItems: concreteInclusions,
          },
          insulationAddon: {
            include: insulationInclude,
            costSF: insulationCogsSf,
            cogsSF: insulationCogsSf,
            marginPct: insulationMarginPct,
            system: insulationSystem,
            rRoof: insulationRValueRoof,
            rWall: insulationRValueWalls,
            rValueRoof: insulationRValueRoof,
            rValueWalls: insulationRValueWalls,
            sowNotes: insulationNotes,
            sowItems: insulationInclusions,
          },
          salesTax: {
            rate: taxRate,
            include: includeTax,
            zip: taxZip,
          },
          cogsOverride: cogsOverrideApplied
            ? {
              applied: true,
              costDollar: cogsCostVal ?? null,
              marginPct: cogsMaterialMargin,
              sellDollar: cogsSellVal ?? null,
              costPctAdj: cogsCostAdjustPercent,
            }
            : {
              applied: false,
            },
          marginOverride: marginOverrideApplied
            ? {
              applied: true,
              laborSF: marginLaborVal ?? null,
              pct: marginTargetVal ?? null,
              sellFixed: marginSellVal ?? null,
            }
            : {
              applied: false,
            },
          status: "draft",
        },
        activeEstimateId
      );

      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id || activeEstimateId;
      if (savedId) {
        setEstimateId(savedId);
        setPembEstimateId(savedId);
      }
    } catch (err) {
      console.error("Failed to save draft estimate:", err);
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    estimateId,
    propEstimateId,
    pembEstimateId,
    shipperData,
    jobType,
    scope,
    roofType,
    blendPercentage,
    installDifficulty,
    installCost,
    installSell,
    quotationForm,
    pembLeadId,
    extractedDrawing,
    buildingSize,
    sqFt,
    isManualSqFt,
    pdfFileName,
    concreteInclude,
    concreteCostSf,
    concreteMarginPct,
    concreteSlabThickness,
    concretePsiRating,
    concreteNotes,
    concreteInclusions,
    insulationInclude,
    insulationCogsSf,
    insulationMarginPct,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationNotes,
    insulationInclusions,
    taxRate,
    includeTax,
    taxZip,
    cogsOverrideApplied,
    cogsCostInput,
    cogsCostAdjustPercent,
    cogsMaterialMargin,
    cogsFixedSellPrice,
    marginOverrideApplied,
    marginLaborOverride,
    marginTargetMargin,
    marginFixedSellOverride,
    setPembEstimateId,
  ]);

  const computeAbortRef = useRef<number | null>(null);

  // Compute estimate function
  const executeCompute = useCallback(
    async (overrides?: Partial<ComputeEstimateRequest>) => {
      if (!shipperData) return;

      setIsComputing(true);
      try {
        const storeState = useQuotationStore.getState();
        const parsedSqFt = parseFloat(sqFt) || shipperData.squareFootage || 0;
        const cogsCostVal = parseFloat(storeState.cogsCostInput) || undefined;
        const cogsSellVal = parseFloat(storeState.cogsFixedSellPrice) || undefined;
        const marginLaborVal = parseFloat(storeState.marginLaborOverride) || undefined;
        const marginTargetVal = parseFloat(storeState.marginTargetMargin) || undefined;
        const marginSellVal = parseFloat(storeState.marginFixedSellOverride) || undefined;

        const payload: ComputeEstimateRequest = {
          parsedCategories: shipperData.parsedCategories || {},
          jobType,
          scope: normalizeScope(scope),
          squareFootage: parsedSqFt,
          sf: parsedSqFt,
          useManualSquareFootage: isManualSqFt,
          blendPct: blendPercentage,
          roof: normalizeRoof(roofType),
          install: installDifficulty || "easy",
          installCostPerSf: installCost,
          sellPerSf: installSell,
          concrete: {
            include: concreteInclude,
            costSF: concreteCostSf,
            marginPct: concreteMarginPct,
            thickness: concreteSlabThickness,
            psi: concretePsiRating,
            slabThickness: concreteSlabThickness,
            psiRating: concretePsiRating,
          },
          insulation: {
            include: insulationInclude,
            ...(insulationInclude
              ? {
                system: insulationSystem,
                rRoof: insulationRValueRoof,
                rWall: insulationRValueWalls,
                rValueRoof: insulationRValueRoof,
                rValueWalls: insulationRValueWalls,
                costSF: insulationCogsSf,
                cogsSF: insulationCogsSf,
                marginPct: insulationMarginPct,
              }
              : {}),
          },
          salesTax: {
            rate: taxRate,
            include: includeTax,
            zip: taxZip,
          },
          cogsOverride: cogsOverrideApplied
            ? {
              applied: true,
              costDollar: cogsCostVal ?? null,
              marginPct: storeState.cogsMaterialMargin,
              sellDollar: cogsSellVal ?? null,
              costPctAdj: storeState.cogsCostAdjustPercent,
            }
            : {
              applied: false,
            },
          marginOverride: marginOverrideApplied
            ? {
              applied: true,
              laborSF: marginLaborVal ?? null,
              pct: marginTargetVal ?? null,
              sellFixed: marginSellVal ?? null,
            }
            : {
              applied: false,
            },
          ...overrides,
        };

        const res = await computeEstimateProvider(payload);

        if (res) {
          const data = res.data || res;
          const weightByCategory = data.weightByCategory || res.weightByCategory;
          const fullQuote = data.fullQuote || res.fullQuote;
          const pricing = data.pricing || res.pricing || fullQuote?.pricing;
          if (weightByCategory || pricing || fullQuote) {
            setShipperData((prev) =>
              prev
                ? {
                  ...prev,
                  ...(weightByCategory ? { weightByCategory } : {}),
                  ...(pricing ? { pricing } : {}),
                  ...(fullQuote ? { fullQuote } : {}),
                }
                : prev
            );
          }
        }
      } catch (err) {
        console.error("Failed to compute estimate pricing:", err);
      } finally {
        setIsComputing(false);
      }
    },
    [
      shipperData,
      jobType,
      scope,
      sqFt,
      isManualSqFt,
      blendPercentage,
      roofType,
      installDifficulty,
      installCost,
      installSell,
      concreteInclude,
      concreteCostSf,
      concreteMarginPct,
      concreteSlabThickness,
      concretePsiRating,
      insulationInclude,
      insulationSystem,
      insulationRValueRoof,
      insulationRValueWalls,
      insulationCogsSf,
      insulationMarginPct,
      taxRate,
      includeTax,
      taxZip,
      cogsOverrideApplied,
      marginOverrideApplied,
      setIsComputing,
      setShipperData,
    ]
  );

  // Automatically trigger debounced re-compute when settings change
  useEffect(() => {
    if (!shipperData) return;

    if (computeAbortRef.current) {
      window.clearTimeout(computeAbortRef.current);
    }

    computeAbortRef.current = window.setTimeout(() => {
      executeCompute();
    }, 300);

    return () => {
      if (computeAbortRef.current) {
        window.clearTimeout(computeAbortRef.current);
      }
    };
  }, [executeCompute, shipperData]);

  const handleSelectSf = useCallback(
    (selectedSf: number) => {
      setSqFt(String(selectedSf));
      setIsManualSqFt(true);
      setShipperData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          squareFootage: selectedSf,
          squareFootageMeta: prev.squareFootageMeta
            ? {
              ...prev.squareFootageMeta,
              source: "manual",
              selected: selectedSf,
              inputSf: selectedSf,
            }
            : {
              source: "manual",
              selected: selectedSf,
              inputSf: selectedSf,
            },
        };
      });
      executeCompute({ squareFootage: selectedSf, sf: selectedSf, useManualSquareFootage: true });
    },
    [executeCompute]
  );

  const handleFileSelect = async (selected: FileItem | null, rawFile?: File | null) => {
    setFile(selected);
    if (rawFile) {
      setIsParsing(true);
      try {
        const fileBase64 = await fileToBase64(rawFile);
        const res = await extractShipperProvider({
          fileBase64,
          fileName: rawFile.name,
          jobType,
          scope: normalizeScope(scope),
          roof: normalizeRoof(roofType),
          install: installDifficulty || "easy",
          squareFootage: 0,
          sf: 0,
          useManualSquareFootage: false,
          blendPct: blendPercentage,
          installCostPerSf: installCost,
          sellPerSf: installSell,
        });
        if (res.success && res.data) {
          setShipperData(res.data);
          if (res.data.squareFootage) {
            setSqFt(String(res.data.squareFootage));
          }
          setIsManualSqFt(false);
          if (onShipperExtracted) {
            onShipperExtracted(res.data);
          }
        }
      } catch (err) {
        console.error("Failed to parse shipper XLSX:", err);
      } finally {
        setIsParsing(false);
      }
    } else if (!selected) {
      setIsParsing(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6">
      {/* Step 2 Header */}
      <CardHeader className="p-0 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Step 2 — Upload Xshipper file (excel)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc.
              </p>
            </div>
          </div>

          {/* Simple Static Status Indicator (Zero Layout Shift) */}
          <div className="flex items-center self-start sm:self-auto h-7">
            {isParsing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                <span>Extracting data...</span>
              </span>
            ) : isComputing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                <span>Computing...</span>
              </span>
            ) : shipperData ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pricing computed</span>
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      {/* File Specs Upload Dropzone with Static Parsing State */}
      <FileDropzoneCard
        dropText="Drop your Xshipper file here"
        subDropText="Or click to browse excel files"
        extraInfoText="All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc."
        accept=".xlsx, .xls, .ods"
        fileIcon="xlsx"
        selectedFile={file}
        onFileSelect={handleFileSelect}
        isLoading={isParsing}
        loadingText="Parsing Excel sheets and extracting material breakdown pricing..."
      />

      {/* Tabs Navigation using Shadcn UI Tabs: Conditionally displayed when shipper data is extracted */}
      {Boolean(
        shipperData?.parsedCategories ||
        shipperData?.pricing ||
        (shipperData?.tabSummary && shipperData.tabSummary.length > 0) ||
        (shipperData?.totalWeightLbs && shipperData.totalWeightLbs > 0)
      ) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 pt-4 border-t border-slate-200">
            <div className="border-b border-slate-200 overflow-x-auto pb-1">
              <TabsList variant="line" className="h-auto p-0 gap-6 min-w-max">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="m-0 outline-none">
              <QuoteBreakdownTab
                extractedShipper={shipperData}
                onViewQuote={() => setActiveTab("quote")}
                onViewSow={() => setActiveTab("sow")}
                onQuotePreview={handleNavigateToPreview}
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
                onSelectSf={handleSelectSf}
                isManualSqFt={isManualSqFt}
              />
            </TabsContent>

            {/* Quote Tab */}
            <TabsContent value="quote" className="m-0 outline-none">
              <QuoteDetailTab
                sqFt={sqFt}
                setSqFt={handleSqFtChange}
                buildingSize={buildingSize}
                setBuildingSize={setBuildingSize}
                additionalNotes={additionalNotes}
                setAdditionalNotes={setAdditionalNotes}
                extractedShipper={shipperData}
                quotationForm={quotationForm}
                extractedDrawing={extractedDrawing}
                pdfFileName={pdfFileName}
                estimateId={estimateId || propEstimateId || pembEstimateId}
                onQuotePreview={handleNavigateToPreview}
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
                onBackToBreakdown={() => setActiveTab("breakdown")}
              />
            </TabsContent>

            {/* Statement of Work Tab */}
            <TabsContent value="sow" className="m-0 outline-none">
              <QuoteSowTab
                buildingSize={buildingSize}
                sqFt={sqFt}
                extractedShipper={shipperData}
                quotationForm={quotationForm}
                extractedDrawing={extractedDrawing}
                pdfFileName={pdfFileName}
                estimateId={estimateId || undefined}
                onBackToBreakdown={() => setActiveTab("breakdown")}
                onQuotePreview={handleNavigateToPreview}
              />
            </TabsContent>

            {/* Margin Tab */}
            <TabsContent value="margin" className="m-0 outline-none">
              <QuoteMarginTab
                extractedShipper={shipperData}
                onTriggerCompute={executeCompute}
              />
            </TabsContent>

            {/* COGS Tab */}
            <TabsContent value="cogs" className="m-0 outline-none">
              <QuoteCogsTab
                extractedShipper={shipperData}
                onTriggerCompute={executeCompute}
              />
            </TabsContent>

            {/* Concrete Tab */}
            <TabsContent value="concrete" className="m-0 outline-none">
              <QuoteConcreteTab
                extractedShipper={shipperData}
                sqFt={sqFt}
                onTriggerCompute={executeCompute}
              />
            </TabsContent>

            {/* Insulation Tab */}
            <TabsContent value="insulation" className="m-0 outline-none">
              <QuoteInsulationTab
                extractedShipper={shipperData}
                sqFt={sqFt}
                onTriggerCompute={executeCompute}
              />
            </TabsContent>

            {/* Contract Tab */}
            <TabsContent value="contract" className="m-0 outline-none">
              <QuoteContractTab
                extractedShipper={shipperData}
                quotationForm={quotationForm}
                extractedDrawing={extractedDrawing}
                sqFt={sqFt}
                pdfFileName={pdfFileName}
                estimateId={estimateId || undefined}
                onBackToBreakdown={() => setActiveTab("breakdown")}
                onQuotePreview={handleNavigateToPreview}
              />
            </TabsContent>
          </Tabs>
        )}
    </Card>
  );
}
