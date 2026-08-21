import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Trash2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
  getEstimateByIdProvider,
  type SaveEstimatePayload,
} from "../estimates.api";

export function QuoteHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [estimatesList, setEstimatesList] = useState<SaveEstimatePayload[]>([]);
  const [summaryData, setSummaryData] = useState<{
    totalQuotes?: number;
    totalValue?: number;
    totalProfit?: number;
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
        : (rawList as Record<string, unknown>)?.estimates as SaveEstimatePayload[] ||
        (rawList as Record<string, unknown>)?.items as SaveEstimatePayload[] || [];
      setEstimatesList(items);

      if (summaryRes) {
        const rawSummary = summaryRes.data || summaryRes;
        const allTime = (rawSummary as Record<string, unknown>)?.allTime || rawSummary;
        setSummaryData(allTime as { totalQuotes?: number; totalValue?: number; totalProfit?: number });
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

  const handleDeleteQuote = (id?: string) => {
    if (!id) return;
    setEstimatesList((prev) => prev.filter((q) => q._id !== id));
  };

  const handleLoadAndEdit = async (item: SaveEstimatePayload) => {
    try {
      let estimate = item;
      if (item._id) {
        const res = await getEstimateByIdProvider(item._id);
        const fetchedData = res.data || res;
        if ((fetchedData as Record<string, unknown>)?.estimate) {
          estimate = (fetchedData as Record<string, unknown>).estimate as SaveEstimatePayload;
        } else if (fetchedData) {
          estimate = fetchedData as SaveEstimatePayload;
        }
      }

      const pricingRes = estimate.pricingResult as Record<string, unknown> | undefined;

      navigate("/quotation/extracted-drawing", {
        state: {
          extractedShipper: {
            fileName: estimate.sourceFileName || "Shipper.xlsx",
            totalWeightLbs: (pricingRes?.totWt as number) || 0,
            squareFootage: estimate.squareFootage || 0,
            parsedCategories: estimate.parsedCategories,
            tabSummary: estimate.tabSummary,
            pricing: estimate.pricingResult,
          },
          extractedDrawing: estimate.extractedDrawingFields ? {
            fileName: estimate.sourceFileName || "Drawing.pdf",
            extracted: estimate.extractedDrawingFields,
          } : undefined,
          quotationForm: {
            leadName: estimate.leadCompanyName || "",
            email: estimate.customerEmail || "",
            street: estimate.streetAddress || "",
            cityStateZip: estimate.cityStateZip || "",
            buildingSize: estimate.buildingSize || "",
            jobNumber: estimate.jobNumber || "",
          },
          estimateId: estimate._id,
        },
      });
    } catch (err) {
      console.error("Failed to load estimate detail:", err);
    }
  };

  const filteredQuotes = estimatesList.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.leadCompanyName || "").toLowerCase().includes(term) ||
      (q.cityStateZip || "").toLowerCase().includes(term) ||
      (q.jobNumber || "").toLowerCase().includes(term) ||
      (q.buildingSize || "").toLowerCase().includes(term)
    );
  });

  const totalQuotesCount = summaryData?.totalQuotes ?? estimatesList.length;
  const totalPipelineVal = summaryData?.totalValue ?? estimatesList.reduce((sum, e) => {
    const pr = e.pricingResult as Record<string, unknown> | undefined;
    return sum + (Number(pr?.totSell) || 0);
  }, 0);
  const totalProfitVal = summaryData?.totalProfit ?? estimatesList.reduce((sum, e) => {
    const pr = e.pricingResult as Record<string, unknown> | undefined;
    return sum + (Number(pr?.profit) || 0);
  }, 0);

  const formattedPipelineVal = totalPipelineVal > 1000 ? `$${(totalPipelineVal / 1000).toFixed(0)}k` : `$${totalPipelineVal.toLocaleString()}`;
  const formattedProfitVal = totalProfitVal > 1000 ? `$${(totalProfitVal / 1000).toFixed(0)}k` : `$${totalProfitVal.toLocaleString()}`;

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
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
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
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">August 2026</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">{formattedPipelineVal}</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% avg margin</div>
            <div className="text-[11px] font-medium text-slate-500">{formattedProfitVal} profit</div>
            <div className="text-[11px] font-medium text-slate-500">{totalQuotesCount} quotes</div>
          </div>
        </Card>

        {/* Q3 2026 Card */}
        <Card className="p-4 bg-white border-2 border-emerald-500 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              Q3 2026
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">This Quarter</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">{formattedPipelineVal}</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% avg margin</div>
            <div className="text-[11px] font-medium text-slate-500">{formattedProfitVal} profit</div>
            <div className="text-[11px] font-medium text-slate-500">{totalQuotesCount} quotes</div>
          </div>
        </Card>

        {/* YTD 2026 Card */}
        <Card className="p-4 bg-white border-2 border-amber-400 rounded-xl shadow-xs flex flex-col justify-between h-44">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              YTD 2026
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Year to Date</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">{formattedPipelineVal}</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% avg margin</div>
            <div className="text-[11px] font-medium text-slate-500">{formattedProfitVal} profit</div>
            <div className="text-[11px] font-medium text-slate-500">{totalQuotesCount} quotes</div>
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
                <div className="text-[10px] font-semibold text-slate-400">Total Quotes</div>
                <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">{totalQuotesCount}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Avg Quote</div>
                <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                  {totalQuotesCount ? `$${Math.round(totalPipelineVal / totalQuotesCount).toLocaleString()}` : "$0"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Avg Margin</div>
                <div className="text-xs font-extrabold text-[#1d5bd8] leading-none mt-0.5">23.1%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Total SF</div>
                <div className="text-xs font-extrabold text-slate-900 leading-none mt-0.5">
                  {estimatesList.reduce((sum, e) => sum + (e.squareFootage || 0), 0).toLocaleString()} SF
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400">Total Profit Quoted</div>
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
            {isLoading ? "Fetching saved quotes from database..." : "No saved quotes found in history."}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const pricingRes = quote.pricingResult as Record<string, unknown> | undefined;
              const totSell = Number(pricingRes?.totSell) || 0;
              const prof = Number(pricingRes?.profit) || 0;
              const marginPct = Number(pricingRes?.profPct) || 23.1;
              const sfPrice = Number(pricingRes?.sfPrice) || (totSell && quote.squareFootage ? (totSell / quote.squareFootage).toFixed(2) : 0);

              return (
                <div
                  key={quote._id || String(quote.jobNumber || Math.random())}
                  className="bg-[#f2fcf6] border-l-4 border-l-[#22c55e] border border-emerald-200/60 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-stretch justify-between gap-4 transition-all hover:shadow-sm"
                >
                  {/* Left Side Quote Details */}
                  <div className="flex flex-col justify-between space-y-1.5 min-w-0">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {quote.leadCompanyName || "Council Bluffs, IA 51503"}
                      </h3>
                      <div className="text-xs text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-1">
                        <span>{quote.status?.toUpperCase() || "DRAFT"}</span>
                        <span>·</span>
                        <span>{quote.scope?.toUpperCase() || "SUPPLY"}</span>
                        <span>·</span>
                        <span>{(quote.squareFootage || quote.sf || 0).toLocaleString()} SF</span>
                        <span>·</span>
                        <span>{quote.buildingSize || "Building"}</span>
                        <span>·</span>
                        <span>{quote.cityStateZip || "IA"}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#2563eb] pt-1">
                      Job #{quote.jobNumber || "Draft"} · {quote.sourceFileName || "Drawing.pdf"}
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
                        {marginPct}%
                      </div>
                    </div>

                    {/* Bottom Right Badge & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#dbeafe] text-[#2563eb] px-1.5 py-0.5 rounded-xs text-[10px] font-bold tracking-wide uppercase">
                          {quote.jobType?.toUpperCase() || "PEMB"}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          Vendor blend
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDeleteQuote(quote._id)}
                        className="border border-[#f97316] text-[#f97316] hover:bg-orange-50 h-8 px-3 text-xs font-medium rounded-md bg-white cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleLoadAndEdit(quote)}
                        className="bg-[#1e3e66] hover:bg-[#152e4d] text-white h-8 px-3 text-xs font-medium rounded-md cursor-pointer flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Load & Edit
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
