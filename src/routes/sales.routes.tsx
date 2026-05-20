import type { RouteObject } from "react-router";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute, PublicOnlyRoute } from "@/modules/auth/auth.guards";

const SignIn = lazy(() => import("@/pages/sign-in"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Communication = lazy(() => import("@/pages/communication"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const EditProfile = lazy(() => import("@/pages/edit-profile"));

// const EscalatedQueries = lazy(() => import("@/pages/escalated-queries"));

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Deliveries = lazy(() => import("@/pages/deliveries/deliveries"));
const DeliveryDetails = lazy(
  () => import("@/pages/deliveries/delivery-details"),
);
const CustomerDeliverySchedule = lazy(
  () => import("@/pages/deliveries/customer-delivery-schedule"),
);
const AwardedFreightRequests = lazy(
  () => import("@/pages/deliveries/awarded-freight"),
);
const SalesPage = lazy(() => import("@/pages/sales/sales"));

// customers section
const Customers = lazy(() => import("@/pages/customers/customers"));
const RequestDeliveryChange = lazy(
  () => import("@/pages/customers/request-delivery-change"),
);
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
const QuotationPreview = lazy(
  () => import("@/pages/customers/customer-detail/quotation-preview"),
);
const AddNewProjectPage = lazy(
  () => import("@/pages/customers/customer-detail/add-new-project"),
);
const CustomerCommunication = lazy(
  () => import("@/pages/customers/customer-communication"),
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
const EscalatedLeads = lazy(() => import("@/pages/leads/escalated-leads"));
const AllPurchaseOrders = lazy(
  () => import("@/pages/leads/all-purchase-orders"),
);
const PurchaseOrderDetails = lazy(
  () => import("@/pages/leads/purchase-order-details"),
);
const QuotationList = lazy(() => import("@/pages/leads/quotation-list"));
const QuotationDetails = lazy(() => import("@/pages/leads/quotation-details"));
const NewInquiry = lazy(() => import("@/pages/leads/new-inquiry"));

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
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },

          // customers routes
          {
            path: "customers",
            children: [
              { index: true, element: <Customers /> },
              {
                path: "request-delivery-change",
                element: <RequestDeliveryChange />,
              },
              { path: "projects/:id", element: <ProjectDetails /> },
              // /customers/meetings routes
              // /customers/:id routes
              {
                path: ":id",
                children: [
                  { index: true, element: <CustomerInfo /> },
                  { path: "contracts/:id", element: <ContractDetail /> },
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

              {
                path: "quotation-preview",
                element: <QuotationPreview />,
              },

              {
                path: "purchase-orders",
                children: [
                  { index: true, element: <AllPurchaseOrders /> },
                  { path: ":poId", element: <PurchaseOrderDetails /> },
                ],
              },
              { path: "quotation-list", element: <QuotationList /> },
              { path: "new-inquiry", element: <NewInquiry /> },
              { path: "quotation-details", element: <QuotationDetails /> },
              { path: "quotation-details/:id", element: <QuotationDetails /> },

              { path: "payment-follow-up", element: <PaymentFollowUp /> },
              { path: "escalated", element: <EscalatedLeads /> },
              // { path: "escalated-queries", element: <EscalatedQueries /> },

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

          //  customer delivery
          {
            path: "deliveries",
            children: [
              { index: true, element: <CustomerDeliverySchedule /> },
              {
                path: "projects",
                children: [
                  { index: true, element: <Deliveries /> },

                  { path: ":id", element: <DeliveryDetails /> },
                ],
              },
            ],
          },
          {
            path: "awarded-freight",
            element: <AwardedFreightRequests />,
          },
          {
            path: "customer-communication",
            element: <CustomerCommunication />,
          },
          {
            path: "sales",
            element: <SalesPage />,
          },

          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];
