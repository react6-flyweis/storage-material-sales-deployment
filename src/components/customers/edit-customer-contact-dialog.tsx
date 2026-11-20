import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { useUpdateSalesCustomerMutation } from "@/modules/customers/customers.hooks";

type EditCustomerContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  email?: string;
  phone?: { number?: string; countryCode?: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Saves a customer's email and/or phone. Blank boxes are sent as "" which the
 * API treats as "leave the saved value alone" — they never clear a contact.
 */
export default function EditCustomerContactDialog({
  open,
  onOpenChange,
  customerId,
  email: initialEmail,
  phone: initialPhone,
}: EditCustomerContactDialogProps) {
  const mutation = useUpdateSalesCustomerMutation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail ?? "");
      setPhone(initialPhone?.number ?? "");
      setCountryCode(initialPhone?.countryCode || "+1");
      setError(null);
    }
  }, [open, initialEmail, initialPhone?.number, initialPhone?.countryCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await mutation.mutateAsync({
        customerId,
        payload: { email: trimmedEmail, phone: trimmedPhone, countryCode },
      });
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update contact. Please try again."));
    }
  };

  const isPending = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-contact-email" className="text-sm font-medium text-gray-800">
              Email
            </label>
            <Input
              id="edit-contact-email"
              type="email"
              placeholder="No email"
              value={email}
              disabled={isPending}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-contact-phone" className="text-sm font-medium text-gray-800">
              Phone
            </label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode} disabled={isPending}>
                <SelectTrigger className="w-[100px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+61">+61</SelectItem>
                  <SelectItem value="+86">+86</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="edit-contact-phone"
                type="tel"
                placeholder="No phone"
                className="flex-1"
                value={phone}
                disabled={isPending}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {!initialPhone?.number ? (
              <p className="text-xs text-gray-500">
                The first phone saved becomes the customer's initial portal password.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
