import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  exceedsMoneyLimit,
  exceedsPercentLimit,
  getAdjustmentAmount,
  parseNumericInput,
} from "@/lib/invoice-amounts";

type Props = {
  children?: React.ReactNode;
  initialType?: "%" | "$";
  initialValue?: string;
  maxAmount?: number;
  onDone: (payload: { type: "%" | "$"; value: string }) => void;
};

export default function AddDiscountDialog({
  children,
  initialType = "%",
  initialValue = "",
  maxAmount,
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"%" | "$">(initialType);
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setType(initialType);
    setValue(initialValue);
  }, [initialType, initialValue]);

  const hasMaxAmount = Number.isFinite(maxAmount) && (maxAmount ?? 0) > 0;
  const numericValue = parseNumericInput(value.trim());
  const baseSubtotal = maxAmount ?? 0;

  const maxDiscountDollars = hasMaxAmount ? baseSubtotal : Infinity;
  const maxDiscountPercent = 100;

  const enteredDiscountDollars = getAdjustmentAmount(
    value.trim(),
    type,
    baseSubtotal,
  );

  const validationError =
    !value.trim()
      ? ""
      : type === "%"
        ? exceedsPercentLimit(numericValue, maxDiscountPercent)
          ? "Discount exceeds 100%"
          : ""
        : hasMaxAmount &&
            exceedsMoneyLimit(enteredDiscountDollars, maxDiscountDollars)
          ? "Discount exceeds the subtotal"
          : "";


  const handleDone = () => {
    const trimmed = value.trim();
    if (!trimmed || validationError) return;
    onDone({ type, value: trimmed });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Add discount
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add a discount by percent or dollar
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="discount-type"
                    checked={type === "%"}
                    onChange={() => setType("%")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">%</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="discount-type"
                    checked={type === "$"}
                    onChange={() => setType("$")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">$</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="10"
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {type}
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="text-center">
                  <div className="text-sm text-red-500">
                    {validationError}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-end gap-4">
          <DialogClose asChild>
            <Button
              size="lg"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg w-32"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleDone}
            disabled={!!validationError || !value.trim()}
            className="rounded-lg w-32 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
