"use client";
import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange as RDateRange } from "react-day-picker";

interface Props {
  value?: RDateRange;
  onChange?: (v: RDateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<RDateRange | undefined>(
    value || undefined,
  );

  React.useEffect(() => setRange(value || undefined), [value]);

  const handleSelect = (selection: RDateRange | undefined) => {
    setRange(selection);
    onChange?.(selection);
  };

  const formatValue = () => {
    if (!range?.from && !range?.to) return "";
    const from = range.from ? range.from.toLocaleDateString() : "";
    const to = range.to ? range.to.toLocaleDateString() : "";
    return from && to ? `${from} - ${to}` : from || to;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn("relative inline-block", className)}
        >
          <Input
            readOnly
            value={formatValue()}
            placeholder="Select date range"
            className={cn("w-full pr-9 placeholder:text-gray-400")}
          />
          <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="range" selected={range} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
