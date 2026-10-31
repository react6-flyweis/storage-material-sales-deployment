import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  FolderUp,
  Loader2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  downloadPdfProvider,
  saveEstimateProvider,
  getEstimateByIdProvider,
  type PreviewDocumentRequest,
  type SaveEstimatePayload,
} from "../estimates.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { hydrateEstimateIntoStore } from "../hooks/use-load-estimate-to-editor";
import type {
  StorageData,
  StoragePricing,
} from "../components/storage-preview-document";

function fmt(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + Math.round(num).toLocaleString();
}

export function StoragePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const {
    companyBrand: storeCompanyBrand,
    setCompanyBrand,
    scope: storeScope,
    concreteInclude: storeConcreteInclude,
    insulationInclude: storeInsulationInclude,
    includeTax: storeIncludeTax,
    taxRate: storeTaxRate,
    taxZip: storeTaxZip,
    storageData: storeStorageData,
    storagePricing: storeStoragePricing,
    storageEstimateId: storeStorageEstimateId,
    setStorageEstimateId,
    storageCustomerLeadName: storeCustomerLeadName,
    storageCustomerAddress: storeCustomerAddress,
    storageCustomerEmail: storeCustomerEmail,
    storageJobNumber: storeJobNumber,
    storageDrawings,
    setStorageDrawings,
  } = useQuotationStore();

  const navState = (location.state || {}) as {
    storageData?: StorageData;
    storagePricing?: StoragePricing;
    estimateId?: string;
    companyBrand?: "SBD" | "SM";
    sourceFileName?: string;
    customerLeadName?: string;
    customerAddress?: string;
    customerEmail?: string;
    jobNumber?: string;
    scope?: "Supply" | "Install" | "Both" | string;
    concreteInclude?: boolean;
    insulationInclude?: boolean;
    includeTax?: boolean;
    taxRate?: number;
    taxZip?: string;
    salesTax?: {
      rate?: number;
      taxRate?: number;
      include?: boolean;
      includeTax?: boolean;
      zip?: string;
      taxZip?: string;
    };
    drawingAttachments?: Array<{
      name?: string;
      fileBase64?: string;
      data?: string;
      includeInQuote?: boolean;
    }>;
    drawings?: Array<{
      name?: string;
      fileBase64?: string;
      data?: string;
      includeInQuote?: boolean;
    }>;
  };

  useEffect(() => {
    const navDrawings = navState.drawingAttachments || navState.drawings;
    if (
      navDrawings?.length &&
      (!storageDrawings || storageDrawings.length === 0)
    ) {
      setStorageDrawings(
        navDrawings.map((d) => ({
          name: d.name || "Drawing",
          data: d.fileBase64 || d.data || "",
          includeInPackage: d.includeInQuote !== false,
        })),
      );
    }
  }, [
    navState.drawingAttachments,
    navState.drawings,
    storageDrawings,
    setStorageDrawings,
  ]);

  const storageData =
    (storeStorageData as StorageData | null) || navState.storageData;
  const storagePricing =
    (storeStoragePricing as StoragePricing | null) || navState.storagePricing;
  const [estimateId, setEstimateId] = useState<string | null>(
    navState.estimateId || storeStorageEstimateId || null,
  );

  useEffect(() => {
    const eid = navState.estimateId || storeStorageEstimateId;
    if (eid) {
      setEstimateId(eid);
      setStorageEstimateId(eid);
      getEstimateByIdProvider(eid)
        .then((res) => {
          const estData = (res?.data?.estimate ||
            res?.estimate ||
            res?.data ||
            res) as SaveEstimatePayload | undefined;
          if (
            estData &&
            (estData._id ||
              estData.jobType ||
              estData.storageData ||
              estData.parsedCategories)
          ) {
            hydrateEstimateIntoStore(estData, eid);
          }
        })
        .catch((err) => {
          console.warn("Failed to load storage estimate for preview:", err);
        });
    }
  }, [navState.estimateId, storeStorageEstimateId, setStorageEstimateId]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);

  const isEditing = Boolean(
    estimateId || storeStorageEstimateId || navState.estimateId,
  );

  const customerLeadName =
    storeCustomerLeadName ||
    navState.customerLeadName ||
    storageData?.project?.customer ||
    "Valued Customer";
  const customerAddress =
    storeCustomerAddress ||
    navState.customerAddress ||
    storageData?.project?.location ||
    "Project Location";
  const customerEmail = storeCustomerEmail || navState.customerEmail || "";
  const jobNumber =
    storeJobNumber ||
    navState.jobNumber ||
    storageData?.project?.jobNumber ||
    "8098";
  const scope = storeScope || navState.scope || "Both";
  const concreteInclude =
    storeConcreteInclude ?? navState.concreteInclude ?? false;
  const insulationInclude =
    storeInsulationInclude ?? navState.insulationInclude ?? false;
  const includeTax = storeIncludeTax ?? navState.includeTax ?? true;
  const taxRate = storeTaxRate ?? navState.taxRate ?? 0;
  const companyBrand = storeCompanyBrand || navState.companyBrand || "SM";

  const quoteDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const grandTotal = Number(
    storagePricing?.grandTotal ??
      storagePricing?.totSell ??
      storagePricing?.totalSell ??
      0,
  );
  const totalSellFormatted = fmt(grandTotal);

  const handleScrollToPreview = () => {
    previewSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeCustomer = (customerLeadName || "Storage_Quote").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `Storage_Quote_${safeCustomer}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const activeDrawings = storageDrawings.filter((d) => d.includeInPackage !== false);
      const drawingAttachments = activeDrawings.map((d) => ({
        name: d.name,
        fileBase64: d.data?.includes(",") ? d.data.split(",")[1] : d.data,
        includeInQuote: true,
      }));

      const activeEstId =
        estimateId || storeStorageEstimateId || navState.estimateId || undefined;

      const payload: PreviewDocumentRequest = {
        jobType: "Storage",
        companyBrand,
        estimateId: activeEstId,
        scope:
          (scope || "Both").toLowerCase() === "supply"
            ? "Supply"
            : (scope || "Both").toLowerCase() === "install"
            ? "Install"
            : "Both",
        leadCompanyName: customerLeadName || "Customer",
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        jobNumber: jobNumber || "8098",
        buildingSize:
          storageData?.buildings?.map((b) => `${b.width}x${b.length}`).join(", ") ||
          "Storage Complex",
        squareFootage:
          Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
          storageData?.buildings?.reduce(
            (acc, b) =>
              acc +
              (Number(b.sqft || b.squareFootage) ||
                Number(b.width || 0) * Number(b.length || 0)),
            0
          ) ||
          0,
        sf:
          Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
          storageData?.buildings?.reduce(
            (acc, b) =>
              acc +
              (Number(b.sqft || b.squareFootage) ||
                Number(b.width || 0) * Number(b.length || 0)),
            0
          ) ||
          0,
        pricingResult: storagePricing as Record<string, unknown>,
        storagePricingResult: storagePricing as Record<string, unknown>,
        storagePricing: storagePricing as Record<string, unknown>,
        storageData: storageData as Record<string, unknown>,
        concreteAddon: {
          include: navState.concreteInclude ?? storeConcreteInclude,
        },
        insulationAddon: {
          include: navState.insulationInclude ?? storeInsulationInclude,
        },
        salesTax: {
          include: navState.includeTax ?? storeIncludeTax,
          includeTax: navState.includeTax ?? storeIncludeTax,
          rate: navState.taxRate ?? storeTaxRate,
          taxRate: navState.taxRate ?? storeTaxRate,
          zip: navState.taxZip ?? storeTaxZip,
          taxZip: navState.taxZip ?? storeTaxZip,
        },
        taxRate: navState.taxRate ?? storeTaxRate,
        includeTax: navState.includeTax ?? storeIncludeTax,
        taxZip: navState.taxZip ?? storeTaxZip,
        zip: navState.taxZip ?? storeTaxZip,
        drawingAttachments,
        sections: drawingAttachments.length > 0
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
        format: "pdf",
      };

      const res = await downloadPdfProvider(payload, activeEstId);
      const pdfData = res?.data || res;

      if (pdfData?.fileBase64) {
        downloadPdfFromBase64(
          pdfData.fileBase64,
          pdfData.fileName || `Storage_Quote_${(customerLeadName || "Customer").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
          pdfData.mimeType || "application/pdf"
        );
        toast.success("PDF downloaded successfully");
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error("Failed to generate PDF via server API:", err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveToHistory = async () => {
    setIsSavingEstimate(true);
    try {
      const activeEstId =
        estimateId ||
        storeStorageEstimateId ||
        navState.estimateId ||
        undefined;
      const activeDrawings = storageDrawings.filter(
        (d) => d.includeInPackage !== false,
      );
      const res = await saveEstimateProvider(
        {
          _id: activeEstId,
          jobType: "Storage",
          companyBrand,
          scope:
            (scope || "Both").toLowerCase() === "supply"
              ? "Supply"
              : (scope || "Both").toLowerCase() === "install"
                ? "Install"
                : "Both",
          leadCompanyName: customerLeadName,
          customerEmail,
          streetAddress: customerAddress,
          cityStateZip: customerAddress,
          jobNumber,
          sourceFileName: navState.sourceFileName || "Storage_COG.xlsx",
          storageData: storageData as Record<string, unknown>,
          drawingAttachments: activeDrawings.map((d) => ({
            name: d.name,
            fileBase64: d.data,
            includeInQuote: true,
          })),
          status: "draft",
        },
        activeEstId,
      );

      const data = res.data || res;
      if (res && (res as { success?: boolean }).success === false) {
        throw new Error(res.message || "Failed to save storage estimate");
      }
      const savedId = data?.estimate?._id || data?._id || activeEstId;
      toast.success("Storage estimate saved successfully");
      if (savedId) {
        setEstimateId(savedId);
        setStorageEstimateId(savedId);
        navigate(`/quotation/history/${savedId}`);
        return;
      }
      navigate("/quotation/history");
    } catch (err) {
      console.error("Failed to save storage estimate:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to save storage estimate. Please try again.",
      );
      toast.error(msg);
    } finally {
      setIsSavingEstimate(false);
    }
  };

  const activeDrawings = useMemo(
    () => (storageDrawings || []).filter((d) => d.includeInPackage !== false),
    [storageDrawings],
  );

  const previewPayload: PreviewDocumentRequest = useMemo(
    () => ({
      jobType: "Storage",
      companyBrand,
      estimateId:
        estimateId ||
        storeStorageEstimateId ||
        navState.estimateId ||
        undefined,
      scope:
        (scope || "Both").toLowerCase() === "supply"
          ? "Supply"
          : (scope || "Both").toLowerCase() === "install"
            ? "Install"
            : "Both",
      leadCompanyName: customerLeadName || "Customer",
      customerEmail,
      streetAddress: customerAddress,
      cityStateZip: customerAddress,
      jobNumber: jobNumber || "8098",
      buildingSize:
        storageData?.buildings
          ?.map((b) => `${b.width}x${b.length}`)
          .join(", ") || "Storage Complex",
      squareFootage:
        Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
        storageData?.buildings?.reduce(
          (acc, b) =>
            acc +
            (Number(b.sqft || b.squareFootage) ||
              Number(b.width || 0) * Number(b.length || 0)),
          0,
        ) ||
        0,
      sf:
        Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
        storageData?.buildings?.reduce(
          (acc, b) =>
            acc +
            (Number(b.sqft || b.squareFootage) ||
              Number(b.width || 0) * Number(b.length || 0)),
          0,
        ) ||
        0,
      pricingResult: storagePricing as Record<string, unknown>,
      storagePricingResult: storagePricing as Record<string, unknown>,
      storagePricing: storagePricing as Record<string, unknown>,
      storageData: storageData as Record<string, unknown>,
      concreteAddon: {
        include: concreteInclude,
      },
      insulationAddon: {
        include: insulationInclude,
      },
      salesTax: {
        include: includeTax,
        includeTax,
        rate: taxRate,
        taxRate,
        zip: storeTaxZip,
        taxZip: storeTaxZip,
      },
      taxRate,
      includeTax,
      taxZip: storeTaxZip,
      zip: storeTaxZip,
      contract: {
        customer: customerLeadName,
        address: customerAddress,
        city: customerAddress,
        email: customerEmail,
        date: quoteDate,
        deposit: "forty-percent (40%)",
        type:
          scope?.toLowerCase() === "both"
            ? "both"
            : scope?.toLowerCase() === "install"
              ? "install"
              : "supply",
        value: totalSellFormatted,
      },
      drawingAttachments: activeDrawings.map((d) => ({
        name: d.name,
        fileBase64: d.data?.includes(",") ? d.data.split(",")[1] : d.data,
        includeInQuote: true,
      })),
      sections:
        activeDrawings.length > 0
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
    }),
    [
      estimateId,
      companyBrand,
      navState.estimateId,
      storeStorageEstimateId,
      scope,
      customerLeadName,
      customerEmail,
      customerAddress,
      jobNumber,
      storageData,
      storagePricing,
      concreteInclude,
      insulationInclude,
      includeTax,
      taxRate,
      quoteDate,
      totalSellFormatted,
      activeDrawings,
    ],
  );

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: previewPayload,
  });

  // const handleRefreshPreview = async () => {
  //   setIsRefreshing(true);
  //   try {
  //     await refetchPreview();
  //   } catch (err) {
  //     console.warn("Refresh preview notice:", err);
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStorageDrawings([
          ...storageDrawings,
          {
            name: file.name,
            data: (ev.target?.result as string) || "",
            includeInPackage: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStorageDrawings([
          ...storageDrawings,
          {
            name: file.name,
            data: (ev.target?.result as string) || "",
            includeInPackage: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearAll = () => {
    setStorageDrawings([]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Storage Quote Preview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Mini Storage Assembled Package — Quote · SOW · Contract · Layout
              Plans
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Logo:</span>
            <div className="grid grid-cols-2 gap-1 w-52">
              {[
                { label: "Steel Building", value: "SBD" as const },
                { label: "Storage Material", value: "SM" as const },
              ].map((item) => {
                const isActive = companyBrand === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCompanyBrand(item.value)}
                    className={cn(
                      "py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer text-center",
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {isDownloadingPdf ? "Generating PDF..." : "Generate & Print PDF"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveToHistory}
            disabled={isSavingEstimate}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isSavingEstimate && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {isSavingEstimate
              ? isEditing
                ? "Updating Changes..."
                : "Saving..."
              : isEditing
                ? "Update Changes"
                : "Save to History"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 w-full max-w-5xl print:max-w-none print:w-full">
        {/* Building drawings & plans Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-xl no-print">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Building drawings & layout plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload layout plans or elevations — they will be included in the
                server preview & final PDF.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer bg-white"
              >
                Clear All ({storageDrawings.length})
              </Button>
              <Button
                type="button"
                onClick={handleScrollToPreview}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                Preview assembled PDF ↓
              </Button>
            </div>
          </div>

          {/* PDF / Image Dropzone Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative border-2 border-dashed border-blue-400 bg-[#E6F4EA] rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors"
          >
            <label className="cursor-pointer flex flex-col items-center">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md">
                <FolderUp className="h-6 w-6" />
              </div>

              {storageDrawings.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                    <span>✓</span>
                    <span>{storageDrawings.length} drawing(s) attached</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Click to browse or drop more drawings (PDF or Images)
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    Drop drawings or layout plans here or click to browse
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Unit mix layouts, anchor bolt plans, elevations (PDF or
                    Images)
                  </p>
                </div>
              )}
            </label>
          </div>
        </Card>

        {/* Server Assembled Storage Preview Document */}
        <div ref={previewSectionRef} id="preview-section">
          <ServerDocumentPreview
            html={serverPreviewHtml}
            isLoading={isPreviewLoading}
            error={previewError}
            onRetry={refetchPreview}
            title={`Storage Package — ${customerLeadName || "Full Assembled Package"}`}
            minHeight={800}
          />
        </div>
      </div>
    </div>
  );
}

export default StoragePreviewPage;
