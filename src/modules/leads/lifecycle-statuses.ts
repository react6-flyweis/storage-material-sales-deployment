export const LEAD_LIFECYCLE_STATUSES = [
  { value: "initial_contact", label: "Initial contact" },
  { value: "requirements_gathered", label: "Requirements gathered" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "deal_closed", label: "Deal closed" },
  { value: "payment_done", label: "Payment done" },
  { value: "converted_to_po", label: "Converted to PO" },
  { value: "sent_to_admin", label: "Sent to admin" },
] as const;

export type LeadLifecycleStatusValue =
  (typeof LEAD_LIFECYCLE_STATUSES)[number]["value"];

export type LeadLifecycleStep = {
  id: number;
  label: string;
  value: LeadLifecycleStatusValue;
  labelSub?: string;
  current?: boolean;
  date?: string;
};

export const LEAD_LIFECYCLE_STEPS: LeadLifecycleStep[] =
  LEAD_LIFECYCLE_STATUSES.map((status, index) => ({
    id: index + 1,
    label: status.label.replace(/ /g, "\n"),
    value: status.value,
  }));

export const getLeadLifecycleStepId = (status?: string | null) => {
  if (!status) return 1;

  const index = LEAD_LIFECYCLE_STATUSES.findIndex(
    (item) => item.value === status,
  );

  return index >= 0 ? index + 1 : 1;
};

export const getLeadLifecycleStatusLabel = (status?: string | null) => {
  if (!status) return "—";

  const matched = LEAD_LIFECYCLE_STATUSES.find((item) => item.value === status);

  return matched?.label ?? status.replace(/_/g, " ");
};

export const getLeadLifecycleBadgeClassName = (status?: string | null) => {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized === "deal_closed") {
    return "bg-[#DCFCE7] text-[#16A34A]";
  }

  if (normalized === "payment_done") {
    return "bg-[#D1FAE5] text-[#059669]";
  }

  if (normalized === "proposal_sent") {
    return "bg-[#FEF3C7] text-[#D97706]";
  }

  if (normalized === "negotiation") {
    return "bg-[#DBEAFE] text-[#2563EB]";
  }

  if (normalized === "converted_to_po") {
    return "bg-[#EDE9FE] text-[#7C3AED]";
  }

  if (normalized === "sent_to_admin") {
    return "bg-[#E2E8F0] text-[#475569]";
  }

  if (normalized === "requirements_gathered") {
    return "bg-[#E0F2FE] text-[#0284C7]";
  }

  return "bg-[#F1F5F9] text-[#475569]";
};

export const getLeadLifecycleBadgeDotClassName = (status?: string | null) => {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized === "deal_closed") {
    return "bg-[#16A34A]";
  }

  if (normalized === "payment_done") {
    return "bg-[#059669]";
  }

  if (normalized === "proposal_sent") {
    return "bg-[#D97706]";
  }

  if (normalized === "negotiation") {
    return "bg-[#2563EB]";
  }

  if (normalized === "converted_to_po") {
    return "bg-[#7C3AED]";
  }

  if (normalized === "sent_to_admin") {
    return "bg-[#475569]";
  }

  if (normalized === "requirements_gathered") {
    return "bg-[#0284C7]";
  }

  return "bg-[#475569]";
};
