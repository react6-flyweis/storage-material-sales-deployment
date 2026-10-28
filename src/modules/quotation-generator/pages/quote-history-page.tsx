import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  FolderOpen,
  Banknote,
  Milestone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/common/confirm-modal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import {
  getEstimatesListProvider,
  getHistorySummaryProvider,
  deleteEstimateProvider,
  type SaveEstimatePayload,
} from "../estimates.api";
import { resolveQuotationLifecycle } from "@/modules/quotations/quotations.api";
import {
  ChangeOrderModal,
  RequestDepositModal,
  MilestonePaymentsModal,
} from "../components";
import { useLoadEstimateToEditor } from "../hooks/use-load-estimate-to-editor";
import {
  formatCurrency2,
  formatPercent2,
  formatSfPrice2,
  formatNumber2,
} from "../utils/quote-formatting";

export function QuoteHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [estimatesList, setEstimatesList] = useState<SaveEstimatePayload[]>([]);
  const [summaryData, setSummaryData] = useState<{
    totalQuotes?: number;
    totalValue?: number;
    totalProfit?: number;
    avgMargin?: number | string;
    avgMarginPct?: number | string;
    margin?: number | string;
    totalSqFt?: number;
    totalSf?: number;
    avgQuote?: number;
    [key: string]: unknown;
  } | null>(null);

  // Debounce search term to avoid excessive requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const summaryRes = await getHistorySummaryProvider().catch(() => null);
      if (summaryRes) {
        const rawSummary = (summaryRes.data || summaryRes) as Record<
          string,
          unknown
        >;
        const allTime =
          (rawSummary?.allTime as Record<string, unknown>) || rawSummary;
        setSummaryData({
          ...rawSummary,
          ...allTime,
        });
      }
    } catch (err) {
      console.error("Failed to load history summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const listRes = await getEstimatesListProvider({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
      });

      const estimates = listRes.data?.estimates ?? [];
      const total = listRes.data?.total ?? 0;
      setEstimatesList(estimates);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to load history list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // const handleClearAll = () => {
  //   setEstimatesList([]);
  //   setTotalItems(0);
  // };


  const { loadAndEdit, loadingId: hookLoadingId } = useLoadEstimateToEditor();

  const handleLoadAndEdit = async (item: SaveEstimatePayload) => {
    try {
      await loadAndEdit(item);
    } catch (err) {
      console.error("Failed to load estimate detail:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to load estimate. Please try again.",
      );
      toast.error(msg);
    }
  };

  const handlePreviewQuote = (item: SaveEstimatePayload) => {
    if (item._id) {
      navigate(`/quotation/history/${item._id}`);
    }
  };

  const [activeChangeOrderQuote, setActiveChangeOrderQuote] =
    useState<SaveEstimatePayload | null>(null);
  const [activeDepositQuote, setActiveDepositQuote] =
    useState<SaveEstimatePayload | null>(null);
  const [activeMilestoneQuote, setActiveMilestoneQuote] =
    useState<SaveEstimatePayload | null>(null);
  const [quoteToDelete, setQuoteToDelete] =
    useState<SaveEstimatePayload | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteEstimateProvider(quoteToDelete._id);
      setEstimatesList((prev) => prev.filter((q) => q._id !== quoteToDelete._id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      toast.success("Estimate deleted successfully");
      setQuoteToDelete(null);
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete estimate:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to delete estimate. Please try again.",
      );
      toast.error(msg);
      fetchHistory();
    } finally {
      setIsDeleting(false);
    }
  };

  const totalQuotesCount = summaryData?.totalQuotes ?? 0;
  const totalPipelineVal = summaryData?.totalValue ?? 0;
  const totalProfitVal = summaryData?.totalProfit ?? 0;
  const avgMarginVal =
    summaryData?.avgMargin ??
    summaryData?.avgMarginPct ??
    summaryData?.margin ??
    "23.1";
  const totalSfVal = summaryData?.totalSqFt ?? summaryData?.totalSf ?? 0;
  const avgQuoteVal =
    summaryData?.avgQuote ??
    (totalQuotesCount > 0 && totalPipelineVal > 0
      ? totalPipelineVal / totalQuotesCount
      : 0);

  const formattedPipelineVal =
    totalPipelineVal > 1000
      ? `$${(totalPipelineVal / 1000).toFixed(0)}k`
      : `$${totalPipelineVal.toLocaleString()}`;
  const formattedProfitVal =
    totalProfitVal > 1000
      ? `$${(totalProfitVal / 1000).toFixed(0)}k`
      : `$${totalProfitVal.toLocaleString()}`;

  return (
    <div className="space-y-6 p-6">
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
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Quote Library
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              All saved quotes — click any quote to reload it
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InputGroup className="w-full md:w-64 bg-white border border-slate-400">
            <InputGroupAddon align="inline-start">
              <Search className="h-4 w-4 text-slate-400" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search customer, location, job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          {/* <Button
            type="button"
            variant="outline"
            onClick={() => {
              fetchHistory();
              fetchSummary();
            }}
            disabled={isLoading || isSummaryLoading}
            className="border border-slate-400 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading || isSummaryLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            className="border border-slate-400 cursor-pointer"
          >
            Clear All
          </Button> */}
        </div>
      </div>

      {/* Top Analytics KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5 items-stretch">
        {/* THIS MONTH Card */}
        <Card className="p-4 bg-white border-2 border-blue-500 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              THIS MONTH
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              August 2026
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-7 w-28 bg-slate-200 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">
                {formattedPipelineVal}
              </div>
              <div className="text-xs font-bold text-[#1d5bd8]">
                {avgMarginVal}% avg margin
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {formattedProfitVal} profit
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {totalQuotesCount} quotes
              </div>
            </div>
          )}
        </Card>

        {/* Q3 2026 Card */}
        <Card className="p-4 bg-white border-2 border-emerald-500 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              Q3 2026
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              This Quarter
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-7 w-28 bg-slate-200 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">
                {formattedPipelineVal}
              </div>
              <div className="text-xs font-bold text-[#1d5bd8]">
                {avgMarginVal}% avg margin
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {formattedProfitVal} profit
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {totalQuotesCount} quotes
              </div>
            </div>
          )}
        </Card>

        {/* YTD 2026 Card */}
        <Card className="p-4 bg-white border-2 border-amber-400 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              YTD 2026
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Year to Date
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-7 w-28 bg-slate-200 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">
                {formattedPipelineVal}
              </div>
              <div className="text-xs font-bold text-[#1d5bd8]">
                {avgMarginVal}% avg margin
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {formattedProfitVal} profit
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {totalQuotesCount} quotes
              </div>
            </div>
          )}
        </Card>

        {/* PROFIT BY CATEGORY Card */}
        <Card className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col h-44">
          <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
            PROFIT BY CATEGORY
          </div>
          {isSummaryLoading ? (
            <div className="flex-1 flex items-center pt-2 animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
          ) : (
            <div className="flex-1 flex items-center pt-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                <span className="w-4 h-4 bg-[#1d64d8] rounded-xs shrink-0 inline-block" />
                <span>Metal/Bldgs 100%</span>
              </div>
            </div>
          )}
        </Card>

        {/* SUMMARY Card */}
        <Card className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
            SUMMARY
          </div>
          {isSummaryLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                <div>
                  <div className="h-2.5 w-14 bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-10 bg-slate-200 rounded" />
                </div>
                <div>
                  <div className="h-2.5 w-14 bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                </div>
                <div>
                  <div className="h-2.5 w-14 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-10 bg-slate-200 rounded" />
                </div>
                <div>
                  <div className="h-2.5 w-14 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                </div>
              </div>
              <div>
                <div className="h-2.5 w-24 bg-slate-200 rounded mb-1" />
                <div className="h-5 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Total Quotes
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                    {totalQuotesCount}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Avg Quote
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                    {avgQuoteVal > 0
                      ? `$${Math.round(avgQuoteVal).toLocaleString()}`
                      : "$0"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Avg Margin
                  </div>
                  <div className="text-xs font-extrabold text-[#1d5bd8] leading-none mt-0.5">
                    {avgMarginVal}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Total SF
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 leading-none mt-0.5">
                    {totalSfVal > 0
                      ? `${totalSfVal.toLocaleString()} SF`
                      : "0 SF"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-400">
                  Total Profit Quoted
                </div>
                <div className="text-lg font-black text-[#10b981] leading-none mt-0.5">
                  ${totalProfitVal.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quotation History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 tracking-wide">
            Quotation History ({totalItems})
          </h2>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              <span>Loading quotes...</span>
            </div>
          )}
        </div>

        {estimatesList.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
            {isLoading
              ? "Fetching saved quotes from database..."
              : "No saved quotes found in history."}
          </Card>
        ) : (
          <div className="space-y-4">
            {estimatesList.map((quote) => {
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
                ? `${storageBuildings?.length || 1} Storage Building${(storageBuildings?.length || 1) > 1 ? "s" : ""}`
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

              const bldgVal =
                Number(
                  quote.buildingSubtotal ??
                    quote.materialCost ??
                    pricingRes?.matSell ??
                    pricingRes?.matCost,
                ) || 0;

              const installVal =
                Number(
                  quote.installCost ??
                    pricingRes?.instSell ??
                    pricingRes?.instCost,
                ) || 0;

              const formatK = (val: number) => {
                if (!val) return "$0";
                if (val >= 1000) {
                  return `$${Math.round(val / 1000)}k`;
                }
                return `$${Math.round(val).toLocaleString()}`;
              };

              // const blendPctVal =
              //   quote.blendPct ??
              //   (pricingRes?.blendPct as number | undefined) ??
              //   50;

              return (
                <div
                  key={quote._id || String(quote.jobNumber || Math.random())}
                  className="bg-[#f2fcf6] border border-emerald-300/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col gap-4 transition-all hover:shadow-sm"
                >
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                          {quote.cityStateZip ||
                            quote.streetAddress ||
                            quote.leadCompanyName ||
                            "Location"}
                        </h3>
                        {quoteNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                            Quote #{quoteNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-1.5">
                        <span>{quote.leadCompanyName || "TBD"}</span>
                        <span>·</span>
                        <span>{quote.scope?.toUpperCase() || "Supply"}</span>
                        <span>·</span>
                        <span>{formatNumber2(effectiveSqFt)} SF</span>
                        <span>·</span>
                        <span>{displayBuilding}</span>
                        {formattedDate && (
                          <>
                            <span>·</span>
                            <span>{formattedDate}</span>
                          </>
                        )}
                      </div>
                      {(bldgVal > 0 || installVal > 0) && (
                        <div className="flex items-center gap-3 pt-1">
                          {bldgVal > 0 && (
                            <span className="text-xs font-bold text-[#2563eb]">
                              Bldgs {formatK(bldgVal)}
                            </span>
                          )}
                          {installVal > 0 && (
                            <span className="text-xs font-bold text-[#16a34a]">
                              Install {formatK(installVal)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Details: Badges & Financial Metrics */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                          {isStorage
                            ? "STORAGE"
                            : quote.jobType?.toUpperCase() || "PEMB"}
                        </span>
                        {(() => {
                          const lifecycle = resolveQuotationLifecycle(quote);
                          switch (lifecycle.lifecycleStatus) {
                            case "approved":
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1">
                                  <span>✅</span>
                                  <span>Approved</span>
                                </span>
                              );
                            case "sent":
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex items-center gap-1">
                                  <span>📬</span>
                                  <span>Sent</span>
                                </span>
                              );
                            case "pending_approval":
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1">
                                  <span>⏳</span>
                                  <span>Pending Approval</span>
                                </span>
                              );
                            case "customer_accepted":
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1">
                                  <span>🤝</span>
                                  <span>Accepted</span>
                                </span>
                              );
                            case "customer_rejected":
                            case "admin_rejected":
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1">
                                  <span>❌</span>
                                  <span>Rejected</span>
                                </span>
                              );
                            default:
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs">
                                  Draft
                                </span>
                              );
                          }
                        })()}
                        {/* <span className="text-xs font-semibold text-slate-500">
                          {blendPctVal}% Quicken blend
                        </span> */}
                      </div>

                      {/* Financial Numbers Stack */}
                      <div className="text-right leading-tight space-y-0.5 pt-1">
                        <div className="text-base md:text-lg font-black text-[#2563eb]">
                          {formatCurrency2(totSell)}
                        </div>
                        <div className="text-[11px] font-normal text-slate-500">
                          {formatSfPrice2(sfPrice)}/SF
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold text-[#16a34a]">
                          <span>💰</span>
                          <span>{formatCurrency2(prof)}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#16a34a]">
                          {formatPercent2(marginPct)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60">
                    <Button
                      type="button"
                      onClick={() => handleLoadAndEdit(quote)}
                      disabled={hookLoadingId === quote._id}
                      className="bg-[#1e3a8a] hover:bg-[#172554] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {hookLoadingId === quote._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FolderOpen className="h-3.5 w-3.5" />
                      )}
                      <span>Load & Edit</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActiveChangeOrderQuote(quote)}
                      className="bg-[#1e3a8a] hover:bg-[#172554] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Change Order</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActiveDepositQuote(quote)}
                      className="bg-[#15803d] hover:bg-[#166534] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      <span>Request Deposit</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActiveMilestoneQuote(quote)}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Milestone className="h-3.5 w-3.5" />
                      <span>Milestones</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handlePreviewQuote(quote)}
                      disabled={hookLoadingId === quote._id}
                      className="bg-[#f1f5f9] hover:bg-slate-200 text-slate-800 border border-slate-300 h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {hookLoadingId === quote._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      <span>Preview</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuoteToDelete(quote)}
                      className="border border-[#f97316] text-[#f97316] hover:bg-orange-50 bg-white h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 ml-auto sm:ml-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              );
            })}

            {totalItems > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <Pagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[8, 16, 24, 32]}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modals */}
      <ChangeOrderModal
        open={Boolean(activeChangeOrderQuote)}
        onOpenChange={(open) => !open && setActiveChangeOrderQuote(null)}
        quote={activeChangeOrderQuote}
        onSuccess={() => fetchHistory()}
      />

      <RequestDepositModal
        open={Boolean(activeDepositQuote)}
        onOpenChange={(open) => !open && setActiveDepositQuote(null)}
        quote={activeDepositQuote}
        onSuccess={() => fetchHistory()}
      />

      <MilestonePaymentsModal
        open={Boolean(activeMilestoneQuote)}
        onOpenChange={(open) => !open && setActiveMilestoneQuote(null)}
        quote={activeMilestoneQuote}
        onSuccess={() => fetchHistory()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(quoteToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setQuoteToDelete(null);
          }
        }}
        title="Delete Quote?"
        description="This estimate will be permanently removed from your library."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        loadingText="Deleting..."
        onConfirm={handleDeleteConfirm}
      >
        {quoteToDelete && (
          <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-700 space-y-0.5">
            <div className="font-semibold text-slate-900 truncate">
              {quoteToDelete.cityStateZip ||
                quoteToDelete.streetAddress ||
                quoteToDelete.leadCompanyName ||
                "Quotation"}
            </div>
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
              {quoteToDelete.leadCompanyName && (
                <>
                  <span className="truncate max-w-[120px]">{quoteToDelete.leadCompanyName}</span>
                  <span>·</span>
                </>
              )}
              {quoteToDelete.quoteNumber && (
                <>
                  <span className="font-medium text-slate-700">Quote #{quoteToDelete.quoteNumber}</span>
                  <span>·</span>
                </>
              )}
              <span className="uppercase text-[10px] font-semibold text-slate-500">
                {quoteToDelete.scope || "Supply"}
              </span>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}

export default QuoteHistoryPage;
