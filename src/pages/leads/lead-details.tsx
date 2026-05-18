import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import BasicDetails from "@/components/leads/basic-details";
import QuotationCard from "@/components/leads/quotation-card";
import ChatCard from "@/components/leads/chat-card";
import TimelineCard from "@/components/leads/timeline-card";
import FollowUpsCard from "@/components/leads/follow-ups-card";
import PaymentsCard from "@/components/leads/payments-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { getLeadProgress } from "@/modules/leads/leads.utils";
import type { LeadDetailData } from "@/modules/leads/leads.api";

const TABS = [
  { value: "basic-info", label: "Basic info" },
  { value: "quotation", label: "Quotation" },
  { value: "open-chat", label: "Open Chat" },
  { value: "timeline", label: "Timeline" },
  { value: "follow-ups", label: "Follow Ups" },
  { value: "payments", label: "Payments" },
] as const;

const defaultLead = {
  id: "—",
  name: "—",
  workshop: "",
  category: "",
  assignedToName: "",
  assignmentStatus: "",
  progress: 0,
  status: "",
  statusColor: "orange",
  quoteValue: "",
  chatCount: 0,
};

function mapDetailToLead(detail: LeadDetailData) {
  const latestQuotation =
    detail.quotations.find((q) => q.isLatest) ?? detail.quotations[0];

  return {
    id: detail.lead._id,
    name: detail.customer.firstName || detail.customer.customerId || "Lead",
    workshop: latestQuotation?.buildingType || detail.lead.buildingType || "",
    category: latestQuotation?.location || detail.lead.location || "",
    assignedToName: "",
    assignmentStatus: detail.lead.assignedSales ? "Assigned" : "",
    progress: getLeadProgress(detail.lead.lifecycleStatus),
    status: detail.lead.lifecycleStatus,
    statusColor: "orange",
    quoteValue: String(detail.lead.quoteValue),
    chatCount: detail.recentMessages.length,
  };
}

function LeadDetailsSkeleton() {
  return (
    <div className="p-5">
      <div className="animate-pulse space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-24 rounded-lg bg-slate-200" />

          <div className="space-y-3 pt-1">
            <div className="h-7 w-44 rounded-lg bg-slate-200" />
            <div className="h-4 w-72 rounded bg-slate-200" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-10 w-full rounded-xl bg-slate-200" />

          <div className="rounded-xl border border-slate-100 bg-white p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="space-y-3">
                <div className="h-5 w-56 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-slate-50 p-4 space-y-3"
                >
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadDetails() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const { data: response, isLoading } = useLeadDetailQuery(leadId);

  const detail = response?.success ? response.data : undefined;
  const lead = detail
    ? mapDetailToLead(detail)
    : { ...defaultLead, id: leadId ?? "—" };

  if (isLoading) {
    return <LeadDetailsSkeleton />;
  }

  return (
    <div className="p-5">
      <div className=" rounded-b-lg">
        <div className="flex items-start gap-4">
          <Button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft />
            <span>Back</span>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold">Lead Details</h1>
            <p className="text-sm text-gray-600">
              Stay updated with your latest activities and alerts
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue={TABS[0].value} className="w-full">
            <TabsList variant="line" className="w-full justify-start ">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic-info" className="mt-6">
              <BasicDetails lead={detail} />
            </TabsContent>
            <TabsContent value="quotation" className="mt-6">
              <QuotationCard />
            </TabsContent>
            <TabsContent value="open-chat" className="mt-6">
              <ChatCard lead={lead} recentMessages={detail?.recentMessages} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-6">
              <TimelineCard lead={lead} />
            </TabsContent>
            <TabsContent value="follow-ups" className="mt-6">
              <FollowUpsCard
                auditLog={detail?.auditLog}
                followUps={detail?.followUps}
              />
            </TabsContent>
            <TabsContent value="payments" className="mt-6">
              <PaymentsCard
                leadId={detail?.lead._id}
                paymentsData={detail?.payments}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
