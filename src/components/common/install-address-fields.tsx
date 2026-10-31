import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { US_STATES } from "@/lib/address";
import { cn } from "@/lib/utils";

export type AddressFormValues = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export type AddressFieldErrors = Partial<Record<keyof AddressFormValues, string>>;

type InstallAddressFieldsProps = {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
  errors?: AddressFieldErrors;
  disabled?: boolean;
  className?: string;
  idPrefix?: string;
};

export default function InstallAddressFields({
  values,
  onChange,
  errors = {},
  disabled = false,
  className,
  idPrefix = "install-addr",
}: InstallAddressFieldsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Street Address Line 1 */}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-line1`} className="text-xs font-medium text-slate-700">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${idPrefix}-line1`}
          name="line1"
          placeholder="e.g. 100 Industrial Blvd"
          value={values.line1}
          onChange={(e) => onChange("line1", e.target.value)}
          disabled={disabled}
          className={cn(errors.line1 && "border-red-500 ring-1 ring-red-500")}
        />
        {errors.line1 && <p className="text-xs text-red-500">{errors.line1}</p>}
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-city`} className="text-xs font-medium text-slate-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${idPrefix}-city`}
            name="city"
            placeholder="e.g. Austin"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            disabled={disabled}
            className={cn(errors.city && "border-red-500 ring-1 ring-red-500")}
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>

        {/* State */}
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-state`} className="text-xs font-medium text-slate-700">
            State <span className="text-red-500">*</span>
          </Label>
          <Select
            value={values.state}
            onValueChange={(val) => onChange("state", val)}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${idPrefix}-state`}
              className={cn("w-full bg-white", errors.state && "border-red-500 ring-1 ring-red-500")}
            >
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {US_STATES.map((st) => (
                <SelectItem key={st.code} value={st.code}>
                  {st.code} - {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
        </div>

        {/* ZIP / Postal Code */}
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-postalCode`} className="text-xs font-medium text-slate-700">
            ZIP / Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${idPrefix}-postalCode`}
            name="postalCode"
            placeholder="e.g. 78701"
            value={values.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            disabled={disabled}
            className={cn(errors.postalCode && "border-red-500 ring-1 ring-red-500")}
          />
          {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );
}
