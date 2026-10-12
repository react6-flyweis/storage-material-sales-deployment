export type QuotationResolvedLifecycle =
  | "draft"
  | "pending_approval"
  | "admin_rejected"
  | "approved"
  | "sent"
  | "customer_rejected"
  | "customer_accepted";

export interface QuotationLifecycleInfo {
  lifecycleStatus: QuotationResolvedLifecycle;
  label: string;
  isCustomerRejected: boolean;
  isAdminRejected: boolean;
  isCustomerAccepted: boolean;
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

function normalizeStatusString(val?: unknown): string {
  if (typeof val !== "string") return "";
  return val.trim().toLowerCase().replace(/[\s-]/g, "_");
}

export function resolveQuotationLifecycle(
  quotation?: QuotationLifecycleSource | null
): QuotationLifecycleInfo {
  if (!quotation) {
    return {
      lifecycleStatus: "draft",
      label: "Draft",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
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

  const quoteStatus =
    normalizeStatusString(rawQuotation.status) ||
    normalizeStatusString(rawEstimate?.status);

  const workflowStatus =
    normalizeStatusString(
      rawQuotation.workflowStatus ||
        (rawQuotation as { conversion?: { workflowStatus?: string } }).conversion
          ?.workflowStatus
    ) ||
    normalizeStatusString(
      rawEstimate?.workflowStatus ||
        (rawEstimate as { conversion?: { workflowStatus?: string } })?.conversion
          ?.workflowStatus
    );

  const quotationStatus = normalizeStatusString(
    (rawQuotation as { quotationStatus?: string })?.quotationStatus ||
      (rawQuotation as { quotation_status?: string })?.quotation_status ||
      (rawQuotation as { quoteStatus?: string })?.quoteStatus ||
      (rawEstimate as { quotationStatus?: string })?.quotationStatus ||
      (rawEstimate as { conversion?: { quotationStatus?: string } })?.conversion
        ?.quotationStatus
  );

  const customerDecision = normalizeStatusString(
    (rawQuotation as { decision?: string })?.decision ||
      (rawQuotation as { customerDecision?: string })?.customerDecision ||
      (rawQuotation as { customerStatus?: string })?.customerStatus ||
      (rawEstimate as { customerDecision?: string })?.customerDecision
  );

  const approvalStatus = normalizeStatusString(
    rawQuotation.approval?.status ||
      rawQuotation.approvalStatus ||
      (rawQuotation as { approval_status?: string }).approval_status ||
      rawEstimate?.approval?.status ||
      rawEstimate?.approvalStatus
  );

  const clientNotes =
    rawQuotation.clientNotes ||
    (rawQuotation as { client_notes?: string }).client_notes ||
    (rawQuotation as { customerNotes?: string }).customerNotes ||
    (rawQuotation as { customerReason?: string }).customerReason ||
    (rawQuotation as { rejectReason?: string }).rejectReason ||
    (rawQuotation as { rejectionReason?: string }).rejectionReason ||
    (rawQuotation as { reason?: string }).reason ||
    rawEstimate?.clientNotes ||
    (rawEstimate as { client_notes?: string })?.client_notes ||
    (rawEstimate as { customerNotes?: string })?.customerNotes ||
    (rawEstimate as { rejectReason?: string })?.rejectReason ||
    null;

  const adminRejectionReason =
    rawQuotation.approval?.rejectionReason ||
    (rawQuotation as { rejectionReason?: string }).rejectionReason ||
    (rawQuotation as { approval?: { rejection_reason?: string } }).approval
      ?.rejection_reason ||
    rawEstimate?.approval?.rejectionReason ||
    null;

  const customerRejectedAt =
    rawQuotation.customerRejectedAt ||
    (rawQuotation as { customer_rejected_at?: string }).customer_rejected_at ||
    rawEstimate?.customerRejectedAt ||
    null;

  const customerAcceptedAt =
    rawQuotation.customerAcceptedAt ||
    (rawQuotation as { customer_accepted_at?: string }).customer_accepted_at ||
    rawEstimate?.customerAcceptedAt ||
    null;

  const customerDecisionAt =
    customerRejectedAt ||
    customerAcceptedAt ||
    rawQuotation.customerDecisionAt ||
    (rawQuotation as { customer_decision_at?: string }).customer_decision_at ||
    rawQuotation.updatedAt ||
    null;

  const hasSentAt = Boolean(
    rawQuotation.sentAt || (rawQuotation as { sent_at?: string }).sent_at
  );
  const isSendMethodManual =
    rawQuotation.sendMethod === "manual" ||
    (rawQuotation as { send_method?: string }).send_method === "manual";

  // Check approval.history for explicit customer decisions
  const rawApprovalHistory = (
    rawQuotation.approval as {
      history?: Array<{ status?: string; note?: string; at?: string }>;
    } | null | undefined
  )?.history;

  const history = Array.isArray(rawApprovalHistory)
    ? rawApprovalHistory
    : Array.isArray((rawQuotation as { history?: unknown[] }).history)
    ? ((rawQuotation as { history?: unknown[] }).history as Array<{ status?: string; note?: string; at?: string }>)
    : [];

  const historyHasCustomerReject = history.some((item) => {
    const s = normalizeStatusString(item.status);
    return s === "customer_rejected" || s === "declined" || s === "rejected_by_customer";
  });

  const historyHasCustomerAccept = history.some((item) => {
    const s = normalizeStatusString(item.status);
    return s === "customer_accepted" || s === "accepted_by_customer";
  });

  // 1. Explicit Customer Decline
  const isExplicitCustomerRejected =
    quotationStatus === "customer_rejected" ||
    quotationStatus === "declined" ||
    quotationStatus === "rejected_by_customer" ||
    quoteStatus === "customer_rejected" ||
    workflowStatus === "customer_rejected" ||
    customerDecision === "customer_rejected" ||
    customerDecision === "rejected" ||
    customerDecision === "declined" ||
    quoteStatus === "declined" ||
    workflowStatus === "declined" ||
    quoteStatus === "rejected_by_customer" ||
    workflowStatus === "rejected_by_customer" ||
    Boolean(customerRejectedAt) ||
    historyHasCustomerReject ||
    (Boolean(clientNotes) && (hasSentAt || quoteStatus === "rejected" || quoteStatus === "sent" || quotationStatus === "rejected")) ||
    ((quotationStatus === "rejected" || quoteStatus === "rejected" || workflowStatus === "rejected") &&
      (hasSentAt || approvalStatus === "approved" || quoteStatus === "sent" || workflowStatus === "sent"));

  // 2. Explicit Admin Internal Rejection
  const isExplicitAdminRejected =
    quotationStatus === "admin_rejected" ||
    quotationStatus === "rejected_by_admin" ||
    quoteStatus === "admin_rejected" ||
    workflowStatus === "admin_rejected" ||
    quoteStatus === "rejected_by_admin" ||
    workflowStatus === "rejected_by_admin";

  if (isExplicitCustomerRejected) {
    return {
      lifecycleStatus: "customer_rejected",
      label: "Declined by Customer",
      isCustomerRejected: true,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      clientNotes,
      adminRejectionReason,
      customerDecisionAt,
    };
  }

  if (isExplicitAdminRejected) {
    return {
      lifecycleStatus: "admin_rejected",
      label: "Admin Rejected",
      isCustomerRejected: false,
      isAdminRejected: true,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      adminRejectionReason,
    };
  }

  // 3. Generic "rejected" (quotationStatus === "rejected" or quoteStatus === "rejected" or workflowStatus === "rejected")
  if (
    quotationStatus === "rejected" ||
    quoteStatus === "rejected" ||
    workflowStatus === "rejected"
  ) {
    // If quote was rejected internally by admin before being sent and no customer notes
    if (
      approvalStatus === "rejected" &&
      !hasSentAt &&
      !clientNotes
    ) {
      return {
        lifecycleStatus: "admin_rejected",
        label: "Admin Rejected",
        isCustomerRejected: false,
        isAdminRejected: true,
        isCustomerAccepted: false,
        isSent: false,
        isApproved: false,
        isPendingApproval: false,
        isDraft: false,
        adminRejectionReason,
      };
    }

    // In all other cases (customer declined quote in portal, or quote was already sent/approved)
    return {
      lifecycleStatus: "customer_rejected",
      label: "Declined by Customer",
      isCustomerRejected: true,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      clientNotes,
      adminRejectionReason,
      customerDecisionAt,
    };
  }

  // 4. Customer Accepted
  if (
    quotationStatus === "customer_accepted" ||
    quotationStatus === "accepted" ||
    quoteStatus === "customer_accepted" ||
    workflowStatus === "customer_accepted" ||
    customerDecision === "customer_accepted" ||
    customerDecision === "accepted" ||
    quoteStatus === "accepted" ||
    workflowStatus === "accepted" ||
    Boolean(customerAcceptedAt) ||
    historyHasCustomerAccept
  ) {
    return {
      lifecycleStatus: "customer_accepted",
      label: "Accepted by Customer",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: true,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      clientNotes,
      customerDecisionAt,
    };
  }

  // 5. Sent to Customer
  if (
    quoteStatus === "sent" ||
    workflowStatus === "sent" ||
    quoteStatus === "marked_sent" ||
    workflowStatus === "marked_sent" ||
    quoteStatus === "sent_via_email" ||
    workflowStatus === "sent_via_email" ||
    hasSentAt
  ) {
    return {
      lifecycleStatus: "sent",
      label: isSendMethodManual ? "Marked Sent" : "Sent via Email",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: true,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
    };
  }

  // 6. Admin Internal Review: Rejected
  if (approvalStatus === "rejected") {
    return {
      lifecycleStatus: "admin_rejected",
      label: "Admin Rejected",
      isCustomerRejected: false,
      isAdminRejected: true,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      adminRejectionReason,
    };
  }

  // 7. Approved
  if (
    approvalStatus === "approved" ||
    quoteStatus === "approved" ||
    workflowStatus === "approved"
  ) {
    return {
      lifecycleStatus: "approved",
      label: "Approved",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: true,
      isPendingApproval: false,
      isDraft: false,
    };
  }

  // 8. Pending Approval
  if (
    approvalStatus === "pending_approval" ||
    approvalStatus === "pending" ||
    quoteStatus === "pending_approval" ||
    quoteStatus === "pending" ||
    workflowStatus === "pending_approval"
  ) {
    return {
      lifecycleStatus: "pending_approval",
      label: "Pending Approval",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: true,
      isDraft: false,
    };
  }

  return {
    lifecycleStatus: "draft",
    label: "Draft",
    isCustomerRejected: false,
    isAdminRejected: false,
    isCustomerAccepted: false,
    isSent: false,
    isApproved: false,
    isPendingApproval: false,
    isDraft: true,
  };
}
