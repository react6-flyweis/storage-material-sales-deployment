import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";

interface QuoteHistoryItem {
  id: string;
  customerLocation: string;
  zipCode: string;
  status: string;
  scope: string;
  squareFeet: number;
  dimensions: string;
  date: string;
  categoryTag: string;
  categoryLabel: string;
  buildingCost: string;
  totalPrice: number;
  pricePerSqFt: number;
  profit: number;
  marginPercent: number;
  blendPercentage: number;
}

const mockQuoteHistory: QuoteHistoryItem[] = [
  {
    id: "quote-1",
    customerLocation: "Council Bluffs, IA 51503",
    zipCode: "51503",
    status: "TBD",
    scope: "Supply",
    squareFeet: 3000,
    dimensions: "20x150x8.5",
    date: "Aug 3, 2026",
    categoryTag: "Bldgs",
    categoryLabel: "bldgs $18k",
    buildingCost: "bldgs $18k",
    totalPrice: 18396,
    pricePerSqFt: 6.13,
    profit: 4245,
    marginPercent: 23.1,
    blendPercentage: 50,
  },
  {
    id: "quote-2",
    customerLocation: "Council Bluffs, IA 51503",
    zipCode: "51503",
    status: "TBD",
    scope: "Supply",
    squareFeet: 3000,
    dimensions: "20x150x8.5",
    date: "Aug 3, 2026",
    categoryTag: "Bldgs",
    categoryLabel: "bldgs $18k",
    buildingCost: "bldgs $18k",
    totalPrice: 18396,
    pricePerSqFt: 6.13,
    profit: 4245,
    marginPercent: 23.1,
    blendPercentage: 50,
  },
];

export function QuoteHistoryPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteHistoryItem[]>(mockQuoteHistory);
  const [searchTerm, setSearchTerm] = useState("");

  const handleClearAll = () => {
    setQuotes([]);
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const handleLoadAndEdit = (_quote: QuoteHistoryItem) => {
    navigate("/quotation/quote-preview");
  };

  const filteredQuotes = quotes.filter((q) =>
    q.customerLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.dimensions.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-primary text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Quote Library
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              All saved quotes - click any quote to reload it
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
            onClick={handleClearAll}
            className="border border-slate-400"
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
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Aug 2026</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">$37k</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% margin</div>
            <div className="text-[11px] font-medium text-slate-500">$8k profit</div>
            <div className="text-[11px] font-medium text-slate-500">2 quotes</div>
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
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">$37k</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% margin</div>
            <div className="text-[11px] font-medium text-slate-500">$8k profit</div>
            <div className="text-[11px] font-medium text-slate-500">2 quotes</div>
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
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">$37k</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% margin</div>
            <div className="text-[11px] font-medium text-slate-500">$8k profit</div>
            <div className="text-[11px] font-medium text-slate-500">2 quotes</div>
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
              <span>Metal/Bldgs100%</span>
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
                <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">2</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Avg Quote</div>
                <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">$18,396</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Avg Margin</div>
                <div className="text-xs font-extrabold text-[#1d5bd8] leading-none mt-0.5">23.1%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400">Total SF</div>
                <div className="text-xs font-extrabold text-slate-900 leading-none mt-0.5">6k SF</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400">Total Profit Quoted</div>
              <div className="text-lg font-black text-[#10b981] leading-none mt-0.5">$8,490</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ALL TIME Card Row */}
      <div className="w-full sm:w-[calc(20%-0.8rem)] min-w-[200px]">
        <Card className="p-4 bg-white border-2 border-[#1e293b] rounded-xl shadow-xs space-y-1 h-44 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
              ALL TIME
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">2 total quotes</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#1d5bd8] tracking-tight">$37k</div>
            <div className="text-xs font-bold text-[#1d5bd8]">23.1% margin</div>
            <div className="text-[11px] font-medium text-slate-500">$8k profit</div>
            <div className="text-[11px] font-medium text-slate-500">2 quotes</div>
          </div>
        </Card>
      </div>


      {/* Quotation History Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-bold text-slate-600 tracking-wide">
          Quotation History
        </h2>

        {filteredQuotes.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
            No quote history found matching your search.
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-[#f2fcf6] border-l-[4px] border-l-[#22c55e] border border-emerald-200/60 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-stretch justify-between gap-4 transition-all hover:shadow-sm"
              >
                {/* Left Side Quote Details */}
                <div className="flex flex-col justify-between space-y-1.5 min-w-0">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {quote.customerLocation}
                    </h3>
                    <div className="text-xs text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-1">
                      <span>{quote.status}</span>
                      <span>·</span>
                      <span>{quote.scope}</span>
                      <span>·</span>
                      <span>{quote.squareFeet.toLocaleString()} SF</span>
                      <span>·</span>
                      <span>{quote.dimensions}</span>
                      <span>·</span>
                      <span>{quote.date}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#2563eb] pt-1">
                    {quote.buildingCost}
                  </div>
                </div>

                {/* Right Side Quote Metrics & Action Buttons */}
                <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                  {/* Top Right Price Metrics Stack */}
                  <div className="text-right leading-tight space-y-0.5">
                    <div className="text-sm font-bold text-[#2563eb]">
                      ${quote.totalPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500">
                      ${quote.pricePerSqFt.toFixed(2)}/SF
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs font-semibold text-[#16a34a]">
                      <span>💰</span>
                      <span>${quote.profit.toLocaleString()}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#16a34a]">
                      {quote.marginPercent}%
                    </div>
                  </div>

                  {/* Bottom Right Badge & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#dbeafe] text-[#2563eb] px-1.5 py-0.5 rounded-xs text-[10px] font-bold tracking-wide uppercase">
                        PEMB
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        {quote.blendPercentage}% Quicken blend
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDeleteQuote(quote.id)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuoteHistoryPage;
