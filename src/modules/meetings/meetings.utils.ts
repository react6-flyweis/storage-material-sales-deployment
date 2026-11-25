import type { Meeting } from "./meetings.api";

/** The API stores `"offline"`; older records / requests may say `"in-person"`. */
export function isOnlineMeeting(mode?: string | null) {
  return mode === "online";
}

/** Join/host actions only make sense for a scheduled online meeting with a link. */
export function isMeetingJoinable(
  meeting: Pick<Meeting, "mode" | "status" | "meetingLink">,
) {
  return (
    isOnlineMeeting(meeting.mode) &&
    meeting.status === "scheduled" &&
    Boolean(meeting.meetingLink?.trim())
  );
}

/** A link that Zoom generated for this meeting (vs. a manually pasted one). */
export function hasZoomLink(meeting: Pick<Meeting, "zoomMeetingId">) {
  return Boolean(meeting.zoomMeetingId);
}

/**
 * Build the ISO 8601 `meetingTime` sent to the API from the picked date
 * (yyyy-mm-dd) and time (HH:mm).
 */
export function toMeetingTimeIso(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`).toISOString();
}

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidUrl(value: string) {
  try {
    new URL(normalizeUrl(value));
    return true;
  } catch {
    return false;
  }
}
