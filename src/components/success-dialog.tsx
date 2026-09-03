import checkCircleImage from "@/assets/images/check-circle.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

type SuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  okLabel?: string;
  onOk?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children?: React.ReactNode;
};

export default function SuccessDialog({
  open,
  onClose,
  title = "Success!",
  description,
  okLabel = "Ok",
  onOk,
  secondaryLabel,
  onSecondary,
  children,
}: SuccessDialogProps) {
  const hasSecondary = Boolean(secondaryLabel && onSecondary);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-md rounded-2xl p-8 text-center shadow-lg">
        <DialogHeader>
          <DialogTitle className="mx-auto mb-2 max-w-xs text-2xl font-semibold leading-tight text-slate-900">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-500 max-w-xs mx-auto">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mx-auto my-4 flex h-28 w-28 items-center justify-center">
          <img
            src={checkCircleImage}
            alt="success"
            className="size-44 rounded-full object-cover"
          />
        </div>

        <DialogFooter className={`mt-3 ${hasSecondary ? "flex flex-col-reverse sm:flex-row gap-3 sm:justify-center" : "sm:justify-center"}`}>
          {hasSecondary && (
            <Button
              type="button"
              variant="outline"
              onClick={onSecondary}
              className="w-full sm:w-44"
            >
              {secondaryLabel}
            </Button>
          )}
          {children || (
            hasSecondary ? (
              <Button
                type="button"
                onClick={onOk || onClose}
                className="w-full sm:w-44 bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                {okLabel}
              </Button>
            ) : (
              <DialogClose asChild>
                <Button onClick={onOk || onClose} className="w-52">
                  {okLabel}
                </Button>
              </DialogClose>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
