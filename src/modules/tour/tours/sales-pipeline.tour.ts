import type { TourDefinition } from "../tour.types";

export const salesPipelineTour: TourDefinition = {
  id: "sales-pipeline",
  name: "Core Sales & Collaboration Tour",
  description:
    "Complete 2-minute walkthrough covering leads, quotations, invoices, and collaboration tools.",
  estimatedMinutes: 2,
  steps: [
    {
      id: "step-dashboard-kpis",
      route: "/",
      element: '[data-tour="dashboard-kpis"]',
      title: "Sales Command Center",
      description:
        "Review your high-level sales metrics, active pipelines, conversion rates, and urgent pending actions.",
      speechText:
        "Welcome to your sales command center. Monitor daily metrics and pending actions here.",
      side: "bottom",
    },
    {
      id: "step-sidebar-nav",
      route: "/",
      element: '[data-tour="sidebar-nav"]',
      title: "Main Navigation",
      description:
        "Quickly toggle between Customer Management, Leads, Custom Metal Buildings, and Billing operations.",
      speechText:
        "Use the sidebar to jump between leads, building quotes, and invoices.",
      side: "right",
    },
    {
      id: "step-leads-pipeline",
      route: "/leads",
      element: '[data-tour="leads-table"]',
      title: "Leads Pipeline & Scoring",
      description:
        "Filter deals by lifecycle status (New, Quoted, Won), search by company, and prioritize high-score leads.",
      speechText:
        "This is your leads pipeline. Filter prospects and track deals by lifecycle status.",
      side: "top",
    },
    {
      id: "step-add-lead-btn",
      route: "/leads",
      element: '[data-tour="add-lead-btn"]',
      title: "Capture New Inquiries",
      description:
        "Click here when a prospect calls or submits a form to initiate a new steel building inquiry.",
      speechText:
        "Click Add Lead to capture new customer inquiries and project specifications.",
      side: "left",
    },
    {
      id: "step-add-lead-form",
      route: "/leads/add",
      element: '[data-tour="add-lead-form"]',
      title: "Add Lead Workflow",
      description:
        "Record customer contact info, delivery address, building dimensions, and assign the lead to a sales rep. (You can submit or cancel anytime).",
      speechText:
        "Record customer details and building requirements here to launch the deal.",
      side: "bottom",
    },
    {
      id: "step-lead-details-workspace",
      route: "/leads",
      element: '[data-tour="lead-details-content"]',
      title: "Lead Deal Workspace",
      description:
        "Welcome to the workspace for this prospect. Here you can access customer details, specifications, and track every deal touchpoint.",
      speechText:
        "Welcome to the deal workspace. Review customer details and manage deal activities here.",
      side: "top",
    },
    {
      id: "step-lead-details-lifecycle",
      route: "/leads",
      element: '[data-tour="lead-lifecycle-status"]',
      title: "Update Lifecycle Status",
      description:
        "Track and advance the deal through key milestones—from Requirements Gathered to Proposal Sent, Negotiation, and Deal Closed. Click 'Update Step Status' as the deal progresses.",
      speechText:
        "Advance the deal through each stage by updating the lifecycle status.",
      side: "top",
    },
    {
      id: "step-lead-details-notes",
      route: "/leads",
      element: '[data-tour="lead-notes-card"]',
      title: "Add Notes & Activity Logs",
      description:
        "Log conversation summaries, site visit details, and customer preferences. Keeping notes updated ensures everyone on your sales team has full context.",
      speechText:
        "Add notes to record phone calls and special customer requests.",
      side: "top",
    },
    {
      id: "step-quote-history",
      route: "/quotation/history",
      element: '[data-tour="quote-history-table"]',
      title: "Quote History & Analytics",
      description:
        "Access all saved quotes, monitor gross margins and pricing analytics, or reload past estimates for revisions.",
      speechText:
        "Here is your quotation history. Review saved quotes, analyze profit margins, and manage quote revisions.",
      side: "top",
    },
    {
      id: "step-invoices",
      route: "/invoice/list",
      element: '[data-tour="invoices-table"]',
      title: "Invoices & Deliveries",
      description:
        "Track payment schedules, signed agreements, deposit milestones, and dispatch statuses.",
      speechText:
        "Track signed contracts, invoice payment milestones, and dispatch deliveries.",
      side: "top",
    },
    {
      id: "step-global-search",
      route: "/",
      element: '[data-tour="header-search"]',
      title: "Instant Global Search",
      description:
        "Quickly find any customer, quote number, phone number, or lead from anywhere in the app.",
      speechText:
        "Find any lead, quote, or customer instantly from the global search bar.",
      side: "bottom",
    },
    {
      id: "step-notifications-hub",
      route: "/notifications",
      element: '[data-tour="notifications-hub"]',
      title: "Notification Center",
      description:
        "Stay alerted on new website inquiries, price approvals, and critical payment reminders.",
      speechText:
        "Never miss an inquiry or payment milestone with real-time notifications.",
      side: "bottom",
    },
    {
      id: "step-communication-hub",
      route: "/communication",
      element: '[data-tour="communication-view"]',
      title: "Customer & Team Communication",
      description:
        "Directly chat with customers via SMS/WhatsApp and collaborate internally with the engineering and dispatch teams.",
      speechText:
        "Chat directly with customers and collaborate with your sales team in the communication hub.",
      side: "top",
    },
    {
      id: "step-tour-hub-btn",
      route: "/",
      element: '[data-tour="tour-hub-btn"]',
      title: "Tour Hub & Help",
      description:
        "You're all set! Replay this tour or launch deep-dive tutorials anytime right here.",
      speechText:
        "You're ready to sell! Replay tutorials anytime from this Help menu.",
      side: "bottom",
      align: "end",
    },
  ],
};
