/**
 * Utility functions for 2 decimal point rounding and formatting in PEMB Quotes
 */

/**
 * Format a number/string to currency with 2 decimal places: e.g. $22,055.84
 */
export function formatCurrency2(
  val: number | string | null | undefined,
  fallback = "-"
): string {
  if (val == null || val === "" || isNaN(Number(val))) return fallback;
  const n = Number(val);
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format a number with 2 decimal places: e.g. 13,325.61
 */
export function formatNumber2(
  val: number | string | null | undefined,
  fallback = "-"
): string {
  if (val == null || val === "" || isNaN(Number(val))) return fallback;
  const n = Number(val);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format percentage with 2 decimal places: e.g. 23.10%
 */
export function formatPercent2(
  val: number | string | null | undefined,
  fallback = "-"
): string {
  if (val == null || val === "" || isNaN(Number(val))) return fallback;
  const cleanVal = String(val).replace(/%/g, "").trim();
  if (isNaN(Number(cleanVal))) return String(val);
  const n = Number(cleanVal);
  return (
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%"
  );
}

/**
 * Format price per square foot with 2 decimal places: e.g. $15.68
 */
export function formatSfPrice2(
  val: number | string | null | undefined,
  fallback = "-"
): string {
  if (val == null || val === "" || val === "-") return fallback;
  const cleanVal = String(val).replace(/^\$/, "").trim();
  if (isNaN(Number(cleanVal))) return String(val);
  const n = Number(cleanVal);
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format rate strings/numbers to 2 decimal places: e.g. "$1.3/SF" -> "$1.30/SF", 1.2 -> "$1.20/lb"
 */
export function formatRate2(
  val: number | string | null | undefined,
  fallback = "-"
): string {
  if (val == null || val === "" || val === "-") return fallback;
  if (typeof val === "number") {
    return `$${val.toFixed(2)}/lb`;
  }
  const str = String(val).trim();
  const match = str.match(/^(\$?)([0-9.]+)(\/.*)?$/);
  if (match && !isNaN(Number(match[2]))) {
    const num = Number(match[2]);
    return `${match[1] || "$"}${num.toFixed(2)}${match[3] || ""}`;
  }
  return str;
}

/**
 * Round a number to 2 decimal places as a number
 */
export function round2(val: number | string | null | undefined): number {
  if (val == null || val === "" || isNaN(Number(val))) return 0;
  return Math.round(Number(val) * 100) / 100;
}
