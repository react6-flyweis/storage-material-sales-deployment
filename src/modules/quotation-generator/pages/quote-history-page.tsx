import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import {
  getEstimatesListProvider,
  getHistorySummaryProvider,
  deleteEstimateProvider,
  type SaveEstimatePayload,
} from "../estimates.api";
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
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        getEstimatesListProvider(30),
        getHistorySummaryProvider().catch(() => null),
      ]);

      const rawList = listRes.data || listRes;
      const items: SaveEstimatePayload[] = Array.isArray(rawList)
        ? rawList
        : ((rawList as Record<string, unknown>)
            ?.estimates as SaveEstimatePayload[]) ||
          ((rawList as Record<string, unknown>)
            ?.items as SaveEstimatePayload[]) ||
          [];
      setEstimatesList(items);

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
      console.error("Failed to load history list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearAll = () => {
    setEstimatesList([]);
  };

  const handleDeleteQuote = async (id?: string) => {
    if (!id) return;
    setEstimatesList((prev) => prev.filter((q) => q._id !== id));
    try {
      await deleteEstimateProvider(id).catch((err) => {
        console.warn("Backend delete estimate warning:", err);
      });
    } catch (err) {
      console.error("Failed to delete estimate:", err);
    }
  };

  const { loadAndEdit, loadingId: hookLoadingId } =
    useLoadEstimateToEditor();

  const handleLoadAndEdit = async (item: SaveEstimatePayload) => {
    try {
      await loadAndEdit(item);
    } catch (err) {
      console.error("Failed to load estimate detail:", err);
    }
  };

  const handlePreviewQuote = (item: SaveEstimatePayload) => {
    if (item._id) {
      navigate(`/quotation/history/${item._id}`);
    }
  };

  const filteredQuotes = estimatesList.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.leadCompanyName || "").toLowerCase().includes(term) ||
      (q.cityStateZip || "").toLowerCase().includes(term) ||
      (q.jobNumber || "").toLowerCase().includes(term) ||
      (q.buildingSize || "").toLowerCase().includes(term) ||
      (q.sourceFileName || "").toLowerCase().includes(term)
    );
  });

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
          <Button
            type="button"
            variant="outline"
            onClick={fetchHistory}
            disabled={isLoading}
            className="border border-slate-400 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
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
          </Button>
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
        </Card>

        {/* PROFIT BY CATEGORY Card */}
        <Card className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col h-44">
          <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
            PROFIT BY CATEGORY
          </div>
          <div className="flex-1 flex items-center pt-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <span className="w-4 h-4 bg-[#1d64d8] rounded-xs shrink-0 inline-block" />
              <span>Metal/Bldgs 100%</span>
            </div>
          </div>
        </Card>

        {/* SUMMARY Card */}
        <Card className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
            SUMMARY
          </div>
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
        </Card>
      </div>

      {/* Quotation History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 tracking-wide">
            Quotation History ({filteredQuotes.length})
          </h2>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              <span>Loading quotes...</span>
            </div>
          )}
        </div>

        {filteredQuotes.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
            {isLoading
              ? "Fetching saved quotes from database..."
              : "No saved quotes found in history."}
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
                        <span>{formatNumber2(effectiveSqFt)} SF</span>
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
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDeleteQuote(quote._id)}
                        className="border border-[#f97316] text-[#f97316] hover:bg-orange-50 h-8 px-2.5 text-xs font-medium rounded-md bg-white cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleLoadAndEdit(quote)}
                        disabled={hookLoadingId === quote._id}
                        className="bg-[#1e3e66] hover:bg-[#152e4d] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        {hookLoadingId === quote._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        Load & Edit
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handlePreviewQuote(quote)}
                        disabled={hookLoadingId === quote._id}
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-8 px-3.5 text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        {hookLoadingId === quote._id ? (
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

export default QuoteHistoryPage;
