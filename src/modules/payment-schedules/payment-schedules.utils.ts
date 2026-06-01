import type { PaymentScheduleDocument } from "@/modules/invoices/invoices.api";

export type PaymentScheduleFormPayment = {
  name: string;
  amount: string;
  dueDate?: string;
};

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

export function isDepositStageName(name?: string | null) {
  return name?.trim().toLowerCase() === "deposit";
}

export function getDepositFromScheduleStages(
  stages?: PaymentScheduleDocument["stages"],
): { depositType: "%" | "$"; depositValue: string } | null {
  const depositStage = stages?.find((stage) =>
    isDepositStageName(stage?.stageName),
  );
  if (depositStage?.amount == null || !Number.isFinite(depositStage.amount)) {
    return null;
  }

  return {
    depositType: depositStage.amountType === "percentage" ? "%" : "$",
    depositValue: String(depositStage.amount),
  };
}

export function paymentScheduleToDialogValues(
  schedule?: PaymentScheduleDocument | null,
): { type: "%" | "$"; payments: PaymentScheduleFormPayment[] } {
  const stages = schedule?.stages?.filter((stage) => stage) ?? [];
  if (!stages.length) {
    return { type: "%", payments: [] };
  }

  const type: "%" | "$" =
    stages[0]?.amountType === "percentage" ? "%" : "$";

  return {
    type,
    payments: stages.map((stage) => ({
      name: stage.stageName?.trim() || "Payment",
      amount:
        stage.amount != null && Number.isFinite(stage.amount)
          ? String(stage.amount)
          : "",
      dueDate: stage.dueDate ? formatDateForInput(stage.dueDate) : "",
    })),
  };
}

export function buildDefaultSchedulePayments(
  depositValue: string,
): PaymentScheduleFormPayment[] {
  if (depositValue.trim()) {
    return [
      { name: "Deposit", amount: depositValue.trim() },
      { name: "", amount: "" },
    ];
  }

  return [{ name: "", amount: "" }];
}
