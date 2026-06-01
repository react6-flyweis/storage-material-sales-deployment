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
  getRemainingAfterAdjustment,
  getRemainingPercentAfterAdjustment,
  parseNumericInput,
  roundMoney,
  roundPercent,
} from "@/lib/invoice-amounts";

type Props = {
  children?: React.ReactNode;
  initialType?: "%" | "$";
  initialValue?: string;
  maxAmount?: number;
  reservedScheduleValue?: string;
  reservedScheduleType?: "%" | "$";
  onDone: (payload: { type: "%" | "$"; value: string }) => void;
};

export default function AddDepositDialog({
  children,
  initialType = "%",
  initialValue = "",
  maxAmount,
  reservedScheduleValue = "",
  reservedScheduleType = "%",
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
  const invoiceTotal = maxAmount ?? 0;

  const maxDepositDollars = hasMaxAmount
    ? getRemainingAfterAdjustment(
        invoiceTotal,
        reservedScheduleValue,
        reservedScheduleType,
      )
    : Infinity;

  const maxDepositPercent = hasMaxAmount
    ? getRemainingPercentAfterAdjustment(
        invoiceTotal,
        reservedScheduleValue,
        reservedScheduleType,
      )
    : 100;

  const enteredDepositDollars = getAdjustmentAmount(
    value.trim(),
    type,
    invoiceTotal,
  );

  const validationError =
    !value.trim()
      ? ""
      : type === "%"
        ? exceedsPercentLimit(numericValue, maxDepositPercent)
          ? reservedScheduleValue.trim()
            ? "Deposit and payment schedule cannot exceed 100%"
            : "Deposit exceeds 100%"
          : ""
        : hasMaxAmount &&
            exceedsMoneyLimit(enteredDepositDollars, maxDepositDollars)
          ? reservedScheduleValue.trim()
            ? "Deposit and payment schedule cannot exceed the invoice total"
            : "Deposit exceeds the invoice total"
          : "";

  const remainingLabel = React.useMemo(() => {
    if (!value.trim()) {
      if (type === "%") {
        return `${maxDepositPercent.toFixed(2)}% available`;
      }
      if (hasMaxAmount) {
        return `$${maxDepositDollars.toFixed(2)} available`;
      }
      return "";
    }

    if (type === "%") {
      const rem = roundPercent(Math.max(0, maxDepositPercent - numericValue));
      return `${rem.toFixed(2)}% Remaining`;
    }
    if (hasMaxAmount) {
      const rem = roundMoney(Math.max(0, maxDepositDollars - enteredDepositDollars));
      return `$${rem.toFixed(2)} Remaining`;
    }
    return `$${enteredDepositDollars.toFixed(2)}`;
  }, [
    enteredDepositDollars,
    hasMaxAmount,
    maxDepositDollars,
    maxDepositPercent,
    numericValue,
    type,
    value,
  ]);

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
            <DialogTitle className="text-lg font-semibold">Deposit</DialogTitle>
            <DialogDescription className="sr-only">
              Get some peace of mind and get a deposit before the work starts.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-6">
              <p className="text-gray-700">
                Get some peace of mind and get a deposit before the work starts.
              </p>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deposit-type"
                    checked={type === "%"}
                    onChange={() => setType("%")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">%</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deposit-type"
                    checked={type === "$"}
                    onChange={() => setType("$")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">$</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label>Deposit</Label>
                <div className="relative">
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="10"
                    className="pr-12 h-12 rounded-lg"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {type}
                  </div>
                </div>
              </div>

              {remainingLabel && (
                <div className="text-center">
                  <div className="text-blue-600">{remainingLabel}</div>
                  {validationError && (
                    <div className="text-sm text-red-500 mt-2">
                      {validationError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleDone}
            disabled={!!validationError || !value.trim()}
            className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
