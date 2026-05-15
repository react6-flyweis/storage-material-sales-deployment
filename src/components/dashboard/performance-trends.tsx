import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { usePerformanceTrendQuery } from "@/lib/metrics";
import {
  ResponsiveContainer,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Period = "7" | "30" | "90";
type Tab = "customers" | "revenue" | "team";

export default function PerformanceTrends() {
  const [period] = useState<Period>("7");
  const [tab, setTab] = useState<Tab>("customers");
  const rangeParam = `${period}d`;

  const {
    data: trend,
    isFetching,
    isPending,
  } = usePerformanceTrendQuery(tab, rangeParam);
  const loading = isPending || (isFetching && !trend);

  const data = useMemo(() => {
    const points = trend?.data ?? [];

    return points.map((p) => {
      const d = new Date(p.date);
      const name = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      return { name, value: p.value };
    });
  }, [trend]);

  const tabs = [
    { key: "customers", label: "Customers" },
    { key: "revenue", label: "Revenue" },
    { key: "team", label: "Team performance" },
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Performance Trends
          </h3>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
            {trend?.rangeLabel ?? "Last 7 days"}
            <ChevronDown className="size-4" />
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {loading ? (
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          ) : trend?.percentageChange != null ? (
            `${trend.percentageChange > 0 ? "+" : ""}${trend.percentageChange}%`
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex gap-3 items-center text-sm">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as Tab)}
                className={`px-3 py-1 rounded-full text-sm ${
                  active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 bg-transparent"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 h-44">
          {loading ? (
            <div className="h-full w-full rounded-lg bg-slate-100 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} horizontal={false} />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  stroke="#9CA3AF"
                  tick={{ fontSize: 13 }}
                  padding={{ left: 10, right: 10 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={40}
                  stroke="#9CA3AF"
                  tick={{ fontSize: 13 }}
                />

                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat().format(value)
                  }
                  contentStyle={{ borderRadius: 8 }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill="url(#g)"
                  dot={false}
                />
                <Line
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
