import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuotationStore } from "../quotation.store";

interface QuoteAddOnsTabProps {
  onTriggerCompute?: () => void;
}

export function QuoteAddOnsTab({ onTriggerCompute }: QuoteAddOnsTabProps) {
  const {
    pembAddOns,
    addPembAddOn,
    updatePembAddOn,
    removePembAddOn,
  } = useQuotationStore();

  const handleAddLineItem = () => {
    addPembAddOn({
      item: "",
      cost: 50,
      markupPct: 25,
      note: "",
      inQuote: true,
      inSow: true,
    });
    onTriggerCompute?.();
  };

  const handleUpdate = (
    id: string,
    updates: Parameters<typeof updatePembAddOn>[1]
  ) => {
    updatePembAddOn(id, updates);
    onTriggerCompute?.();
  };

  const handleDelete = (id: string) => {
    removePembAddOn(id);
    onTriggerCompute?.();
  };

  const includedTotal = pembAddOns
    .filter((item) => item.inQuote)
    .reduce((sum, item) => {
      const cost = Number(item.cost) || 0;
      const markup = Number(item.markupPct) || 0;
      const sell = Math.round(cost * (1 + markup / 100));
      return sum + sell;
    }, 0);

  return (
    <Card className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base text-purple-600 font-bold select-none">➕</span>
            <h3 className="text-sm font-bold text-slate-900">
              Add-Ons &amp; Line Items
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add custom line items — stem wall, site work, extras. Check to include in quote &amp; SOW.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddLineItem}
          className="border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold h-8 px-3 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Line Item</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
              <th className="pb-2.5 font-bold min-w-44 pr-3">DESCRIPTION</th>
              <th className="pb-2.5 font-bold w-28 text-center px-2">COST $</th>
              <th className="pb-2.5 font-bold w-28 text-center px-2">MARKUP %</th>
              <th className="pb-2.5 font-bold w-24 text-center px-2">SELL $</th>
              <th className="pb-2.5 font-bold min-w-36 px-2">NOTE</th>
              <th className="pb-2.5 font-bold w-16 text-center px-2">QUOTE</th>
              <th className="pb-2.5 font-bold w-16 text-center px-2">SOW</th>
              <th className="pb-2.5 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pembAddOns.map((item) => {
              const cost = Number(item.cost) || 0;
              const markup = Number(item.markupPct) || 0;
              const sell = Math.round(cost * (1 + markup / 100));

              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* DESCRIPTION */}
                  <td className="py-2.5 pr-3">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) =>
                        handleUpdate(item.id, { item: e.target.value })
                      }
                      placeholder="e.g. new wall, stem wall, skylights..."
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </td>

                  {/* COST $ */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-slate-500 font-semibold text-xs">$</span>
                      <input
                        type="number"
                        min={0}
                        value={item.cost === 0 ? "" : item.cost}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            cost: e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                        className="w-20 text-center bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>
                  </td>

                  {/* MARKUP % */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={item.markupPct === 0 ? "" : item.markupPct}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            markupPct:
                              e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                        className="w-16 text-center bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      />
                      <span className="text-slate-500 font-semibold text-xs">%</span>
                    </div>
                  </td>

                  {/* SELL $ */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-extrabold text-[#1E3A8A] text-xs sm:text-sm">
                      ${sell.toLocaleString()}
                    </span>
                  </td>

                  {/* NOTE */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      value={item.note || ""}
                      onChange={(e) =>
                        handleUpdate(item.id, { note: e.target.value })
                      }
                      placeholder="note..."
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </td>

                  {/* QUOTE */}
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.inQuote}
                      onChange={(e) =>
                        handleUpdate(item.id, { inQuote: e.target.checked })
                      }
                      className="h-4 w-4 accent-blue-600 rounded cursor-pointer transition-colors"
                      title="Include in Quote pricing"
                    />
                  </td>

                  {/* SOW */}
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.inSow}
                      onChange={(e) =>
                        handleUpdate(item.id, { inSow: e.target.checked })
                      }
                      className="h-4 w-4 accent-blue-600 rounded cursor-pointer transition-colors"
                      title="Include in Statement of Work"
                    />
                  </td>

                  {/* DELETE */}
                  <td className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete line item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {pembAddOns.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-slate-400 text-xs italic"
                >
                  No add-ons or line items added yet. Click &quot;+ Add Line Item&quot; above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Total */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
          Included Total
        </span>
        <div className="flex items-center gap-6">
          <span className="font-extrabold text-[#1E3A8A] text-sm sm:text-base">
            ${includedTotal.toLocaleString()}
          </span>
          <div className="w-10" />
        </div>
      </div>
    </Card>
  );
}
