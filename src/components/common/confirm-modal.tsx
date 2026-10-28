import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  loadingText?: string;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const variantConfig = {
  danger: {
    iconBg: "bg-red-50 text-red-600 border border-red-100",
    confirmBtn:
      "bg-red-600 hover:bg-red-700 text-white shadow-xs focus-visible:ring-red-500",
    defaultIcon: <Trash2 className="h-4 w-4" />,
    defaultConfirmText: "Delete",
  },
  warning: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    confirmBtn:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus-visible:ring-amber-500",
    defaultIcon: <AlertTriangle className="h-4 w-4" />,
    defaultConfirmText: "Confirm",
  },
  info: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    confirmBtn:
      "bg-primary hover:bg-primary/90 text-white shadow-xs focus-visible:ring-primary",
    defaultIcon: <Info className="h-4 w-4" />,
    defaultConfirmText: "Continue",
  },
};

export default function ConfirmModal({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  loadingText,
  onConfirm,
  children,
  icon,
}: ConfirmModalProps) {
  const currentVariant = variantConfig[variant];

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isLoading) {
          onOpenChange(val);
        }
      }}
    >
      <DialogContent
        showCloseButton={!isLoading}
        className="w-[calc(100%-2rem)] max-w-sm rounded-xl p-5 shadow-xl border border-slate-200/80 gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5",
              currentVariant.iconBg,
            )}
          >
            {icon || currentVariant.defaultIcon}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <DialogHeader className="p-0 text-left space-y-1">
              <DialogTitle className="text-sm font-semibold text-slate-900 leading-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>

            {children && <div className="mt-2.5">{children}</div>}
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-1 border-t border-slate-100 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="h-8 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 border-slate-200 rounded-lg cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={handleConfirm}
            className={cn(
              "h-8 px-3.5 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1.5",
              currentVariant.confirmBtn,
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{loadingText || "Processing..."}</span>
              </>
            ) : (
              <span>{confirmText || currentVariant.defaultConfirmText}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
