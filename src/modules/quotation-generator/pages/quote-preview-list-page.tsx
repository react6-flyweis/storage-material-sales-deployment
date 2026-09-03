import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  getEstimatesListProvider,
  getEstimateByIdProvider,
  type SaveEstimatePayload,
} from "../estimates.api";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";

type FilterCategory = "all" | "pemb" | "storage" | "custom";

export function QuotePreviewListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState<string | null>(null);
  const [estimatesList, setEstimatesList] = useState<SaveEstimatePayload[]>([]);

  const fetchEstimates = async () => {
    setIsLoading(true);
    try {
      const listRes = await getEstimatesListProvider(40);

      const rawList = listRes.data || listRes;
      const items: SaveEstimatePayload[] = Array.isArray(rawList)
        ? rawList
        : ((rawList as Record<string, unknown>)
            ?.estimates as SaveEstimatePayload[]) ||
          ((rawList as Record<string, unknown>)
            ?.items as SaveEstimatePayload[]) ||
          [];
      setEstimatesList(items);
    } catch (err) {
      console.error("Failed to load estimates for preview hub:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handlePreviewQuote = async (item: SaveEstimatePayload) => {
    try {
      let estimate = item;
      if (item._id) {
        setIsLoadingItem(item._id);
        try {
          const res = await getEstimateByIdProvider(item._id);
          const fetchedData = res.data || res;
          if ((fetchedData as Record<string, unknown>)?.estimate) {
            estimate = (fetchedData as Record<string, unknown>)
              .estimate as SaveEstimatePayload;
          } else if (
            fetchedData &&
            typeof fetchedData === "object" &&
            !Array.isArray(fetchedData)
          ) {
            estimate = fetchedData as SaveEstimatePayload;
          }
        } catch (fetchErr) {
          console.warn(
            "Failed to fetch full estimate detail for preview, using item from list:",
            fetchErr,
          );
          estimate = item;
        }
      }

      const targetEstimateId = estimate._id || item._id;
      if (targetEstimateId) {
        estimate._id = targetEstimateId;
      }

      const isStorage =
        estimate.jobType?.toUpperCase() === "STORAGE" ||
        Boolean(estimate.storageData);

      // If Storage estimate, navigate to storage preview page
      if (isStorage) {
        if (targetEstimateId) {
          useQuotationStore.getState().setStorageEstimateId(targetEstimateId);
        }
        navigate("/quotation/storage-preview", {
          state: {
            storageData: estimate.storageData,
            storagePricing: estimate.storagePricingResult,
            estimateId: targetEstimateId,
            sourceFileName: estimate.sourceFileName || "Storage_COG.xlsx",
            customerLeadName: estimate.leadCompanyName || "",
            customerAddress:
              estimate.cityStateZip || estimate.streetAddress || "",
            customerEmail: estimate.customerEmail || "",
            jobNumber: estimate.jobNumber || "",
            scope: estimate.scope || "Both",
            concreteInclude: estimate.concreteAddon?.include ?? false,
            insulationInclude: estimate.insulationAddon?.include ?? false,
            includeTax: estimate.salesTax?.include ?? true,
            taxRate: estimate.salesTax?.rate ?? 0,
          },
        });
        return;
      }

      if (targetEstimateId) {
        useQuotationStore.getState().setPembEstimateId(targetEstimateId);
      }

      // Standard / PEMB quote preview
      const pricingRes = estimate.pricingResult as
        | Record<string, unknown>
        | undefined;
      const effectiveSqFt = Number(
        estimate.squareFootage ||
          estimate.sf ||
          pricingRes?.totalSqFt ||
          pricingRes?.sf ||
          0,
      );

      const pricingObj = (estimate.pricingResult || {}) as Record<
        string,
        unknown
      >;
      if (!pricingObj.rows && estimate.breakdownRows) {
        pricingObj.rows = estimate.breakdownRows;
      }

      const formattedQuoteDate = estimate.quoteDate
        ? new Date(estimate.quoteDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "";

      navigate("/quotation/quote-preview/view", {
        state: {
          extractedShipper: {
            fileName: estimate.sourceFileName || "Shipper.xlsx",
            sheetCount: estimate.tabSummary?.length || 1,
            totalWeightLbs: Number(
              estimate.totalWeightLbs || (pricingRes?.totWt as number) || 0,
            ),
            squareFootage: effectiveSqFt,
            parsedCategories: estimate.parsedCategories,
            tabSummary: estimate.tabSummary,
            pricing: pricingObj,
            fullQuote:
              estimate.fullQuoteResult ||
              (pricingObj as Record<string, unknown> | undefined),
          },
          extractedDrawing: estimate.extractedDrawingFields
            ? {
                fileName: estimate.sourceFileName || "Drawing.pdf",
                textItemCount: 0,
                filledCount: 0,
                extracted: estimate.extractedDrawingFields,
                rawTextPreview: "",
              }
            : undefined,
          quotationForm: {
            leadName: estimate.leadCompanyName || "",
            email: estimate.customerEmail || "",
            street: estimate.streetAddress || "",
            cityStateZip: estimate.cityStateZip || "",
            buildingSize: estimate.buildingSize || "",
            jobNumber: estimate.jobNumber || "",
            quoteDate: formattedQuoteDate,
          },
          sqFt: String(effectiveSqFt || ""),
          buildingSize: estimate.buildingSize || "",
          pdfFileName: estimate.sourceFileName,
          estimateId: estimate._id,
          isFromList: true,
        },
      });
    } catch (err) {
      console.error("Failed to load estimate for preview:", err);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const filteredQuotes = useMemo(() => {
    return estimatesList.filter((q) => {
      const isStorage =
        q.jobType?.toUpperCase() === "STORAGE" || Boolean(q.storageData);
      const isCustom = q.jobType?.toUpperCase() === "CUSTOM";
      const isPemb = !isStorage && !isCustom;

      if (activeFilter === "pemb" && !isPemb) return false;
      if (activeFilter === "storage" && !isStorage) return false;
      if (activeFilter === "custom" && !isCustom) return false;

      const term = searchTerm.toLowerCase();
      if (!term) return true;

      return (
        (q.leadCompanyName || "").toLowerCase().includes(term) ||
        (q.cityStateZip || "").toLowerCase().includes(term) ||
        (q.jobNumber || "").toLowerCase().includes(term) ||
        (q.buildingSize || "").toLowerCase().includes(term) ||
        (q.sourceFileName || "").toLowerCase().includes(term)
      );
    });
  }, [estimatesList, activeFilter, searchTerm]);

  const pembCount = estimatesList.filter(
    (q) => q.jobType?.toUpperCase() !== "STORAGE" && !q.storageData,
  ).length;
  const storageCount = estimatesList.filter(
    (q) => q.jobType?.toUpperCase() === "STORAGE" || Boolean(q.storageData),
  ).length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-primary text-primary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Quote Preview
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InputGroup className="w-full md:w-72 bg-white border border-slate-300 shadow-xs">
            <InputGroupAddon align="inline-start">
              <Search className="h-4 w-4 text-slate-400" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search package, customer, job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#1e3e66] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Packages ({estimatesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pemb")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "pemb"
                ? "bg-[#2563eb] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            PEMB Buildings ({pembCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("storage")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "storage"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Storage COG ({storageCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredQuotes.length} document packages
        </div>
      </div>

      {/* Document Package Cards Grid / List */}
      <div className="space-y-4">
        {isLoading && estimatesList.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">
                Loading quotation packages...
              </p>
            </div>
          </Card>
        ) : filteredQuotes.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
            <p className="text-sm font-medium text-slate-700">
              No quotation packages match your current filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create a new PEMB or Storage quote to view its generated preview
              package.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const isStorage =
                quote.jobType?.toUpperCase() === "STORAGE" ||
                Boolean(quote.storageData);
              const pricingRes = (quote.pricingResult ||
                quote.storagePricingResult) as
                | Record<string, unknown>
                | undefined;
              const fullQuote = quote.fullQuoteResult as
                | Record<string, unknown>
                | undefined;

              const totSell =
                Number(
                  quote.grandTotal ??
                    quote.totalSell ??
                    fullQuote?.grandTotal ??
                    pricingRes?.totSell ??
                    pricingRes?.grandTotal,
                ) || 0;
              const prof =
                Number(
                  quote.profit ?? fullQuote?.totalProfit ?? pricingRes?.profit,
                ) || 0;
              const marginPct =
                Number(
                  quote.marginPercent ??
                    fullQuote?.grandMargin ??
                    pricingRes?.profPct ??
                    pricingRes?.marginPercent,
                ) || 0;
              const effectiveSqFt = Number(
                quote.squareFootage ||
                  quote.sf ||
                  pricingRes?.totalSqFt ||
                  pricingRes?.sf ||
                  0,
              );
              const sfPrice =
                Number(
                  quote.pricePerSf ??
                    fullQuote?.pricePerSf ??
                    pricingRes?.sfPrice ??
                    pricingRes?.pricePerSf,
                ) ||
                (totSell && effectiveSqFt
                  ? (totSell / effectiveSqFt).toFixed(2)
                  : 0);

              const storageBuildings = (
                quote.storageData as { buildings?: unknown[] } | undefined
              )?.buildings;
              const displayBuilding = isStorage
                ? `${storageBuildings?.length || 1} Storage Building${
                    (storageBuildings?.length || 1) > 1 ? "s" : ""
                  }`
                : quote.buildingSize || "Building";

              const formattedDate =
                quote.quoteDate || quote.createdAt
                  ? new Date(
                      quote.quoteDate || quote.createdAt || "",
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

              const quoteNumber =
                quote.conversion?.quoteNumber || quote.quoteNumber;
              const effectiveWorkflowStatus =
                quote.conversion?.workflowStatus ||
                quote.workflowStatus ||
                quote.approval?.status ||
                quote.status ||
                "draft";

              return (
                <div
                  key={quote._id || String(quote.jobNumber || Math.random())}
                  className="bg-[#f2fcf6] border-l-4 border-l-[#22c55e] border border-emerald-200/60 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-stretch justify-between gap-4 transition-all hover:shadow-sm"
                >
                  {/* Left Side Quote Details */}
                  <div className="flex flex-col justify-between space-y-1.5 min-w-0">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {quote.leadCompanyName || "Customer Quote"}
                      </h3>
                      <div className="text-xs text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-1.5">
                        {(() => {
                          switch (effectiveWorkflowStatus) {
                            case "pending_approval":
                              return (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  Pending Approval
                                </span>
                              );
                            case "approved":
                              return (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  Approved
                                </span>
                              );
                            case "rejected":
                              return (
                                <span
                                  className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]"
                                  title={
                                    quote.approval?.rejectionReason ||
                                    "Approval Rejected"
                                  }
                                >
                                  Rejected
                                </span>
                              );
                            case "sent":
                              return (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  Sent
                                </span>
                              );
                            default:
                              return (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                  Draft
                                </span>
                              );
                          }
                        })()}

                        {quoteNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                            Quote #{quoteNumber}
                          </span>
                        )}

                        <span>·</span>
                        <span>{quote.scope?.toUpperCase() || "SUPPLY"}</span>
                        <span>·</span>
                        <span>{effectiveSqFt.toLocaleString()} SF</span>
                        <span>·</span>
                        <span>{displayBuilding}</span>
                        <span>·</span>
                        <span>
                          {quote.cityStateZip ||
                            quote.streetAddress ||
                            "Location"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#2563eb] pt-1">
                      Job #{quote.jobNumber || "Draft"} ·{" "}
                      {quote.sourceFileName ||
                        (isStorage ? "Storage_COG.xlsx" : "Drawing.pdf")}
                      {formattedDate ? ` · ${formattedDate}` : ""}
                    </div>
                  </div>

                  {/* Right Side Quote Metrics & Action Buttons */}
                  <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                    {/* Top Right Price Metrics Stack */}
                    <div className="text-right leading-tight space-y-0.5">
                      <div className="text-sm font-bold text-[#2563eb]">
                        ${totSell.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500">
                        ${sfPrice}/SF
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs font-semibold text-[#16a34a]">
                        <span>💰</span>
                        <span>${prof.toLocaleString()}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#16a34a]">
                        {typeof marginPct === "number"
                          ? marginPct.toFixed(1)
                          : marginPct}
                        %
                      </div>
                    </div>

                    {/* Bottom Right Badge & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 mr-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold tracking-wide uppercase ${
                            isStorage
                              ? "bg-amber-100 text-amber-900"
                              : "bg-[#dbeafe] text-[#2563eb]"
                          }`}
                        >
                          {isStorage
                            ? "STORAGE COG"
                            : quote.jobType?.toUpperCase() || "PEMB"}
                        </span>
                        <span className="text-xs text-slate-500 font-normal hidden sm:inline">
                          {isStorage ? "Mini storage" : "Vendor blend"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handlePreviewQuote(quote)}
                        disabled={isLoadingItem === quote._id}
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-8 px-3.5 text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        {isLoadingItem === quote._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuotePreviewListPage;
