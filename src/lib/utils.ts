import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string | undefined | null, countryCode?: string | null) {
  if (!phone) return "N/A";
  if (phone.startsWith("+")) return phone;
  const digits = phone.replace(/\D/g, "");
  if (countryCode) {
    const formattedCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
    return digits ? `${formattedCode} ${digits}` : formattedCode;
  }
  const isUS = digits.startsWith("1");
  const remaining = isUS ? digits.slice(1) : digits;
  return remaining ? `+1 ${remaining}` : "+1 ";
}
