import type { TourDefinition } from "../tour.types";

export const leadsDeepDiveTour: TourDefinition = {
  id: "leads-deep-dive",
  name: "Leads & Pipeline Deep Dive",
  description:
    "Comprehensive walkthrough showing all filters, stats cards, tab navigations, and subpages.",
  estimatedMinutes: 4,
  steps: [
    {
      id: "step-leads-period",
      route: "/leads",
      element: '[data-tour="leads-period-filters"]',
      title: "Pipeline Period & Date Filtering",
      description:
        "Quickly isolate your pipeline by preset periods (Today, Last 7/30 Days, This Month) or specify custom calendar date ranges.",
      speechText:
        "Use the period filter bar to view pipeline metrics and inquiries for any specific time window.",
      side: "bottom",
    },
    {
      id: "step-leads-pipeline-toggle",
      route: "/leads",
      element: '[data-tour="leads-pipeline-toggle"]',
      title: "Active & Archived Pipelines",
      description:
        "Toggle between Active Leads and Archived non-viable leads. Archived records store audit reasons and can be restored back into the live pipeline anytime.",
      speechText:
        "Switch between active leads and archived non-viable leads with one click.",
      side: "bottom",
    },
    {
      id: "step-leads-stats",
      route: "/leads",
      element: '[data-tour="leads-stats-cards"]',
      title: "Pipeline KPI Summary Cards",
      description:
        "Review real-time sales indicators: Leads in Pipeline, Closed Won deals, Follow-ups Pending, and AI Escalations requiring urgent intervention.",
      speechText:
        "Monitor your pipeline pulse: active leads, closed sales, pending follow-ups, and AI escalations.",
      side: "bottom",
    },
    {
      id: "step-leads-action-bar",
      route: "/leads",
      element: '[data-tour="leads-action-bar"]',
      title: "Lead Creation & Data Exchange",
      description:
        "Create new leads manually, import bulk records via validated CSV upload, or export filtered data for spreadsheet analysis.",
      speechText:
        "Add new leads manually, import CSV batches, or export filtered lead lists.",
      side: "bottom",
    },
    {
      id: "step-leads-filters",
      route: "/leads",
      element: '[data-tour="leads-filters"]',
      title: "Multi-Dimensional Search & Filters",
      description:
        "Search across customer names and Job IDs, filter by structural Building Type, Business Unit division, Project Value brackets, or Lifecycle status.",
      speechText:
        "Search and filter leads by building type, business unit, project value, and lifecycle status.",
      side: "bottom",
    },
    {
      id: "step-leads-table",
      route: "/leads",
      element: '[data-tour="leads-table"]',
      title: "Leads Data Table & Live Presence",
      description:
        "Track each prospect's Job ID, progress dots, lifecycle badge, project value, and follow-up due date. Pulsing indicators show if the customer is live in chat.",
      speechText:
        "Review your leads list with progress dots, status badges, and real-time customer presence indicators.",
      side: "top",
    },
    {
      id: "step-leads-row-actions",
      route: "/leads",
      element: '[data-tour="leads-row-actions"]',
      title: "Lead Action Controls",
      description:
        "Every lead row provides quick operational actions: View lead details, Edit specifications, Convert to a Purchase Order (PO), Escalate urgent issues, or Archive/Restore non-viable deals.",
      speechText:
        "Use row actions to quickly view, edit, convert to orders, escalate, or archive leads.",
      side: "left",
    },
    {
      id: "step-leads-nav-to-detail",
      route: "/leads",
      element: '[data-tour="lead-row-view-btn"]',
      title: "Navigating to Lead Details",
      description:
        "Click the Eye icon on any lead row to enter its comprehensive Lead Details workspace.",
      speechText:
        "Click the Eye icon on any lead row to navigate into its complete deal workspace.",
      side: "left",
    },
    {
      id: "step-lead-details-section",
      route: "/leads/:leadId",
      element: '[data-tour="lead-details-content"]',
      title: "Full Lead Details Section",
      description:
        "Welcome to the full lead details section. Here you can review complete prospect information, trigger executive actions (Archive, Edit, Convert to PO, View Agreement), and navigate deal tabs.",
      speechText:
        "Welcome to the full lead details section. Review customer details, perform lead actions, and access all workspace tabs.",
      side: "top",
    },
    {
      id: "step-lead-details-tabs-nav",
      route: "/leads/:leadId",
      element: '[data-tour="lead-details-tabs-nav"]',
      title: "Lead Workspace Navigation Tabs",
      description:
        "Use these 6 navigation tabs to move seamlessly between Basic Info, Quotations, Open Chat & Calls, Milestone Timelines, Follow Ups, and Invoices.",
      speechText:
        "Use these six tabs to navigate between building specs, quotations, customer communications, timelines, and payments.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-basic-info",
      route: "/leads/:leadId",
      element: '[data-tour="lead-basic-info-card"]',
      title: "Basic Info & Building Specifications",
      description:
        "View project specifications, structural dimensions, contact information, internal notes, 9-step lifecycle progression, and lead scoring.",
      speechText:
        "Here are the customer contact details, structural dimensions, lifecycle status, and lead score.",
      side: "top",
    },
    {
      id: "step-lead-details-notes",
      route: "/leads/:leadId",
      element: '[data-tour="lead-notes-card"]',
      title: "Add Notes & Activity Logs",
      description:
        "Log conversation summaries, site visit details, and customer preferences. Keeping notes updated ensures everyone on your sales team has full context.",
      speechText:
        "Add notes to record phone calls and special customer requests.",
      side: "top",
    },
    {
      id: "step-lead-details-lifecycle",
      route: "/leads/:leadId",
      element: '[data-tour="lead-lifecycle-status"]',
      title: "Update Lifecycle Status",
      description:
        "Track and advance the deal through key milestones—from Requirements Gathered to Proposal Sent, Negotiation, and Deal Closed. Click 'Update Step Status' as the deal progresses.",
      speechText:
        "Advance the deal through each stage by updating the lifecycle status.",
      side: "top",
    },
    {
      id: "step-lead-tab-nav-quotations",
      route: "/leads/:leadId?tab=quotations",
      element: '[data-tour="lead-tab-trigger-quotations"]',
      title: "Quotations Tab Navigation",
      description:
        "Clicking 'Quotations' navigates to the Quotations tab to view all custom building estimates and price approvals.",
      speechText:
        "Click the Quotations tab to view quote history and generate new estimates.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-quotations-card",
      route: "/leads/:leadId?tab=quotations",
      element: '[data-tour="lead-quotations-card"]',
      title: "Quotations Workspace",
      description:
        "Review quote history, pricing versions, approval statuses, and launch the quotation builder prefilled with this lead.",
      speechText:
        "Track quotation values, workflow approvals, and generate new quotes here.",
      side: "top",
    },
    {
      id: "step-lead-tab-nav-chat",
      route: "/leads/:leadId?tab=chat",
      element: '[data-tour="lead-tab-trigger-chat"]',
      title: "Open Chat Tab Navigation",
      description:
        "Clicking 'Open Chat' navigates to omni-channel customer communications: live chat, phone call audio recordings, and AI summaries.",
      speechText:
        "Click Open Chat to communicate with the customer and review AI conversation summaries.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-chat-card",
      route: "/leads/:leadId?tab=chat",
      element: '[data-tour="lead-chat-card"]',
      title: "Omni-Channel Communications",
      description:
        "Engage in real-time chat, review Twilio phone calls with full speech-to-text transcripts, and inspect auto-generated AI requirement summaries.",
      speechText:
        "Engage in real-time chat, listen to recorded phone calls with transcripts, and view AI requirement summaries.",
      side: "top",
    },
    {
      id: "step-lead-tab-nav-timeline",
      route: "/leads/:leadId?tab=timeline",
      element: '[data-tour="lead-tab-trigger-timeline"]',
      title: "Timeline Tab Navigation",
      description:
        "Clicking 'Timeline' navigates to the milestone progression checklist mapping the 9 lifecycle stages.",
      speechText:
        "Click Timeline to follow the step-by-step lifecycle progress.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-timeline-card",
      route: "/leads/:leadId?tab=timeline",
      element: '[data-tour="lead-timeline-card"]',
      title: "Lifecycle Progress Timeline",
      description:
        "A structured milestone checklist mapping completed stages from Initial Contact through Negotiation, Deal Closed, and Plant Release.",
      speechText:
        "Follow the structured milestone checklist as the deal advances through each lifecycle stage.",
      side: "top",
    },
    {
      id: "step-lead-tab-nav-followups",
      route: "/leads/:leadId?tab=follow-ups",
      element: '[data-tour="lead-tab-trigger-follow-ups"]',
      title: "Follow Ups Tab Navigation",
      description:
        "Clicking 'Follow Ups' navigates to scheduled reminders, upcoming Google Meet meetings, and historical activity logs.",
      speechText:
        "Click Follow Ups to view scheduled calls, video meetings, and activity logs.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-followups-card",
      route: "/leads/:leadId?tab=follow-ups",
      element: '[data-tour="lead-followups-card"]',
      title: "Follow Ups & Scheduled Meetings",
      description:
        "Manage scheduled calls, emails, and Google Meet video appointments. Mark completed follow-ups with one click and audit historical interactions.",
      speechText:
        "Manage scheduled follow-up calls, join upcoming meetings, and view complete activity audit logs.",
      side: "top",
    },
    {
      id: "step-lead-tab-nav-payments",
      route: "/leads/:leadId?tab=payments",
      element: '[data-tour="lead-tab-trigger-payments"]',
      title: "Payments Tab Navigation",
      description:
        "Clicking 'Payments' navigates to financial breakdowns, total collections, and invoice transmission tools.",
      speechText:
        "Click Payments to view financial summaries, balances, and send invoices.",
      side: "bottom",
    },
    {
      id: "step-lead-tab-payments-card",
      route: "/leads/:leadId?tab=payments",
      element: '[data-tour="lead-payments-card"]',
      title: "Financials & Invoice Distribution",
      description:
        "Review total billing, paid amounts, and outstanding balances. Transmit approved invoices to the customer with one click.",
      speechText:
        "Monitor invoice payment status, outstanding balances, and send approved billing to the customer.",
      side: "top",
    },
    {
      id: "step-lead-nav-edit-subpage",
      route: "/leads/:leadId",
      element: '[data-tour="lead-action-edit-btn"]',
      title: "Navigating to Edit Lead Subpage",
      description:
        "Click 'Edit Lead' in the header to navigate into the full project and structural specifications form.",
      speechText:
        "Click Edit Lead in the header to modify building specifications and delivery details.",
      side: "bottom",
    },
    {
      id: "step-lead-subpage-edit",
      route: "/leads/:leadId/edit",
      element: '[data-tour="add-lead-form"]',
      title: "Edit Lead Specifications Form",
      description:
        "Modify customer assignments, delivery location, structural dimensions (width, length, height), door/window counts, and engineering notes. Use the Back button to return.",
      speechText:
        "Update building specifications and physical dimensions here, then save or navigate back.",
      side: "bottom",
    },
    {
      id: "step-lead-nav-agreement-subpage",
      route: "/leads/:leadId",
      element: '[data-tour="lead-action-agreement-btn"]',
      title: "Navigating to Agreement Subpage",
      description:
        "Click 'View Agreement' (or 'Upload Agreement') in the header to navigate into the signed customer contract viewer.",
      speechText:
        "Click View Agreement in the header to open the signed customer contract.",
      side: "bottom",
    },
    {
      id: "step-lead-subpage-agreement",
      route: "/leads/:leadId/agreement",
      element: '[data-tour="contract-detail-view"]',
      title: "Agreement & Contract Viewer",
      description:
        "Inspect the signed customer contract in an embedded PDF viewer, download a local copy, share with clients, or upload signed paperwork. Use the Back button to return.",
      speechText:
        "Review signed customer contracts, download PDFs, or upload newly signed agreements.",
      side: "bottom",
    },
    {
      id: "step-leads-tour-finish",
      route: "/leads",
      element: '[data-tour="tour-hub-btn"]',
      title: "Leads Walkthrough Complete!",
      description:
        "You've mastered the Leads pipeline, tab navigation, and subpages. Replay this walkthrough or access help anytime from the Tour Hub menu.",
      speechText:
        "Congratulations! You have completed the Leads and Pipeline walkthrough.",
      side: "bottom",
      align: "end",
    },
  ],
};
