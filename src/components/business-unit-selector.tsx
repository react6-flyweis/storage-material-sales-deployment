import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_UNIT_OPTIONS } from "@/modules/leads/business-unit";

type Props = {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  includeAll?: boolean;
  allLabel?: string;
  includeNone?: boolean;
  noneLabel?: string;
  includeClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
};

export default function BusinessUnitSelector({
  id,
  value,
  onChange,
  className,
  triggerClassName,
  placeholder = "Select Business Unit",
  includeAll = false,
  allLabel = "All Business Units",
  includeNone = false,
  noneLabel = "Not set",
  includeClear = false,
  clearLabel = "Not set",
  disabled = false,
}: Props) {
  // If value is empty string or null, in Radix select we can map to an internal string if needed or undefined
  const selectValue = value ?? (includeAll ? "all" : undefined);

  return (
    <div className={className}>
      <Select
        value={selectValue}
        onValueChange={(val) => {
          if (val === "__clear__") {
            onChange("");
          } else {
            onChange(val);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={triggerClassName ?? "w-full"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAll ? (
            <SelectItem value="all">{allLabel}</SelectItem>
          ) : null}
          {includeClear ? (
            <SelectItem value="__clear__">{clearLabel}</SelectItem>
          ) : null}
          {BUSINESS_UNIT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
          {includeNone ? (
            <SelectItem value="none">{noneLabel}</SelectItem>
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
}
