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
  exceedsPercentLimit,
  parseNumericInput,
} from "@/lib/invoice-amounts";

type Props = {
  children?: React.ReactNode;
  initialType?: "%" | "$";
  initialValue?: string;
  maxAmount?: number;
  onDone: (payload: { type: "%" | "$"; value: string }) => void;
};

export default function AddMarkupDialog({
  children,
  initialValue = "",
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const type = "%";
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const numericValue = parseNumericInput(value.trim());
  const maxMarkupPercent = 100;

  const validationError =
    !value.trim()
      ? ""
      : exceedsPercentLimit(numericValue, maxMarkupPercent)
        ? "Markup exceeds 100%"
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
              Add Markup
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add a markup by percent
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Markup</Label>
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
