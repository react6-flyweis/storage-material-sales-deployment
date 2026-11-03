import type { QuotationWorkflowStatus } from "./quotations.api";

export type QuotationResolvedLifecycle =
  | QuotationWorkflowStatus
  | "customer_rejected"
  | "customer_accepted";

export interface QuotationLifecycleInfo {
  lifecycleStatus: QuotationWorkflowStatus;
  label: string;
  isCustomerRejected: boolean;
  isClientRejected?: boolean;
  isAdminRejected: boolean;
  isCustomerAccepted: boolean;
  isAccepted?: boolean;
  isSent: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  isDraft: boolean;
  clientNotes?: string | null;
  adminRejectionReason?: string | null;
  customerDecisionAt?: string | null;
}

export interface QuotationLifecycleSource {
  status?: string | null;
  quotationStatus?: string | null;
  quotation_status?: string | null;
  workflowStatus?: string | null;
  approvalStatus?: string | null;
  sentAt?: string | null;
  sendMethod?: string | null;
  clientNotes?: string | null;
  customerRejectedAt?: string | null;
  customerDecisionAt?: string | null;
  customerAcceptedAt?: string | null;
  updatedAt?: string | null;
  approval?: {
    status?: string | null;
    rejectionReason?: string | null;
    history?: Array<{ status?: string | null; note?: string | null; at?: string | null; [key: string]: unknown }>;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface WorkflowStatusBadgeConfig {
  label: string;
  className: string;
  dotClassName: string;
  iconText?: string;
}

export const QUOTATION_WORKFLOW_STATUS_CONFIG: Record<
  QuotationWorkflowStatus,
  WorkflowStatusBadgeConfig
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    dotClassName: "bg-gray-400",
    iconText: "📝",
  },
  pending_approval: {
    label: "Pending Approval",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotClassName: "bg-yellow-500",
    iconText: "⏳",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border-green-200",
    dotClassName: "bg-green-500",
    iconText: "✅",
  },
  admin_rejected: {
    label: "Admin rejected",
    className: "bg-red-100 text-red-700 border-red-200",
    dotClassName: "bg-red-500",
    iconText: "❌",
  },
  sent: {
    label: "Sent",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    dotClassName: "bg-purple-500",
    iconText: "📬",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotClassName: "bg-emerald-500",
    iconText: "🤝",
  },
  client_rejected: {
    label: "Client rejected",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    dotClassName: "bg-rose-500",
    iconText: "🛑",
  },
};

export function normalizeWorkflowStatus(val?: unknown): QuotationWorkflowStatus {
  if (typeof val !== "string") return "draft";
  const s = val.trim().toLowerCase().replace(/[\s-]/g, "_");
  if (s === "pending" || s === "pending_approval") return "pending_approval";
  if (s === "approved") return "approved";
  if (s === "admin_rejected" || s === "rejected_by_admin") return "admin_rejected";
  if (s === "sent" || s === "marked_sent" || s === "sent_via_email") return "sent";
  if (s === "accepted" || s === "customer_accepted") return "accepted";
  if (s === "client_rejected" || s === "customer_rejected" || s === "declined")
    return "client_rejected";
  return "draft";
}

export function getWorkflowStatusConfig(
  status?: QuotationWorkflowStatus | string | null
): WorkflowStatusBadgeConfig {
  const normalized = normalizeWorkflowStatus(status);
  return QUOTATION_WORKFLOW_STATUS_CONFIG[normalized] || QUOTATION_WORKFLOW_STATUS_CONFIG.draft;
}

export function resolveQuotationLifecycle(
  quotation?: QuotationLifecycleSource | null
): QuotationLifecycleInfo {
  if (!quotation) {
    const config = QUOTATION_WORKFLOW_STATUS_CONFIG.draft;
    return {
      lifecycleStatus: "draft",
      label: config.label,
      isCustomerRejected: false,
      isClientRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: true,
    };
  }

  // Unwrap potential nested quotation payload
  const rawQuotation =
    (quotation as { quotation?: QuotationLifecycleSource })?.quotation ||
    quotation;

  const rawEstimate =
    (rawQuotation as { sourceEstimate?: QuotationLifecycleSource })?.sourceEstimate ||
    (rawQuotation as { estimate?: QuotationLifecycleSource })?.estimate;

  const clientNotes =
    rawQuotation?.clientNotes ||
    (rawQuotation as { client_notes?: string })?.client_notes ||
    (rawQuotation as { customerNotes?: string })?.customerNotes ||
    (rawQuotation as { customerReason?: string })?.customerReason ||
    (rawQuotation as { rejectReason?: string })?.rejectReason ||
    (rawQuotation as { rejectionReason?: string })?.rejectionReason ||
    (rawQuotation as { reason?: string })?.reason ||
    rawEstimate?.clientNotes ||
    (rawEstimate as { client_notes?: string })?.client_notes ||
    (rawEstimate as { customerNotes?: string })?.customerNotes ||
    (rawEstimate as { rejectReason?: string })?.rejectReason ||
    null;

  const adminRejectionReason =
    rawQuotation?.approval?.rejectionReason ||
    (rawQuotation as { rejectionReason?: string })?.rejectionReason ||
    (rawQuotation as { approval?: { rejection_reason?: string } })?.approval
      ?.rejection_reason ||
    rawEstimate?.approval?.rejectionReason ||
    null;

  const customerRejectedAt =
    rawQuotation?.customerRejectedAt ||
    (rawQuotation as { customer_rejected_at?: string })?.customer_rejected_at ||
    rawEstimate?.customerRejectedAt ||
    null;

  const customerAcceptedAt =
    rawQuotation?.customerAcceptedAt ||
    (rawQuotation as { customer_accepted_at?: string })?.customer_accepted_at ||
    rawEstimate?.customerAcceptedAt ||
    null;

  const customerDecisionAt =
    customerRejectedAt ||
    customerAcceptedAt ||
    rawQuotation?.customerDecisionAt ||
    (rawQuotation as { customer_decision_at?: string })?.customer_decision_at ||
    rawQuotation?.updatedAt ||
    null;

  // Strictly use workflowStatus (single key source of truth)
  const rawStatus =
    rawQuotation?.workflowStatus ||
    (rawQuotation as { conversion?: { workflowStatus?: string } })?.conversion
      ?.workflowStatus ||
    rawEstimate?.workflowStatus ||
    (rawEstimate as { conversion?: { workflowStatus?: string } })?.conversion
      ?.workflowStatus;

  const lifecycleStatus = normalizeWorkflowStatus(rawStatus);
  const config = QUOTATION_WORKFLOW_STATUS_CONFIG[lifecycleStatus];

  return {
    lifecycleStatus,
    label: config.label,
    isCustomerRejected: lifecycleStatus === "client_rejected",
    isClientRejected: lifecycleStatus === "client_rejected",
    isAdminRejected: lifecycleStatus === "admin_rejected",
    isCustomerAccepted: lifecycleStatus === "accepted",
    isAccepted: lifecycleStatus === "accepted",
    isSent: lifecycleStatus === "sent",
    isApproved: lifecycleStatus === "approved",
    isPendingApproval: lifecycleStatus === "pending_approval",
    isDraft: lifecycleStatus === "draft",
    clientNotes,
    adminRejectionReason,
    customerDecisionAt,
  };
}
