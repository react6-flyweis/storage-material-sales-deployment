export const formatLeadCurrency = (value = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatLeadDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatLeadDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

// Total number of progress steps for a lead lifecycle
export const LEAD_TOTAL_STEPS = 8;

export type LeadStatusType = "initial_contact" | "requirements_gathered" | "proposal_sent" | "negotiation" | "deal_closed" | "payment_done" | "converted_to_po" | "sent_to_admin";

const lifecycleStatusLabels: Record<LeadStatusType, string> = {
  initial_contact: "Initial contact",
  requirements_gathered: "Requirements gathered",
  proposal_sent: "Proposal sent",
  negotiation: "Negotiation",
  deal_closed: "Deal closed",
  payment_done: "Payment done",
  converted_to_po: "Converted to PO",
  sent_to_admin: "Sent to admin",
};

export const LEAD_LIFECYCLE_STEPS = Object.values(lifecycleStatusLabels);

export const formatLifecycleStatus = (value: string) =>
  lifecycleStatusLabels[value as LeadStatusType] ??
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const getLeadProgress = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("sent_to_admin")) return 8;
  if (normalized.includes("converted_to_po")) return 7;
  if (normalized.includes("payment")) return 6;
  if (normalized.includes("closed")) return 5;
  if (normalized.includes("negotiation")) return 4;
  if (normalized.includes("proposal") || normalized.includes("quotation")) {
    return 3;
  }
  if (normalized.includes("requirements")) return 2;
  if (normalized.includes("initial_contact")) return 1;

  return 1;
};

export const getStatusBadgeClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("sent_to_admin")) {
    return "bg-slate-100 text-slate-700";
  }

  if (normalized.includes("converted_to_po")) {
    return "bg-violet-100 text-violet-700";
  }

  if (normalized.includes("payment")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("deal_closed") || normalized.includes("closed")) {
    return "bg-green-100 text-green-700";
  }

  if (normalized.includes("proposal")) {
    return "bg-purple-100 text-purple-700";
  }

  if (normalized.includes("quotation")) {
    return "bg-orange-100 text-orange-700";
  }

  if (normalized.includes("negotiation")) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-700";
};

export const formatPhone = (phone?: {
  number?: string;
  countryCode?: string;
}) => {
  if (!phone?.number) return "-";
  return `${phone.countryCode ?? ""} ${phone.number}`.trim();
};

export const formatAuditAction = (
  action: string,
  metadata: Record<string, unknown> = {},
) => {
  switch (action) {
    case "lead.created":
      return "Lead created";
    case "lead.assigned.manual":
      return `Assigned to ${String(metadata.employeeName ?? "sales rep")}`;
    case "quotation.created":
      return `Quotation created (${formatLeadCurrency(Number(metadata.basePrice ?? 0))})`;
    case "quotation.sent":
      return `Quotation sent to ${String(metadata.sentTo ?? "customer")}`;
    case "quotation.edited":
      return "Quotation updated";
    case "invoice.created":
      return `Invoice ${String(metadata.invoiceNumber ?? "")} created`;
    case "invoice.sent":
      return `Invoice ${String(metadata.invoiceNumber ?? "")} sent`;
    case "invoice.paid":
      return `Invoice ${String(metadata.invoiceNumber ?? "")} paid`;
    case "payment.item_paid":
      return `Payment received: ${String(metadata.paymentName ?? "item")}`;
    case "lead.escalated":
      return "Lead escalated";
    case "escalation.resolved":
      return `Escalation resolved (${String(metadata.employeeName ?? "assigned")})`;
    default:
      return action
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

export const getAuditTypeLabel = (type: string) => formatLifecycleStatus(type);

export const getAuditPerformedBy = (entry: {
  performedBy?: string | null;
  metadata?: Record<string, unknown>;
}) => {
  const metadata = entry.metadata ?? {};

  if (metadata.employeeName) return String(metadata.employeeName);
  if (metadata.paidByName) return String(metadata.paidByName);
  if (entry.performedBy) return "Staff";

  return "System";
};

export const splitLeadDateTime = (value?: string | null) => {
  if (!value) return { date: "-", time: "" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "" };

  return {
    date: formatLeadDate(value),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
};

export const getAssignedEmployeeName = (
  auditLog: Array<{ action: string; metadata?: Record<string, unknown> }>,
) => {
  const assignment = [...auditLog]
    .reverse()
    .find((entry) => entry.action === "lead.assigned.manual");

  if (assignment?.metadata?.employeeName) {
    return String(assignment.metadata.employeeName);
  }

  return null;
};


export const LEAD_NO_NAME = "Untitled Lead"

export function getLeadProjectName(
  lead?: {
    projectName?: string | null;
    customerId?: { firstName?: string | null; name?: string | null } | null;
    buildingType?: string | null;
    location?: string | null;
  } | null,
  customer?: { firstName?: string | null; name?: string | null } | null
) {
  console.log(lead)
  if (lead?.projectName && lead.projectName !== "Untitled Lead" && lead.projectName !== "Untitled" && lead.projectName !== "N/A") {
    return lead.projectName;
  }
  const firstName = customer?.firstName || customer?.name || lead?.customerId?.firstName || lead?.customerId?.name || "Unknown";
  const parts: string[] = [firstName];
  if (lead?.buildingType && lead.buildingType !== "N/A" && lead.buildingType !== "—" && lead.buildingType !== "-") {
    parts.push(lead.buildingType);
  }
  if (lead?.location && lead.location !== "N/A" && lead.location !== "—" && lead.location !== "-") {
    parts.push(lead.location);
  }
  return parts.join("-");
}

export function canCreatePO(leadStatus: LeadStatusType) {
  const statusesNotEligible = ["initial_contact", "requirements_gathered"]
  return !statusesNotEligible.includes(leadStatus)
}