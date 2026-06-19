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
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import {
  exceedsMoneyLimit,
  exceedsPercentLimit,
  getRemainingAfterAdjustment,
  getRemainingPercentAfterAdjustment,
  roundMoney,
  roundPercent,
  sumMoneyValues,
  sumPercentValues,
} from "@/lib/invoice-amounts";
import {
  buildDefaultSchedulePayments,
  isDepositStageName,
  type PaymentScheduleFormPayment,
} from "@/modules/payment-schedules/payment-schedules.utils";

type Payment = PaymentScheduleFormPayment;

type Props = {
  children?: React.ReactNode;
  leadId: string;
  maxAmount?: number;
  depositType?: "%" | "$";
  depositValue?: string;
  existingScheduleId?: string | null;
  initialType?: "%" | "$";
  initialPayments?: Payment[];
  onDone: (payload: {
    scheduleId: string;
    type: "%" | "$";
    payments: Payment[];
    depositType?: "%" | "$";
    depositValue?: string;
  }) => void;
};

function normalizePayment(payment: Payment) {
  return {
    name: (payment.name || "").trim(),
    amount: (payment.amount || "").trim(),
    dueDate: payment.dueDate,
  };
}

function isValidPayment(payment: ReturnType<typeof normalizePayment>) {
  return Boolean(payment.name && payment.amount);
}

export default function PaymentScheduleDialog({
  children,
  leadId,
  maxAmount,
  depositValue = "",
  existingScheduleId,
  initialType = "%",
  initialPayments = [],
  onDone,
}: Props) {
  type FormValues = { type: "%" | "$"; payments: Payment[] };

  const [open, setOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [activeScheduleId, setActiveScheduleId] = React.useState<string | null>(
    existingScheduleId ?? null,
  );

  const { control, register, handleSubmit, reset, setValue } =
    useForm<FormValues>({
      defaultValues: { type: initialType, payments: initialPayments },
      mode: "onChange",
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  React.useEffect(() => {
    if (!open) {
      setActiveScheduleId(existingScheduleId ?? null);
      reset({ type: initialType, payments: initialPayments });
      return;
    }

    setSubmitError("");
    const payments = initialPayments.length
      ? initialPayments
      : buildDefaultSchedulePayments(depositValue);
    reset({ type: initialType, payments });
    setActiveScheduleId(existingScheduleId ?? null);
  }, [
    open,
    initialType,
    initialPayments,
    depositValue,
    existingScheduleId,
    reset,
  ]);

  const watchedPayments = useWatch({ control, name: "payments" });
  const watchedType = useWatch({ control, name: "type" }) || initialType;

  const schedulePayments = (watchedPayments || []).filter(
    (payment) => !isDepositStageName(payment.name || ""),
  );

  const paymentAmounts = schedulePayments.map(
    (payment) => parseFloat(payment.amount || "0") || 0,
  );
  const totalAmount =
    watchedType === "%"
      ? sumPercentValues(paymentAmounts)
      : sumMoneyValues(paymentAmounts);

  const hasMaxAmount = Number.isFinite(maxAmount) && (maxAmount ?? 0) > 0;
  const invoiceTotal = maxAmount ?? 0;
  const depositPaymentFromForm = (watchedPayments || []).find((payment) =>
    isDepositStageName(payment.name || ""),
  );
  const currentDepositValue = depositPaymentFromForm?.amount ?? "";
  const currentDepositType = watchedType;
  const hasDeposit = Boolean(currentDepositValue.trim());

  const maxSchedulePercent = hasMaxAmount
    ? getRemainingPercentAfterAdjustment(
      invoiceTotal,
      currentDepositValue,
      currentDepositType,
    )
    : 100;

  const maxScheduleDollars = hasMaxAmount
    ? getRemainingAfterAdjustment(
      invoiceTotal,
      currentDepositValue,
      currentDepositType,
    )
    : Infinity;

  const validationError =
    watchedType === "%"
      ? exceedsPercentLimit(totalAmount, maxSchedulePercent)
        ? hasDeposit
          ? "Sum of payments exceeds the remaining amount after deposit"
          : "Sum of payments exceeds 100%"
        : ""
      : hasMaxAmount && exceedsMoneyLimit(totalAmount, maxScheduleDollars)
        ? hasDeposit
          ? "Sum of payments exceeds the remaining amount after deposit"
          : "Sum of payments exceeds the invoice total"
        : "";
  const error = validationError || submitError;

  const remainingLabel = React.useMemo(() => {
    if (watchedType === "%") {
      const rem = roundPercent(Math.max(0, maxSchedulePercent - totalAmount));
      return `${rem.toFixed(2)}% Remaining`;
    }
    if (hasMaxAmount) {
      const rem = roundMoney(Math.max(0, maxScheduleDollars - totalAmount));
      return `$${rem.toFixed(2)} Remaining`;
    }
    return `$${roundMoney(totalAmount).toFixed(2)} Total`;
  }, [
    hasMaxAmount,
    maxScheduleDollars,
    maxSchedulePercent,
    totalAmount,
    watchedType,
  ]);

  const resolveDepositPayment = (payments: Payment[]): Payment | null => {
    const depositFromForm = payments.find((payment) =>
      isDepositStageName(payment.name || ""),
    );
    if (depositFromForm) {
      return {
        name: "Deposit",
        amount: (depositFromForm.amount || "").trim(),
        dueDate: depositFromForm.dueDate,
      };
    }

    return null;
  };

  const buildSchedulePayments = (payments: Payment[]) => {
    const nonDepositPayments = payments
      .map(normalizePayment)
      .filter(
        (payment) => isValidPayment(payment) && !isDepositStageName(payment.name),
      );

    const depositPayment = resolveDepositPayment(payments);
    if (!depositPayment) {
      return nonDepositPayments;
    }

    return [depositPayment, ...nonDepositPayments];
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !leadId) {
      setSubmitError("Select a project before adding a payment schedule.");
      return;
    }

    setOpen(nextOpen);
  };

  const onSubmit = (data: FormValues) => {
    if (watchedType === "%" && exceedsPercentLimit(totalAmount, maxSchedulePercent)) {
      return;
    }
    if (
      watchedType === "$" &&
      hasMaxAmount &&
      exceedsMoneyLimit(totalAmount, maxScheduleDollars)
    ) {
      return;
    }

    const cleaned = buildSchedulePayments(data.payments);

    if (cleaned.length === 0) {
      setSubmitError("Add at least one payment stage.");
      return;
    }

    const depositPayment = resolveDepositPayment(data.payments);
    const resultPayload = {
      type: data.type,
      payments: cleaned,
      depositType: data.type,
      depositValue: depositPayment?.amount ?? "",
    };

    onDone({
      scheduleId: activeScheduleId ?? "",
      ...resultPayload,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                Payment Schedule
              </DialogTitle>
              <DialogDescription className="sr-only">
                Configure payment schedule
              </DialogDescription>
            </DialogHeader>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="%"
                      {...register("type")}
                      checked={watchedType === "%"}
                      onChange={() => setValue("type", "%")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">%</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="$"
                      {...register("type")}
                      checked={watchedType === "$"}
                      onChange={() => setValue("type", "$")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">$</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field, i) => (
                    <React.Fragment key={field.id}>
                      <div className="space-y-2">
                        <Label>Payment Name</Label>
                        <Input
                          {...register(`payments.${i}.name` as const)}
                          placeholder={
                            i === 0 ? "Deposit" : `Payment ${i + 1}`
                          }
                          className="h-12 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2 relative">
                        <Label>Payment Amount</Label>
                        <Input
                          type="number"
                          {...register(`payments.${i}.amount` as const)}
                          placeholder={watchedType === "%" ? "25%" : "0.00"}
                          className="h-12 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="absolute right-5 top-9 text-gray-400 hover:text-red-500"
                          aria-label={`remove-payment-${i}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => append({ name: "", amount: "" })}
                    className="flex items-center gap-3 text-blue-600 hover:underline mt-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Add payment</span>
                  </button>
                </div>

                <div className="text-center">
                  <div className="text-blue-600">{remainingLabel}</div>
                  {error && (
                    <div className="text-sm text-red-500 mt-2">{error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex items-center justify-end gap-4">
            <DialogClose asChild>
              <Button
                size="lg"
                className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              size="lg"
              disabled={!!validationError}
              className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
