import { Card } from "@/components/ui/card";
import { useConversionFunnelQuery } from "@/lib/metrics";
import { Link } from "react-router";
import type { Period } from "@/components/FilterTabs";

type FunnelItem = {
  label: string;
  count: string | number;
  percent?: string;
  // Tailwind classes for the dot and background (light) row
  dotClass?: string; // e.g. 'bg-blue-500'
  rowBgClass?: string; // e.g. 'bg-blue-100'
};

type SalesFunnelProps = {
  title?: string;
  timeframeOptions?: string[];
  items?: FunnelItem[];
  period?: Period;
};

export default function SalesFunnel({
  title = "Conversion Funnel",
  items,
  period = "quarter",
}: SalesFunnelProps) {
  const { data, isPending } = useConversionFunnelQuery(period);
  const totalLeads = data?.newLeads ?? 0;
  const formatShare = (value: number) =>
    totalLeads > 0 ? `${((value / totalLeads) * 100).toFixed(1)}%` : "0%";

  const defaultItems: FunnelItem[] = [
    {
      label: "New Leads",
      count: totalLeads,
      percent: totalLeads > 0 ? "100%" : "0%",
      dotClass: "bg-blue-500",
      rowBgClass: "bg-blue-100",
    },
    {
      label: "Contacted",
      count: data?.contacted ?? 0,
      percent: formatShare(data?.contacted ?? 0),
      dotClass: "bg-yellow-500",
      rowBgClass: "bg-yellow-100",
    },
    {
      label: "In Pipeline",
      count: data?.inPipeline ?? 0,
      percent: formatShare(data?.inPipeline ?? 0),
      dotClass: "bg-purple-500",
      rowBgClass: "bg-purple-100",
    },
    {
      label: "Closed Won",
      count: data?.closedWon ?? 0,
      percent: formatShare(data?.closedWon ?? 0),
      dotClass: "bg-green-500",
      rowBgClass: "bg-green-100",
    },
  ];

  const rows = items ?? defaultItems;

  return (
    <Card className="p-4 gap-0 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-lg p-4 flex items-center justify-between bg-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="h-4 w-28 rounded bg-slate-300" />
              </div>

              <div className="text-right space-y-2">
                <div className="ml-auto h-5 w-10 rounded bg-slate-300" />
                <div className="ml-auto h-3 w-12 rounded bg-slate-300" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <Link to="/leads" key={r.label}>
              <div
                className={`rounded-lg p-4 flex items-center justify-between ${
                  r.rowBgClass ?? "bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      r.dotClass ?? "bg-slate-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-800">
                    {r.label}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    {r.count}
                  </div>
                  {r.percent ? (
                    <div className="text-xs text-slate-500 mt-1">
                      {r.percent}
                    </div>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
