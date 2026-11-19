import type { TourDefinition } from "../tour.types";

export const quotationDeepDiveTour: TourDefinition = {
  id: "quotation-deep-dive",
  name: "Quoting & Approval Flow",
  description:
    "Complete end-to-end walkthrough from specifying PEMB building dimensions to generating pricing breakdowns and submitting estimate packages for approval.",
  estimatedMinutes: 4,
  steps: [
    {
      id: "step-pemb-create-specs",
      route: "/quotation/pemb/create",
      element: '[data-tour="pemb-create-workspace"]',
      title: "Start PEMB Quote — Project Specs & Dimensions",
      description:
        "Select an associated lead or customer project, verify contact info, and configure building dimensions (width, length, eave height) to initialize the quotation model.",
      speechText:
        "Begin by selecting an existing lead and entering building dimensions to start a pre-engineered metal building quote.",
      side: "bottom",
    },
    {
      id: "step-pemb-workspace",
      route: "/quotation/pemb?tour=true",
      element: '[data-tour="pemb-quote-workspace"]',
      title: "PEMB Quotation Engine",
      description:
        "Welcome to the PEMB Quote Workspace. Here you combine architectural drawings, manufacturer shippers, structural calculations, and live pricing tools to generate accurate estimates.",
      speechText:
        "Welcome to the PEMB Quotation Engine. Here you can upload drawings, review structural specs, and calculate pricing.",
      side: "top",
    },
    {
      id: "step-pemb-drawing-section",
      route: "/quotation/pemb?tour=true",
      element: '[data-tour="pemb-drawing-section"]',
      title: "Step 1 — Upload & Extract Prelim Drawings",
      description:
        "Upload preliminary structural PDF drawings. The AI extraction engine scans the document to automatically extract building dimensions, frame designs, roof slopes, and environmental loads (wind, snow, seismic).",
      speechText:
        "Upload your architectural drawings. The system automatically extracts building geometry, load ratings, and design codes.",
      side: "top",
    },
    {
      id: "step-pemb-pricing-section",
      route: "/quotation/pemb?tour=true",
      element: '[data-tour="pemb-pricing-section"]',
      title: "Step 2 — Shipper Extraction & Cost Breakdown",
      description:
        "Upload manufacturer shipper spreadsheets to populate exact component weights. Adjust material scopes, insulation, concrete slabs, install rates, and fine-tune gross profit margins.",
      speechText:
        "Analyze materials, installation costs, accessories, and profit margins to finalize your pre-engineered metal building pricing.",
      side: "top",
    },
    {
      id: "step-estimate-detail-view",
      route: "/quotation/history/:estimateId",
      element: '[data-tour="estimate-detail-view"]',
      title: "Formal Estimate Package Review",
      description:
        "Inspect the compiled formal estimate proposal package, milestone payment schedules, line-item summaries, and customer specifications before submitting.",
      speechText:
        "Review the compiled estimate proposal package with complete line-item breakdowns, terms, and milestone schedules.",
      side: "top",
    },
    {
      id: "step-estimate-send-approval",
      route: "/quotation/history/:estimateId",
      element: '[data-tour="estimate-send-approval-btn"]',
      title: "Send for Management Approval",
      description:
        "Click 'Send for Approval' to initiate administrative verification and pricing review, locking revisions for management sign-off.",
      speechText:
        "When the quote package is ready, click Send for Approval to trigger the management review workflow.",
      side: "bottom",
    },
    {
      id: "step-submit-approval-modal",
      route: "/quotation/history/:estimateId?action=submit-approval",
      element: '[data-tour="submit-approval-modal"]',
      title: "Submit for Admin Approval",
      description:
        "Provide optional review notes for management, verify quotation versioning, and submit the proposal package for official sign-off.",
      speechText:
        "In this dialog, provide optional review notes for management and submit the estimate package for official sign-off.",
      side: "bottom",
    },
    {
      id: "step-quotation-tour-finish",
      route: "/quotation/history",
      element: '[data-tour="tour-hub-btn"]',
      title: "Quoting & Approval Flow Complete!",
      description:
        "You have completed the full quotation and approval lifecycle, from building specs to management sign-off. Replay anytime from the Tour Hub menu.",
      speechText:
        "Congratulations! You have completed the Quoting and Approval workflow.",
      side: "bottom",
      align: "end",
    },
  ],
};
