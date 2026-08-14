import { Edit3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryRow {
  id: string;
  category: string;
  categoryBg: string;
  categoryTextColor: string;
  weight: string;
  rate: string;
  price: string;
  notes: string;
}

const categoryData: CategoryRow[] = [
  {
    id: "purlins",
    category: "Purlins, Girts & Eave Structs",
    categoryBg: "bg-emerald-500",
    categoryTextColor: "text-white",
    weight: "950",
    rate: "$0.88/lb",
    price: "$836",
    notes: "-",
  },
  {
    id: "door_jambs",
    category: "Door Jambs & Headers",
    categoryBg: "bg-purple-600",
    categoryTextColor: "text-white",
    weight: "1,650",
    rate: "$1.2/lb",
    price: "$1,980",
    notes: "-",
  },
  {
    id: "roof_wall_sheeting",
    category: "Roof & Wall Sheeting",
    categoryBg: "bg-orange-500",
    categoryTextColor: "text-white",
    weight: "6,241",
    rate: "$1.3/SF",
    price: "$3,245",
    notes: "~2,496 SF",
  },
  {
    id: "connection_plates",
    category: "Connection Plates & Clips",
    categoryBg: "bg-red-500",
    categoryTextColor: "text-white",
    weight: "233",
    rate: "$1.2/lb",
    price: "$279",
    notes: "-",
  },
  {
    id: "trim",
    category: "Trim",
    categoryBg: "bg-lime-600",
    categoryTextColor: "text-white",
    weight: "-",
    rate: "bucket",
    price: "$44,688",
    notes: "-",
  },
  {
    id: "cables_bracing",
    category: "Cables, Bracing & Sealant",
    categoryBg: "bg-slate-400",
    categoryTextColor: "text-white",
    weight: "-",
    rate: "bucket",
    price: "$15,125",
    notes: "~2,496 SF",
  },
  {
    id: "accessories",
    category: "Accessories",
    categoryBg: "bg-slate-400",
    categoryTextColor: "text-white",
    weight: "434",
    rate: "bucket",
    price: "$68,750",
    notes: "-",
  },
  {
    id: "fasteners",
    category: "Fasteners",
    categoryBg: "bg-[#84CC16]",
    categoryTextColor: "text-white",
    weight: "-",
    rate: "per item (not $/lb)",
    price: "$33,000",
    notes: "Priced per piece — screws, tape, sealant",
  },
];

interface QuoteBreakdownTabProps {
  onViewQuote?: () => void;
}

export function QuoteBreakdownTab({ onViewQuote }: QuoteBreakdownTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL SELL */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            TOTAL SELL
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">$326,563</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Install Only</div>
        </div>

        {/* MATERIAL COST */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            MATERIAL COST
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">$167,427</div>
          <div className="text-[11px] text-slate-500 mt-0.5">50% Quicken blend</div>
        </div>

        {/* PROFIT */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            PROFIT
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">$-65,538</div>
          <div className="text-[11px] text-slate-500 mt-0.5">-20.1% margin</div>
        </div>

        {/* S/SF */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            S/SF
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">$4.75</div>
          <div className="text-[11px] text-slate-500 mt-0.5">68,750 SF</div>
        </div>

        {/* WEIGHT */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            WEIGHT
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">9.5K</div>
          <div className="text-[11px] text-slate-500 mt-0.5">lbs - 1 trucks</div>
        </div>

        {/* VENDOR BLEND SAVINGS */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-rose-400 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            VENDOR BLEND SAVINGS
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">$561</div>
          <div className="text-[11px] text-slate-500 mt-0.5">vs 100% Central - 50% Quicken</div>
        </div>
      </div>

      {/* Weight + Price by Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Weight + Price by Category</h3>
          <p className="text-xs text-slate-500">
            #6959 Paris, TN expansion (Shipper).xlsx - 68,750 SF - 9,508 lbs
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Pricing Rules
        </Button>
      </div>

      {/* Category Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="p-3">CATEGORY</th>
              <th className="p-3">WEIGHT (LBS)</th>
              <th className="p-3">RATE</th>
              <th className="p-3">PRICE</th>
              <th className="p-3">NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            {categoryData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-3">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs",
                      row.categoryBg,
                      row.categoryTextColor
                    )}
                  >
                    {row.category}
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-900">{row.weight}</td>
                <td className="p-3 text-slate-600">{row.rate}</td>
                <td className="p-3 font-bold text-slate-900">{row.price}</td>
                <td className="p-3 text-slate-500">{row.notes}</td>
              </tr>
            ))}

            {/* Subtotals & Cost Rows */}
            <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
              <td className="p-3 text-slate-900 font-bold">Material total</td>
              <td className="p-3 text-slate-900 font-bold">9,508 lbs</td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-bold">$167,427</td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Freight (1 trucks)</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">$1,236</td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Install cost</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">$223,438</td>
              <td className="p-3"></td>
            </tr>

            <tr className="bg-slate-50/90 font-bold border-t border-b border-slate-200">
              <td className="p-3 text-slate-900 font-bold">Total cost</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-bold">$392,101</td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Install sell</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">$326,563</td>
              <td className="p-3"></td>
            </tr>

            {/* Final SELL PRICE Row */}
            <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
              <td className="p-3 text-slate-900 font-extrabold text-sm uppercase">SELL PRICE</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-extrabold text-sm">$326,563</td>
              <td className="p-3 text-slate-900 font-bold text-xs">$4.75/SF</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <Button
          type="button"
          onClick={onViewQuote}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          View Quote
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-slate-300 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
        >
          View SOW
        </Button>
        <Button
          type="button"
          onClick={onViewQuote}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          Quote Preview <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
