import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";

export type NewCustomerFormData = {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewCustomerFormData) => Promise<void> | void;
  isPending?: boolean;
  errorMessage?: string | null;
};

const COUNTRY_CODES = [
  { value: "+1 (USA)", label: "+1 (USA)" },
  { value: "+1 (Canada)", label: "+1 (Canada)" },
  { value: "+44 (UK)", label: "+44 (UK)" },
  { value: "+91 (India)", label: "+91 (India)" },
  { value: "+61 (Australia)", label: "+61 (Australia)" },
  { value: "+49 (Germany)", label: "+49 (Germany)" },
  { value: "+33 (France)", label: "+33 (France)" },
];

export default function AddNewCustomerModal({
  open,
  onOpenChange,
  onSubmit,
  isPending: externalIsPending,
  errorMessage: externalErrorMessage,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1 (USA)");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  const isLoading = Boolean(externalIsPending || internalIsSubmitting);
  const displayError = externalErrorMessage || internalError;

  const handleClose = () => {
    if (isLoading) return;
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomerName("");
    setEmail("");
    setCountryCode("+1 (USA)");
    setPhoneNumber("");
    setFieldErrors({});
    setInternalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    const newErrors: {
      customerName?: string;
      email?: string;
      phoneNumber?: string;
    } = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      setInternalIsSubmitting(true);
      await onSubmit({
        name: customerName.trim(),
        email: email.trim(),
        countryCode,
        phoneNumber: phoneNumber.trim(),
      });

      // Close and reset ONLY when mutation succeeds
      handleClose();
    } catch (err) {
      // Keep modal open and show error inside modal
      const message = getApiErrorMessage(
        err,
        "Failed to add customer. Please try again.",
      );
      setInternalError(message);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) {
          if (!nextOpen) resetForm();
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[480px] rounded-xl p-6 bg-white border border-gray-100 shadow-xl gap-5"
        showCloseButton={!isLoading}
      >
        <DialogHeader className="p-0">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Add New Customer
          </DialogTitle>
        </DialogHeader>

        {/* Mutation / API error banner */}
        {displayError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1 leading-snug">{displayError}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-customer-name"
              className="text-sm font-medium text-gray-800"
            >
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="modal-customer-name"
              type="text"
              placeholder="John Doe"
              value={customerName}
              disabled={isLoading}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (fieldErrors.customerName) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    customerName: undefined,
                  }));
                }
              }}
              className="h-10 rounded-lg border-gray-300 placeholder:text-gray-400 focus-visible:ring-blue-500 disabled:opacity-60"
            />
            {fieldErrors.customerName && (
              <p className="text-xs text-red-500">{fieldErrors.customerName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-customer-email"
              className="text-sm font-medium text-gray-800"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="modal-customer-email"
              type="email"
              placeholder="john@example.com"
              value={email}
              disabled={isLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className="h-10 rounded-lg border-gray-300 placeholder:text-gray-400 focus-visible:ring-blue-500 disabled:opacity-60"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Country Code and Phone Number in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-customer-country-code"
                className="text-sm font-medium text-gray-800"
              >
                Country Code <span className="text-red-500">*</span>
              </label>
              <Select
                value={countryCode}
                onValueChange={setCountryCode}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="modal-customer-country-code"
                  className="h-10 w-full rounded-lg border-gray-300 bg-white disabled:opacity-60"
                >
                  <SelectValue placeholder="+1 (USA)" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {COUNTRY_CODES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="modal-customer-phone"
                className="text-sm font-medium text-gray-800"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="modal-customer-phone"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                disabled={isLoading}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (fieldErrors.phoneNumber) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      phoneNumber: undefined,
                    }));
                  }
                }}
                className="h-10 rounded-lg border-gray-300 placeholder:text-gray-400 focus-visible:ring-blue-500 disabled:opacity-60"
              />
              {fieldErrors.phoneNumber && (
                <p className="text-xs text-red-500">{fieldErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 px-4 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>Adding Customer...</span>
                </>
              ) : (
                <span>Add Customer</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
