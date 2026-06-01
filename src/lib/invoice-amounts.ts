const PERCENT_SCALE = 100;
const MONEY_SCALE = 100;

export function parseNumericInput(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function roundPercent(value: number) {
  return Math.round(value * PERCENT_SCALE) / PERCENT_SCALE;
}

export function roundMoney(value: number) {
  return Math.round(value * MONEY_SCALE) / MONEY_SCALE;
}

export function getAdjustmentAmount(
  value: string,
  type: "%" | "$",
  baseAmount: number,
) {
  const numericValue = parseNumericInput(value);

  if (!numericValue) {
    return 0;
  }

  const amount =
    type === "%" ? (baseAmount * numericValue) / 100 : numericValue;

  return roundMoney(amount);
}

export function getRemainingAfterAdjustment(
  totalAmount: number,
  adjustmentValue: string,
  adjustmentType: "%" | "$",
) {
  const reserved = getAdjustmentAmount(
    adjustmentValue,
    adjustmentType,
    totalAmount,
  );

  return roundMoney(Math.max(0, totalAmount - reserved));
}

export function getRemainingPercentAfterAdjustment(
  totalAmount: number,
  adjustmentValue: string,
  adjustmentType: "%" | "$",
) {
  if (totalAmount <= 0) {
    const remaining =
      adjustmentType === "%"
        ? Math.max(0, 100 - parseNumericInput(adjustmentValue))
        : 0;

    return roundPercent(remaining);
  }

  const reserved = getAdjustmentAmount(
    adjustmentValue,
    adjustmentType,
    totalAmount,
  );

  return roundPercent(Math.max(0, 100 - (reserved / totalAmount) * 100));
}

export function sumPercentValues(values: number[]) {
  return roundPercent(values.reduce((sum, value) => sum + value, 0));
}

export function sumMoneyValues(values: number[]) {
  return roundMoney(values.reduce((sum, value) => sum + value, 0));
}

export function exceedsPercentLimit(actual: number, limit: number) {
  return roundPercent(actual) > roundPercent(limit);
}

export function exceedsMoneyLimit(actual: number, limit: number) {
  return roundMoney(actual) > roundMoney(limit);
}
