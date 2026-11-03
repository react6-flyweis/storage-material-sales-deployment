import type { InstallAddress } from "@/types/address.types";

export type StateOption = {
  code: string;
  name: string;
};

export const US_STATES: StateOption[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

/**
 * Compiles a readable legacy `location` string from structured address parts.
 */
export function buildLocationString(address: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  pincode?: string;
}): string {
  const parts: string[] = [];
  const line1 = address.line1?.trim();
  const line2 = address.line2?.trim();
  const city = address.city?.trim();
  const state = address.state?.trim();
  const zip = (address.postalCode || address.pincode)?.trim();

  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  if (city && state) {
    parts.push(zip ? `${city}, ${state} ${zip}` : `${city}, ${state}`);
  } else {
    if (city) parts.push(city);
    if (state) parts.push(zip ? `${state} ${zip}` : state);
    else if (zip) parts.push(zip);
  }

  return parts.join(", ") || "";
}

/**
 * Returns formatted address string for detail and display views.
 */
export function formatInstallAddress(
  installAddress?: InstallAddress | null,
  fallbackLocation?: string | null,
): string {
  if (installAddress && (installAddress.line1 || installAddress.city || installAddress.state)) {
    const formatted = buildLocationString(installAddress);
    if (formatted) return formatted;
  }
  return fallbackLocation?.trim() || "—";
}

/**
 * Parses legacy free-form location string when pre-filling edit forms.
 */
export function parseLocationFallback(location?: string | null): {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
} {
  const empty = { line1: "", line2: "", city: "", state: "", postalCode: "" };
  if (!location || !location.trim()) return empty;

  const raw = location.trim();
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    return { ...empty, line1: parts[0] };
  }

  if (parts.length === 2) {
    const secondPart = parts[1];
    const match = secondPart.match(/^([A-Za-z]{2,})\s*(\d{5}(?:-\d{4})?)?$/);
    if (match) {
      return {
        line1: "",
        line2: "",
        city: parts[0],
        state: match[1].toUpperCase(),
        postalCode: match[2] || "",
      };
    }
    return { ...empty, line1: parts[0], city: parts[1] };
  }

  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const cityPart = parts[parts.length - 2];
    const lineParts = parts.slice(0, parts.length - 2);

    const match = lastPart.match(/^([A-Za-z]{2,})\s*(\d{5}(?:-\d{4})?)?$/);
    if (match) {
      return {
        line1: lineParts.join(", "),
        line2: "",
        city: cityPart,
        state: match[1].toUpperCase(),
        postalCode: match[2] || "",
      };
    }

    return {
      line1: parts[0],
      line2: parts.length > 3 ? parts.slice(1, parts.length - 2).join(", ") : "",
      city: cityPart,
      state: lastPart,
      postalCode: "",
    };
  }

  return empty;
}
