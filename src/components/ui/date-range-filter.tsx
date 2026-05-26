import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange as RDateRange } from "react-day-picker";

interface Props {
  value?: RDateRange;
  onChange?: (value: RDateRange | undefined) => void;
  className?: string;
}

type PresetKey = "today" | "this-week" | "next-week";

const presetOptions: Array<{
  key: PresetKey;
  label: string;
  compute: () => RDateRange;
}> = [
  {
    key: "today",
    label: "Today",
    compute: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    key: "this-week",
    label: "This Week",
    compute: () => {
      const today = new Date();
      const monday = new Date(today);
      const day = monday.getDay();
      const diff = (day + 6) % 7;
      monday.setDate(monday.getDate() - diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: monday, to: sunday };
    },
  },
  {
    key: "next-week",
    label: "Next Week",
    compute: () => {
      const today = new Date();
      const monday = new Date(today);
      const day = monday.getDay();
      const diff = (day + 6) % 7;
      monday.setDate(monday.getDate() - diff + 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: monday, to: sunday };
    },
  },
];

const formatDate = (value?: Date) =>
  value?.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatRangeValue = (range?: RDateRange) => {
  if (!range?.from && !range?.to) return "";
  const from = range.from ? formatDate(range.from) : "";
  const to = range.to ? formatDate(range.to) : "";
  return from && to ? `${from} - ${to}` : from || to;
};

const rangeEquals = (a?: RDateRange, b?: RDateRange) => {
  if (!a || !a.from || !a.to || !b || !b.from || !b.to) return false;
  return (
    a.from.toDateString() === b.from.toDateString() &&
    a.to.toDateString() === b.to.toDateString()
  );
};

const findPresetKey = (range?: RDateRange): PresetKey | undefined => {
  if (!range?.from || !range?.to) return undefined;
  return presetOptions.find((preset) => rangeEquals(preset.compute(), range))
    ?.key;
};

export default function DateRangeFilter({ value, onChange, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const [draftRange, setDraftRange] = React.useState<RDateRange | undefined>(
    value,
  );
  const [activePreset, setActivePreset] = React.useState<PresetKey | undefined>(
    findPresetKey(value),
  );

  React.useEffect(() => {
    setDraftRange(value);
    setActivePreset(findPresetKey(value));
  }, [value]);

  const handleSelect = (selection: RDateRange | undefined) => {
    setDraftRange(selection);
    setActivePreset(findPresetKey(selection));
  };

  const handlePreset = (preset: (typeof presetOptions)[number]) => {
    const selection = preset.compute();
    setDraftRange(selection);
    setActivePreset(preset.key);
  };

  const handleApply = () => {
    onChange?.(draftRange);
    setOpen(false);
  };

  const handleCancel = () => {
    setDraftRange(value);
    setActivePreset(findPresetKey(value));
    setOpen(false);
  };

  //   const displayValue =
  //     activePreset && activePreset !== "custom"
  //       ? presetOptions.find((option) => option.key === activePreset)?.label ||
  //         formatRangeValue(draftRange)
  //       : formatRangeValue(draftRange);

  const displayValue = formatRangeValue(draftRange);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn("relative inline-block rounded-xl", className)}
        >
          <Input
            readOnly
            value={displayValue}
            placeholder="Select date range"
            className={cn("min-w-40 w-full pr-9 placeholder:text-gray-400")}
          />
          <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 rounded-xl">
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={handleSelect}
          />

          <div className="border-t border-slate-200 mt-4 pt-4">
            <div className="flex gap-2">
              {presetOptions.slice(0, 3).map((preset) => {
                const isActive = activePreset === preset.key;
                return (
                  <button
                    type="button"
                    key={preset.key}
                    onClick={() => handlePreset(preset)}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 px-2 text-[13px] font-medium transition text-center",
                      isActive
                        ? "bg-slate-200 text-slate-900"
                        : "bg-[#F4F4F5] text-slate-800 hover:bg-slate-200",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-lg bg-[#34519f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#34519f]/90"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
