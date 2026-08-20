import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
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
  type ExtractShipperResponseData,
  type ExtractDrawingResponseData,
  type ComputeEstimateRequest,
} from "../estimates.api";
import { useQuotationStore } from "@/modules/quotation/quotation.store";

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

function normalizeScope(scope: string): string {
  return (scope || "both").toLowerCase();
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
}

export function QuoteBreakdownPricingSection({
  extractedShipper: initialShipper,
  quotationForm,
  extractedDrawing,
  pdfFileName,
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
  } = useQuotationStore();

  useEffect(() => {
    if (initialShipper) {
      setShipperData(initialShipper);
      setFile({ name: initialShipper.fileName, size: `${initialShipper.totalWeightLbs} lbs` });
    }
  }, [initialShipper]);

  // Page-specific local state
  const [sqFt, setSqFt] = useState(
    initialShipper?.squareFootage ? String(initialShipper.squareFootage) : ""
  );
  const [buildingSize, setBuildingSize] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const navigate = useNavigate();

  const handleNavigateToPreview = useCallback(() => {
    navigate("/quotation/quote-preview", {
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

  const computeAbortRef = useRef<number | null>(null);

  // Compute estimate function
  const executeCompute = useCallback(
    async (overrides?: Partial<ComputeEstimateRequest>) => {
      if (!shipperData?.parsedCategories) return;

      setIsComputing(true);
      try {
        const payload: ComputeEstimateRequest = {
          parsedCategories: shipperData.parsedCategories,
          jobType,
          scope: normalizeScope(scope),
          squareFootage: parseFloat(sqFt) || shipperData.squareFootage || 0,
          blendPct: blendPercentage,
          roof: normalizeRoof(roofType),
          install: installDifficulty || "medium",
          installCostPerSf: installCost,
          sellPerSf: installSell,
          concrete: {
            include: concreteInclude,
            costSF: concreteCostSf,
            marginPct: concreteMarginPct,
            slabThickness: concreteSlabThickness,
            psiRating: concretePsiRating,
          },
          insulation: {
            include: insulationInclude,
            ...(insulationInclude
              ? {
                  system: insulationSystem,
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
                costInput: parseFloat(cogsCostInput) || undefined,
                costAdjustPercent: cogsCostAdjustPercent,
                materialMargin: cogsMaterialMargin,
                fixedSellPrice: parseFloat(cogsFixedSellPrice) || undefined,
              }
            : {
                applied: false,
              },
          marginOverride: marginOverrideApplied
            ? {
                applied: true,
                laborOverride: parseFloat(marginLaborOverride) || undefined,
                targetMargin: parseFloat(marginTargetMargin) || undefined,
                fixedSellOverride: parseFloat(marginFixedSellOverride) || undefined,
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
          if (weightByCategory || pricing) {
            setShipperData((prev) =>
              prev
                ? {
                    ...prev,
                    ...(weightByCategory ? { weightByCategory } : {}),
                    ...(pricing ? { pricing } : {}),
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
          install: installDifficulty || "medium",
          blendPct: blendPercentage,
          installCostPerSf: installCost,
          sellPerSf: installSell,
        });
        if (res.success && res.data) {
          setShipperData(res.data);
          if (res.data.squareFootage) {
            setSqFt(String(res.data.squareFootage));
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

      {/* Tabs Navigation using Shadcn UI Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
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
          />
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote" className="m-0 outline-none">
          <QuoteDetailTab
            sqFt={sqFt}
            setSqFt={setSqFt}
            buildingSize={buildingSize}
            setBuildingSize={setBuildingSize}
            additionalNotes={additionalNotes}
            setAdditionalNotes={setAdditionalNotes}
            extractedShipper={shipperData}
            onQuotePreview={handleNavigateToPreview}
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
            onBackToBreakdown={() => setActiveTab("breakdown")}
            onQuotePreview={handleNavigateToPreview}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
