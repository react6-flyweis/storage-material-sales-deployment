/**
 * Helpers for the channel a lead / chat message came from
 * (website widget, Facebook Messenger, phone call).
 *
 * Backend contract: docs/frontend-handoff (Facebook Messenger — admin and sales chat).
 * Every message carries `origin`, `source` and `sourceLabel`; chat-status carries `channel`.
 * When an older backend omits `sourceLabel`, we derive it from `origin`.
 */

export type MessageOrigin = "chat" | "messenger" | "call";
export type MessageSource = "website" | "facebook" | "phone";
export type MessageSourceLabel = "Website" | "Facebook" | "Phone";
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
};

export function getMessageSource(message: MessageLike): MessageSource {
  const source = message.source?.toLowerCase();
  if (source === "website" || source === "facebook" || source === "phone") {
    return source;
  }

  const label = message.sourceLabel?.toLowerCase();
  if (label === "facebook") return "facebook";
  if (label === "phone") return "phone";
  if (label === "website") return "website";

  if (message.origin === "messenger") return "facebook";
  if (message.origin === "call" || message.channel === "call" || message.callSessionId) {
    return "phone";
  }
  return "website";
}

export function getMessageSourceLabel(message: MessageLike): MessageSourceLabel {
  const label = message.sourceLabel;
  if (label === "Website" || label === "Facebook" || label === "Phone") {
    return label;
  }
  return LABEL_BY_SOURCE[getMessageSource(message)];
}

export function isMessengerLead(lead?: { source?: string | null } | null) {
  return lead?.source?.toLowerCase() === "messenger";
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
