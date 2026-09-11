import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  FileCheck,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import type { QuotationApprovalHistoryItem } from "@/modules/quotations/quotations.api";

function formatTimelineDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActorName(by?: QuotationApprovalHistoryItem["by"] | unknown) {
  if (!by) return "User";
  if (typeof by === "string") return by;
  if (typeof by === "object" && by !== null) {
    const actor = by as {
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    const fullName = `${actor.firstName || ""} ${actor.lastName || ""}`.trim();
    return fullName || actor.name || actor.email || actor.role || "User";
  }
  return "User";
}

function getStatusConfig(status?: string | null) {
  const effective = (status || "draft").toLowerCase().replace(/[\s-]/g, "_");

  switch (effective) {
    case "pending_approval":
    case "submitted":
      return {
        label: "Pending Approval",
        bg: "bg-amber-500",
        icon: Clock,
      };
    case "approved":
      return {
        label: "Approved",
        bg: "bg-emerald-600",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        label: "Rejected",
        bg: "bg-rose-600",
        icon: XCircle,
      };
    case "sent":
    case "sent_via_email":
      return {
        label: "Sent via Email",
        bg: "bg-blue-600",
        icon: Send,
      };
    case "marked_sent":
      return {
        label: "Marked Sent",
        bg: "bg-blue-600",
        icon: Send,
      };
    case "paid":
      return {
        label: "Paid",
        bg: "bg-green-600",
        icon: FileCheck,
      };
    case "accepted":
      return {
        label: "Accepted by Customer",
        bg: "bg-emerald-600",
        icon: CheckCircle2,
      };
    case "declined":
      return {
        label: "Declined",
        bg: "bg-rose-600",
        icon: XCircle,
      };
    case "overdue":
      return {
        label: "Overdue",
        bg: "bg-red-600",
        icon: AlertCircle,
      };
    case "revised":
    case "modified":
      return {
        label: "Revised",
        bg: "bg-purple-600",
        icon: FileText,
      };
    case "not_submitted":
      return {
        label: "Not Submitted",
        bg: "bg-slate-600",
        icon: FileText,
      };
    case "draft":
    default:
      return {
        label:
          effective
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || "Draft",
        bg: "bg-slate-500",
        icon: FileText,
      };
  }
}

function resolveEventVersion(
  event: QuotationApprovalHistoryItem,
  allEvents: QuotationApprovalHistoryItem[] = [],
  fallbackVersion?: number | string | null,
): number | string | null | undefined {
  // 1. Strictly prioritize the version specified directly on the API event item
  if (event.versionNumber !== undefined && event.versionNumber !== null) {
    return event.versionNumber;
  }
  if (event.version !== undefined && event.version !== null) {
    return event.version;
  }
  if (event.revision !== undefined && event.revision !== null) {
    return event.revision;
  }

  // 2. If the API item does not have a versionNumber:
  // Check if any other events in history have a higher version (e.g. version 2+)
  const hasHigherVersion = allEvents.some(
    (e) => typeof e.versionNumber === "number" && e.versionNumber > 1,
  );

  if (hasHigherVersion) {
    return 1;
  }

  // 3. If fallbackVersion is provided
  if (fallbackVersion !== undefined && fallbackVersion !== null) {
    return fallbackVersion;
  }

  return undefined;
}

interface QuotationApprovalTimelineProps {
  history?: QuotationApprovalHistoryItem[] | null;
  versionNumber?: number | string | null;
  className?: string;
  showEmpty?: boolean;
}

export function QuotationApprovalTimeline({
  history,
  versionNumber,
  className = "",
  showEmpty = false,
}: QuotationApprovalTimelineProps) {
  if (!history || history.length === 0) {
    if (!showEmpty) return null;
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-5 shadow-xs text-center ${className}`}
      >
        <p className="text-xs text-gray-500 py-3">No approval events recorded yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Approval History & Audit Trail
        </h4>
        <span className="text-xs text-gray-400 font-medium">
          {history.length} {history.length === 1 ? "event" : "events"}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {history.map((event, index) => {
          const config = getStatusConfig(event.status);
          const Icon = config.icon;
          const version = resolveEventVersion(event, history, versionNumber);

          return (
            <div key={index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${config.bg} text-white`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {config.label}
                    </span>
                    {version !== undefined && version !== null && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        v{version}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {getActorName(event.by)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatTimelineDate(event.at)}
                  </span>
                </div>

                {event.note && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100 mt-1">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
