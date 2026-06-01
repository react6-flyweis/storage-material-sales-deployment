import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_LIFECYCLE_STATUSES } from "@/modules/leads/lifecycle-statuses";

type LeadLifecycleStatusSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  placeholder?: string;
  includeAll?: boolean;
  allLabel?: string;
};

export default function LeadLifecycleStatusSelect({
  value,
  onValueChange,
  triggerClassName,
  placeholder = "Select status",
  includeAll = true,
  allLabel = "All",
}: LeadLifecycleStatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName ?? "bg-white w-full"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll ? <SelectItem value="all">{allLabel}</SelectItem> : null}
        {LEAD_LIFECYCLE_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
