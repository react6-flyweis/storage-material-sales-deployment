export type BusinessUnitType = "steel" | "storage_material";

export const BUSINESS_UNIT_OPTIONS = [
  { value: "steel", label: "Steel Building Depot" },
  { value: "storage_material", label: "Storage Material Platform" },
] as const;

export const BUSINESS_UNIT_FILTER_OPTIONS = [
  { value: "all", label: "All Business Units" },
  { value: "steel", label: "Steel Building Depot" },
  { value: "storage_material", label: "Storage Material Platform" },
  { value: "none", label: "Not set" },
] as const;

/**
 * Normalizes input string (e.g. " STEEL ", "Steel") to valid BusinessUnitType or null
 */
export function normalizeBusinessUnit(value?: string | null): BusinessUnitType | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "steel" || trimmed === "steel building depot") {
    return "steel";
  }
  if (
    trimmed === "storage_material" ||
    trimmed === "storage material" ||
    trimmed === "storage material platform"
  ) {
    return "storage_material";
  }
  return null;
}

/**
 * Returns formatted label or "Not set" if empty/unset
 */
export function formatBusinessUnit(
  value?: string | null,
  label?: string | null,
): string {
  if (label && label.trim() !== "") {
    return label;
  }
  if (!value) {
    return "Not set";
  }
  const normalized = normalizeBusinessUnit(value);
  if (!normalized) {
    return "Not set";
  }
  const option = BUSINESS_UNIT_OPTIONS.find((opt) => opt.value === normalized);
  return option ? option.label : "Not set";
}

export function getBusinessUnitBadgeClassName(unit?: string | null): string {
  const normalized = normalizeBusinessUnit(unit);
  switch (normalized) {
    case "steel":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "storage_material":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
