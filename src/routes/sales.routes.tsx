import type { RouteObject } from "react-router";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { AdminLayout } from "@/components/admin-layout";

const SignIn = lazy(() => import("@/pages/sign-in"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Communication = lazy(() => import("@/pages/communication"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const EditProfile = lazy(() => import("@/pages/edit-profile"));

const EscalatedQueries = lazy(() => import("@/pages/escalated-queries"));

const Dashboard = lazy(() => import("@/pages/dashboard"));

// customers section
const Customers = lazy(() => import("@/pages/customers/customers"));
const CustomerInfo = lazy(
  () => import("@/pages/customers/customer-detail/customer-info"),
);

const ProjectDetails = lazy(
  () => import("@/pages/customers/customer-detail/project-details"),
);
const ProjectInvoices = lazy(
  () => import("@/pages/customers/customer-detail/project-invoices"),
);
const ProjectPayments = lazy(
  () => import("@/pages/customers/customer-detail/project-payments"),
);
const ProjectQuotation = lazy(
  () => import("@/pages/customers/customer-detail/project-quotation"),
);
const AddNewProjectPage = lazy(
  () => import("@/pages/customers/customer-detail/add-new-project"),
);
const ContractDetail = lazy(() => import("@/pages/customers/contract-detail"));

// leads section
const Leads = lazy(() => import("@/pages/leads/leads"));
const AddNewLead = lazy(() => import("@/pages/leads/add-new-lead"));
const LeadDetails = lazy(() => import("@/pages/leads/lead-details"));
const FollowUp = lazy(() => import("@/pages/leads/follow-up"));
const LeadCommunicationTimelinePage = lazy(
  () => import("@/pages/leads/lead-communication-timeline"),
);
const SingleLeadTimelinePage = lazy(
  () => import("@/pages/leads/single-lead-timeline"),
);
const SingleLeadEmailsPage = lazy(
  () => import("@/pages/leads/single-lead-emails"),
);
const SingleLeadChatsPage = lazy(
  () => import("@/pages/leads/single-lead-chats"),
);
const SmartReminders = lazy(() => import("@/pages/leads/smart-reminders"));
const SmartReminderDetail = lazy(() => import("@/pages/leads/single-reminder"));
const SingleLeadNotesPage = lazy(
  () => import("@/pages/leads/single-lead-notes"),
);
const SingleLeadCallsPage = lazy(
  () => import("@/pages/leads/single-lead-calls"),
);
const AiScriptGeneratorPage = lazy(
  () => import("@/pages/leads/ai-script-generator"),
);
const LeadScoring = lazy(() => import("@/pages/leads/lead-scoring"));
const FollowUpKpis = lazy(() => import("@/pages/leads/follow-up-kpis"));
const AIMarketing = lazy(() => import("@/pages/leads/ai-marketing"));

// Invoice section
const InvoiceForm = lazy(() => import("@/pages/invoices/invoice-form"));
const InvoiceList = lazy(() => import("@/pages/invoices/invoice-list"));
const SalesGrowth = lazy(() => import("@/pages/invoices/sales-growth"));
const PaymentFollowUp = lazy(
  () => import("@/pages/invoices/payment-follow-up"),
);
const InvoicePreviewPage = lazy(
  () => import("@/pages/invoices/invoice-preview"),
);

export const salesRoutes: RouteObject[] = [
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },

      // customers routes
      {
        path: "customers",
        children: [
          { index: true, element: <Customers /> },
          // /customers/meetings routes
          // /customers/:id routes
          {
            path: ":id",
            children: [
              { index: true, element: <CustomerInfo /> },
              { path: "contracts/:id", element: <ContractDetail /> },
              { path: "project-details", element: <ProjectDetails /> },
              { path: "project-invoices", element: <ProjectInvoices /> },
              { path: "project-quotation", element: <ProjectQuotation /> },
              { path: "project-payments", element: <ProjectPayments /> },
            ],
          },
          { path: ":id/projects/new", element: <AddNewProjectPage /> },
        ],
      },

      // leads routes
      {
        path: "leads",
        children: [
          { index: true, element: <Leads /> },
          { path: "add", element: <AddNewLead /> },
          { path: "ai-marketing", element: <AIMarketing /> },
          { path: "payment-follow-up", element: <PaymentFollowUp /> },
          { path: "escalated-queries", element: <EscalatedQueries /> },

          // /leads/follow-up routes
          {
            path: "follow-up",
            children: [
              { index: true, element: <FollowUp /> },
              {
                path: "communication-timeline",
                element: <LeadCommunicationTimelinePage />,
              },
              {
                path: "script-generator",
                element: <AiScriptGeneratorPage />,
              },
              {
                path: "scoring",
                element: <LeadScoring />,
              },
              {
                path: "kpis",
                element: <FollowUpKpis />,
              },
              {
                path: "smart-reminders",
                children: [
                  { index: true, element: <SmartReminders /> },
                  {
                    path: ":id",
                    element: <SmartReminderDetail />,
                  },
                ],
              },
            ],
          },

          // /leads/:leadId routes
          {
            path: ":leadId",
            children: [
              { index: true, element: <LeadDetails /> },
              { path: "timeline", element: <SingleLeadTimelinePage /> },
              {
                path: "emails",
                element: <SingleLeadEmailsPage />,
              },
              {
                path: "chats",
                element: <SingleLeadChatsPage />,
              },
              {
                path: "notes",
                element: <SingleLeadNotesPage />,
              },
              {
                path: "calls",
                element: <SingleLeadCallsPage />,
              },
            ],
          },
        ],
      },

      // global routes
      { path: "notifications", element: <Notifications /> },
      {
        path: "communication",
        element: <Communication />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },

      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "profile",
        children: [
          { index: true, element: <Profile /> },
          { path: "edit", element: <EditProfile /> },
        ],
      },

      // invoice routes
      {
        path: "invoice",
        children: [
          { index: true, element: <InvoiceForm /> },
          { path: "list", element: <InvoiceList /> },
          { path: "preview", element: <InvoicePreviewPage /> },
          { path: "new", element: <InvoiceForm /> },
          { path: ":id", element: <InvoiceForm /> },
          { path: "sales-growth", element: <SalesGrowth /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];
