/**
 * Helpers for the channel a lead / chat message came from
 * (website widget, Facebook Messenger, phone call, Meta lead ad instant form).
 *
 * Backend contract: docs/frontend-handoff (Facebook Messenger — admin and sales chat).
 * Every message carries `origin`, `source` and `sourceLabel`; chat-status carries `channel`.
 * When an older backend omits `sourceLabel`, we derive it from `origin`.
 */

export type MessageOrigin = "chat" | "messenger" | "call" | "meta_lead";
export type MessageSource = "website" | "facebook" | "phone" | "facebook_lead_ad";
export type MessageSourceLabel = "Website" | "Facebook" | "Phone" | "Meta lead ad";
export type ChatChannel = "website" | "facebook";

type MessageLike = {
  origin?: string | null;
  source?: string | null;
  sourceLabel?: string | null;
  channel?: string | null;
  callSessionId?: string | null;
};

const LABEL_BY_SOURCE: Record<MessageSource, MessageSourceLabel> = {
  website: "Website",
  facebook: "Facebook",
  phone: "Phone",
  facebook_lead_ad: "Meta lead ad",
};

export function getMessageSource(message: MessageLike): MessageSource {
  const source = message.source?.toLowerCase();
  if (
    source === "website" ||
    source === "facebook" ||
    source === "phone" ||
    source === "facebook_lead_ad"
  ) {
    return source;
  }

  const label = message.sourceLabel?.toLowerCase();
  if (label === "meta lead ad") return "facebook_lead_ad";
  if (label === "facebook") return "facebook";
  if (label === "phone") return "phone";
  if (label === "website") return "website";

  if (message.origin === "meta_lead") return "facebook_lead_ad";
  if (message.origin === "messenger") return "facebook";
  if (message.origin === "call" || message.channel === "call" || message.callSessionId) {
    return "phone";
  }
  return "website";
}

export function getMessageSourceLabel(message: MessageLike): MessageSourceLabel {
  const label = message.sourceLabel;
  if (
    label === "Website" ||
    label === "Facebook" ||
    label === "Phone" ||
    label === "Meta lead ad"
  ) {
    return label;
  }
  return LABEL_BY_SOURCE[getMessageSource(message)];
}

export function isMessengerLead(lead?: { source?: string | null } | null) {
  return lead?.source?.toLowerCase() === "messenger";
}

/** Facebook / Instagram instant form lead (not Messenger). */
export function isMetaLeadAdLead(lead?: { source?: string | null } | null) {
  return lead?.source?.toLowerCase() === "meta_lead_ads";
}

/** Leads whose contact details may legitimately be missing (no "No email" warning). */
export function isOptionalContactLead(lead?: { source?: string | null } | null) {
  return isMessengerLead(lead) || isMetaLeadAdLead(lead);
}

/** Badge for lead.source on list rows; null = no badge. */
export function getLeadSourceBadge(
  source?: string | null,
): { source: MessageSource; label: string } | null {
  switch (source?.toLowerCase()) {
    case "meta_lead_ads":
      return { source: "facebook_lead_ad", label: "Meta lead ad" };
    case "messenger":
      return { source: "facebook", label: "Facebook" };
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Meta lead ads — instant form answers (lead detail `metaLeadAd.fieldData`)
// ---------------------------------------------------------------------------

/**
 * Meta field keys the backend already maps onto lead / customer columns
 * (contact, location, project name, notes). These are shown in the normal
 * cards, so the Meta lead form section skips them. Keep in sync with backend
 * leadAds.service mappings.
 */
export const MAPPED_META_KEYS = new Set([
  "full_name",
  "name",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "phone",
  "city",
  "state",
  "province",
  "zip_code",
  "zip",
  "post_code",
  "street_address",
  "address",
  "building_type",
  "project_type",
  "comments",
  "message",
  "notes",
  "details",
]);

export function isMappedMetaField(name?: string | null) {
  return MAPPED_META_KEYS.has((name ?? "").trim().toLowerCase());
}

/** "what_size_building_do_you_need" → "What Size Building Do You Need" */
export function formatMetaFieldLabel(name?: string | null) {
  return (name ?? "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatMetaFieldValue(values?: string[] | null) {
  return (values ?? []).filter((v) => v != null && String(v).trim() !== "").join(", ");
}

/** Resolve the thread channel: chat-status `channel` wins, otherwise fall back to lead.source. */
export function resolveChatChannel(
  statusChannel?: string | null,
  lead?: { source?: string | null } | null,
): ChatChannel {
  if (statusChannel === "facebook" || statusChannel === "website") {
    return statusChannel;
  }
  return isMessengerLead(lead) ? "facebook" : "website";
}

/** Old Messenger leads were created with placeholder contact values — never show them. */
export function isPlaceholderEmail(email?: string | null) {
  if (!email) return true;
  return /@pending\.messenger\.local$/i.test(email.trim());
}

export function isPlaceholderPhone(
  phone?: string | null,
  countryCode?: string | null,
) {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return true;
  const cc = (countryCode ?? "").replace(/\D/g, "");
  // Placeholder pattern: country code "+0" with the Facebook PSID stored as the number.
  if (countryCode != null && cc === "0") return true;
  if (/^\+0(\D|$)/.test(phone.trim())) return true;
  return false;
}

export function getCleanEmail(email?: string | null) {
  return isPlaceholderEmail(email) ? "" : (email ?? "").trim();
}

export function getCleanPhone(
  phone?: string | { number?: string | null; countryCode?: string | null } | null,
): { number: string; countryCode: string | null } | null {
  if (!phone) return null;
  const number = typeof phone === "string" ? phone : (phone.number ?? "");
  const countryCode = typeof phone === "string" ? null : (phone.countryCode ?? null);
  if (isPlaceholderPhone(number, countryCode)) return null;
  return { number, countryCode };
}
