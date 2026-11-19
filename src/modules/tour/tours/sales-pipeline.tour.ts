import type { TourDefinition } from "../tour.types";

export const salesPipelineTour: TourDefinition = {
  id: "sales-pipeline",
  name: "Global Platform Walkthrough",
  description:
    "Complete walkthrough in sidebar order covering Dashboard, Leads, Quoting, Customer accounts, Invoices, Delivery Calendar, Communication, and Notifications.",
  estimatedMinutes: 5,
  steps: [
    // 1. Dashboard
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
        "Quickly navigate across Leads, Quoting, Customer management, Invoices, Delivery Calendar, and Communications.",
      speechText:
        "Use the sidebar to jump between leads, quotes, customer accounts, and operations.",
      side: "right",
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

    // 2. Leads Module
    {
      id: "step-leads-pipeline",
      route: "/leads",
      element: '[data-tour="leads-table"]',
      title: "Leads Pipeline & Scoring",
      description:
        "Filter deals by lifecycle status (New, Quoted, Won), search by company, and prioritize high-score leads.",
      speechText:
        "This is your leads pipeline. Filter prospects and track deals by lifecycle status. Click Explore Leads in Depth if you'd like a complete tour of all leads features.",
      side: "top",
      branch: {
        tourId: "leads-deep-dive",
        label: "Explore Leads in Depth (4 min)",
        description:
          "Want a complete walkthrough of all filters, KPI cards, and lead workspace tabs?",
        resumeStepIndex: 16,
      },
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
      id: "step-followups-overview",
      route: "/leads/follow-up",
      element: '[data-tour="followups-overview"]',
      title: "Follow-ups & Task Management",
      description:
        "Track upcoming calls, overdue reminders, and completed sales tasks across your entire pipeline in one central view.",
      speechText:
        "Monitor upcoming tasks, overdue follow-ups, and scheduled customer reminders in the Follow-ups Overview.",
      side: "top",
    },
    {
      id: "step-add-followup-modal",
      route: "/leads/follow-up?action=add",
      element: '[data-tour="add-followup-modal"]',
      title: "Schedule Follow-up Modal",
      description:
        "Schedule phone calls, emails, or meetings with customers. Configure priority levels, assign alert reminders, and save touchpoint notes.",
      speechText:
        "Open the Add Follow-up modal to schedule calls, emails, or meetings with automated reminders.",
      side: "bottom",
    },
    {
      id: "step-upcoming-followups-calendar",
      route: "/leads/follow-up?view=calendar",
      element: '[data-tour="upcoming-followups-calendar"]',
      title: "Upcoming Follow-Ups: Calendar View",
      description:
        "Inspect your monthly follow-up calendar grid to monitor scheduled touchpoints, see day-by-day density, and track overdue items.",
      speechText:
        "The Calendar view lets you visualize scheduled outreach and follow-ups across the month at a glance.",
      side: "top",
    },
    {
      id: "step-upcoming-followups-list",
      route: "/leads/follow-up?view=list",
      element: '[data-tour="upcoming-followups-list"]',
      title: "Upcoming Follow-Ups: List View",
      description:
        "Switch to the List tab for a prioritized chronological stream of upcoming customer interactions and mark completed tasks.",
      speechText:
        "Switch to the List tab for a prioritized queue of upcoming outreach tasks and customer calls.",
      side: "top",
    },
    {
      id: "step-ai-script-generator",
      route: "/leads/follow-up/script-generator",
      element: '[data-tour="ai-script-generator"]',
      title: "AI Follow-Up Script Generator",
      description:
        "Leverage AI to craft tailored call scripts, persuasive objection handling notes, and personalized outreach messages based on deal context.",
      speechText:
        "Use the AI Follow-Up Generator to craft tailored call scripts and messages for your prospects.",
      side: "top",
    },
    {
      id: "step-lead-scoring",
      route: "/leads/follow-up/scoring",
      element: '[data-tour="lead-scoring-table"]',
      title: "Lead Scoring & Auto Follow-up",
      description:
        "Prioritize prospects with real-time temperature tracking (Hot, Warm, Cold), monitor score transitions, and configure automated follow-up cadences.",
      speechText:
        "Track lead engagement temperatures and set up automated follow-up cadences with Lead Scoring.",
      side: "top",
    },
    {
      id: "step-leads-quotation-list",
      route: "/leads/quotation-list",
      element: '[data-tour="quotations-list-table"]',
      title: "All Quotations (Leads)",
      description:
        "View and track all quotations generated for leads across draft, pending approval, sent, and accepted stages.",
      speechText:
        "Review all quotations generated for your leads and monitor their approval lifecycle.",
      side: "top",
    },
    {
      id: "step-escalated-leads",
      route: "/leads/escalated",
      element: '[data-tour="escalated-leads-table"]',
      title: "My Escalated Leads",
      description:
        "View and track your own escalated leads in this sales workspace. Monitor resolution statuses (Pending, Assigned, Resolved), read escalation notes, and take swift action on deal blockers.",
      speechText:
        "Track your own escalated leads here, review notes and resolution statuses, and take action to unblock your deals.",
      side: "top",
    },
    {
      id: "step-purchase-orders",
      route: "/leads/purchase-orders",
      element: '[data-tour="purchase-orders-table"]',
      title: "Purchase Orders",
      description:
        "Review and track all confirmed client purchase orders, monitor PO numbers, deal values, and procurement milestones.",
      speechText:
        "Track confirmed customer purchase orders and monitor fulfillment statuses under Purchase Orders.",
      side: "top",
    },

    // 3. Quoting Module — Quote History & Analytics
    {
      id: "step-quote-history-kpis",
      route: "/quotation/history",
      element: '[data-tour="quote-history-kpis"]',
      title: "Quotation Analytics & KPIs",
      description:
        "Track monthly pipeline quoting performance at a glance: monitor total quoted volume, average gross margins, profit projections, and total building square footage.",
      speechText:
        "Review your high-level quotation performance cards, including monthly quoted pipeline volume, average margins, and total quoted square footage.",
      side: "bottom",
    },
    {
      id: "step-quote-history",
      route: "/quotation/history",
      element: '[data-tour="quote-history-table"]',
      title: "Quotation Repository & Revisions",
      description:
        "Manage your complete database of generated quotes. Inspect statuses (Draft, Pending Approval, Approved), reload estimates into the editor, or download customer packages. Click 'Launch Quoting Deep Dive' to explore the full PEMB quote-to-approval engine.",
      speechText:
        "Access all saved quotes, review approval states, reload past estimates for revisions, or launch the Quoting Tool deep dive to see the full creation-to-approval workflow.",
      side: "top",
      branch: {
        tourId: "quotation-deep-dive",
        label: "Quoting & Approval Flow (4 min)",
        description:
          "Explore the complete quoting journey from creating PEMB building specs to sending estimate packages for approval.",
        buttonText: "Launch Quoting Deep Dive",
        resumeStepIndex: 18,
      },
    },

    // 4. Customer Module
    {
      id: "step-customers-directory",
      route: "/customers",
      element: '[data-tour="customers-table"]',
      title: "Customer Directory & Accounts",
      description:
        "Manage your active client database, access customer contact details, view associated projects, and monitor account lifecycles.",
      speechText:
        "Manage customer accounts, view ongoing projects, and access client contact details in the Customer Directory.",
      side: "top",
    },
    {
      id: "step-customer-detail",
      route: "/customers/:customerId",
      element: '[data-tour="customer-detail-workspace"]',
      title: "Customer Profile & Projects",
      description:
        "Review customer contact info, financial metrics (total paid, pending balances), and all linked metal building projects.",
      speechText:
        "Welcome to the customer account workspace. Monitor financials, uploaded documents, and project history here.",
      side: "top",
    },
    {
      id: "step-customer-project-details",
      route: "/customers/projects/:projectId",
      element: '[data-tour="project-details-workspace"]',
      title: "Customer Project Details",
      description:
        "Deep dive into this specific project: review building specifications, milestone progress, linked contracts, invoices, and site media.",
      speechText:
        "Here are the detailed specifications, milestones, and documents for this customer's project.",
      side: "top",
    },
    {
      id: "step-customer-meetings",
      route: "/meetings",
      element: '[data-tour="meetings-workspace"]',
      title: "Customer Meetings & Scheduling",
      description:
        "Schedule, track, and join client video conferences, site visits, and consultation calls directly from your meetings hub.",
      speechText:
        "Schedule and join client consultations, video conferences, and site visits under Meetings.",
      side: "top",
    },

    // 5. Invoices Module
    {
      id: "step-invoices",
      route: "/invoice/list",
      element: '[data-tour="invoices-table"]',
      title: "Invoices & Billing",
      description:
        "Track payment schedules, signed agreements, deposit milestones, and dispatch billing statuses.",
      speechText:
        "Track signed contracts, invoice payment milestones, and dispatch deliveries.",
      side: "top",
    },

    // 6. Calendar Module
    {
      id: "step-delivery-calendar",
      route: "/calendar",
      element: '[data-tour="delivery-calendar-view"]',
      title: "Construction Delivery Calendar",
      description:
        "Track scheduled material site deliveries, project drop-off dates, and transit timelines across projects.",
      speechText:
        "Track project delivery dates, freight logistics, and material drop-off schedules in the Delivery Calendar.",
      side: "top",
    },

    // 7. Communication Module
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

    // 8. Notifications Module
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

    // Finish
    {
      id: "step-tour-hub-btn",
      route: "/notifications",
      element: '[data-tour="tour-hub-btn"]',
      title: "Tour Hub & Help",
      description:
        "You're all set! Replay this global walkthrough or launch deep-dive tutorials anytime right here.",
      speechText:
        "You're ready to sell! Replay tutorials anytime from this Help menu.",
      side: "bottom",
      align: "end",
    },
  ],
};
