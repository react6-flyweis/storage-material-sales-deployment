import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

type Props = {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  options?: Option[];
  includeAll?: boolean;
  allLabel?: string;
};

const DEFAULT_BUILDING_TYPES: Option[] = [
  "Arch Buildings",
  "Warehouses",
  "Aviation",
  "Commercial",
  "Carports",
  "Sales Storage",
  "Workshops",
  "Barndominiums",
  "Agricultural",
  "Garages",
].map((t) => ({ value: t, label: t }));

export default function BuildingTypeSelector({
  id,
  value,
  onChange,
  className,
  triggerClassName,
  placeholder = "Select an option",
  options,
  includeAll = false,
  allLabel = "All",
}: Props) {
  const opts = options && options.length ? options : DEFAULT_BUILDING_TYPES;

  return (
    <div className={className}>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className={triggerClassName ?? "w-full"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAll ? (
            <SelectItem value="all">{allLabel}</SelectItem>
          ) : null}
          {opts.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
