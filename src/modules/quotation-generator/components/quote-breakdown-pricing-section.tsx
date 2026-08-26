import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { FileSpreadsheet } from "lucide-react";
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
  onShipperExtracted?: (data: ExtractShipperResponseData) => void;
}

export function QuoteBreakdownPricingSection({
  extractedShipper: initialShipper,
  quotationForm,
  extractedDrawing,
  pdfFileName,
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
    insulationInclude,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationCogsSf,
    insulationMarginPct,
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
    pembEstimateId,
    setPembEstimateId,
  } = useQuotationStore();

  const effectiveInitial = initialShipper || pembExtractedShipper || undefined;

  const [estimateId, setEstimateId] = useState<string | null>(
    pembEstimateId || null
  );

  useEffect(() => {
    if (pembEstimateId) {
      setEstimateId(pembEstimateId);
    }
  }, [pembEstimateId]);

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
    }
  }, [initialShipper, pembExtractedShipper]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const navigate = useNavigate();

  const handleNavigateToPreview = useCallback(() => {
    navigate("/quotation/quote-preview/view", {
      state: {
        quotationForm,
        extractedDrawing,
        extractedShipper: shipperData,
        sqFt,
        buildingSize,
        additionalNotes,
        pdfFileName,
      },
    });
  }, [navigate, quotationForm, extractedDrawing, shipperData, sqFt, buildingSize, additionalNotes, pdfFileName]);

  const handleSaveDraft = useCallback(async () => {
    if (!shipperData?.parsedCategories) return;
    setIsSavingDraft(true);
    try {
      const parsedSqFt = parseFloat(sqFt) || shipperData.squareFootage || 0;
      const cogsCostVal = parseFloat(cogsCostInput) || undefined;
      const cogsSellVal = parseFloat(cogsFixedSellPrice) || undefined;
      const marginLaborVal = parseFloat(marginLaborOverride) || undefined;
      const marginTargetVal = parseFloat(marginTargetMargin) || undefined;
      const marginSellVal = parseFloat(marginFixedSellOverride) || undefined;

      const res = await saveEstimateProvider(
        {
          _id: estimateId || undefined,
          jobType,
          scope: normalizeScope(scope),
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
          parsedCategories: shipperData.parsedCategories,
          tabSummary: shipperData.tabSummary,
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
        estimateId || undefined
      );

      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id;
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
    shipperData,
    jobType,
    scope,
    quotationForm,
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
    insulationInclude,
    insulationCogsSf,
    insulationMarginPct,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
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
      if (!shipperData?.parsedCategories) return;

      setIsComputing(true);
      try {
        const parsedSqFt = parseFloat(sqFt) || shipperData.squareFootage || 0;
        const cogsCostVal = parseFloat(cogsCostInput) || undefined;
        const cogsSellVal = parseFloat(cogsFixedSellPrice) || undefined;
        const marginLaborVal = parseFloat(marginLaborOverride) || undefined;
        const marginTargetVal = parseFloat(marginTargetMargin) || undefined;
        const marginSellVal = parseFloat(marginFixedSellOverride) || undefined;

        const payload: ComputeEstimateRequest = {
          parsedCategories: shipperData.parsedCategories,
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
          ...overrides,
        };

        const res = await computeEstimateProvider(payload);

        if (res) {
          const data = res.data || res;
          const weightByCategory = data.weightByCategory || res.weightByCategory;
          const pricing = data.pricing || res.pricing;
          const fullQuote = data.fullQuote || res.fullQuote;
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
      shipperData?.parsedCategories,
      shipperData?.squareFootage,
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
      cogsCostInput,
      cogsCostAdjustPercent,
      cogsMaterialMargin,
      cogsFixedSellPrice,
      marginOverrideApplied,
      marginLaborOverride,
      marginTargetMargin,
      marginFixedSellOverride,
      setIsComputing,
      setShipperData,
    ]
  );

  // Automatically trigger debounced re-compute when settings change
  useEffect(() => {
    if (!shipperData?.parsedCategories) return;

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
  }, [executeCompute, shipperData?.parsedCategories]);

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
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Step 2 — Upload Xshipper file (.xlsx)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc.
            </p>
          </div>
        </div>
      </CardHeader>

      {/* File Specs Upload Dropzone with Parsing State */}
      <FileDropzoneCard
        dropText="Drop your Xshipper file here"
        subDropText="Or click to browse .xlsx files"
        extraInfoText="All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc."
        accept=".xlsx, .xls"
        fileIcon="xlsx"
        selectedFile={file}
        onFileSelect={handleFileSelect}
      />

      {isParsing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-xs text-blue-700 flex items-center justify-center gap-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Parsing Excel sheets and extracting material breakdown pricing...</span>
        </div>
      )}

      {isComputing && !isParsing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center text-xs text-indigo-700 flex items-center justify-center gap-2 animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Re-computing pricing estimates...</span>
        </div>
      )}

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
                estimateId={estimateId}
                onQuotePreview={handleNavigateToPreview}
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
              />
            </TabsContent>

            {/* Statement of Work Tab */}
            <TabsContent value="sow" className="m-0 outline-none">
              <QuoteSowTab
                buildingSize={buildingSize}
                sqFt={sqFt}
                extractedShipper={shipperData}
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
                onBackToBreakdown={() => setActiveTab("breakdown")}
                onQuotePreview={handleNavigateToPreview}
              />
            </TabsContent>
          </Tabs>
        )}
    </Card>
  );
}
