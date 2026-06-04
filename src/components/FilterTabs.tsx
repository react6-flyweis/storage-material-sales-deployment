import { useState } from "react";

export type Period = undefined | "week" | "month" | "quarter";
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

const periodLabels: Record<Exclude<Period, undefined>, string> = {
  week: "Today",
  month: "This Month",
  quarter: "This Quarter",
};

const getPeriodLabel = (period: Period) => (period ? periodLabels[period] : "All");

type Props = {
  initialPeriod?: Period;
  onPeriodChange?: (period: Period, dateRange: DateRange) => void;
};

export const getPeriodRange = (period?: Period) => {
  if (!period) {
    return {
      startDate: null,
      endDate: null,
    };
  }
  const today = new Date();

  if (period === "week") {
    return { startDate: today, endDate: today };
  }

  if (period === "month") {
    return {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    };
  }

  const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;

  return {
    startDate: new Date(today.getFullYear(), quarterStartMonth, 1),
    endDate: today,
  };
};

export default function FilterTabs({ initialPeriod, onPeriodChange }: Props) {
  const [period, setPeriod] = useState<Period | null>(initialPeriod || null);

  const handleChange = (p: Period) => {
    let newPeriod: Period = undefined;

    if (period !== p) {
      newPeriod = p;
    }

    setPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod || undefined, {
        ...getPeriodRange(newPeriod),
      });
    }
  };

  const button = (p: Period, bg: string, z: string) => (
    <button
      onClick={() => handleChange(p)}
      className={`relative w-64 px-8 font-medium -ml-7.5 ${z} ${bg} ${period === p
        ? "ring-2 ring-white/40 text-black"
        : "text-white opacity-60"
        }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 30px 100%)",
      }}
    >
      {getPeriodLabel(p)}
    </button>
  );

  return (
    <div className="relative flex h-10 bg-[#89D5DC] overflow-hidden">
      <button
        onClick={() => handleChange("week")}
        className={`relative w-64 px-8 font-medium z-30 bg-[#89D5DC] ${period === "week"
          ? "ring-2 ring-white/40 text-black"
          : "text-white opacity-60"
          }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Today
      </button>

      {button("month", "bg-[#6B93CE]", "z-20")}

      {button("quarter", "bg-[#4A72B7]", "z-10")}
    </div>
  );
}
