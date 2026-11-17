export interface ZoomSessionConfig {
  sdkKey: string;
  signature: string;
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail: string;
  zakToken?: string;
  role: 0 | 1; // 0 = attendee, 1 = host
  topic?: string;
}

export interface ZoomMeetingMetadata {
  meetingId: string;
  title: string;
  leadId?: string;
  leadName?: string;
  company?: string;
  customerEmail?: string;
  customerPhone?: string;
  quoteAmount?: string;
  meetingTime?: string;
  scheduledStartTime?: string;
  durationMinutes?: number;
  mode?: "online" | "in-person";
  notes?: string;
}

export interface ZoomParticipant {
  id: string;
  name: string;
  role: "host" | "participant" | "co-host";
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  avatar?: string;
  company?: string;
}

export interface ZoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "host" | "participant";
  message: string;
  timestamp: string;
}

export interface ZoomMeetingOutcomePayload {
  meetingId: string;
  leadId?: string;
  status: "completed" | "rescheduled" | "cancelled";
  outcome:
    | "Proposal Accepted"
    | "Follow-up Required"
    | "Needs Revised Quote"
    | "Deal Won"
    | "Not Interested"
    | "Other";
  notes: string;
  actualDurationMinutes: number;
  nextFollowUpDate?: string;
}
