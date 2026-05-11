import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import BasicDetails from "@/components/leads/basic-details";
// import RFQTab from "@/components/leads/rfq-tab";
import QuotationCard from "@/components/leads/quotation-card";
import ChatCard from "@/components/leads/chat-card";
import TimelineCard from "@/components/leads/timeline-card";
import FollowUpsCard from "@/components/leads/follow-ups-card";
import PaymentsCard from "@/components/leads/payments-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "basic-info", label: "Basic info" },
  // { value: "rfq", label: "RFQ" },
  { value: "quotation", label: "Quotation" },
  { value: "open-chat", label: "Open Chat" },
  { value: "timeline", label: "Timeline" },
  { value: "follow-ups", label: "Follow Ups" },
  { value: "payments", label: "Payments" },
] as const;

export default function LeadDetails() {
  const navigate = useNavigate();

  const lead = {
    id: "LD-2025-001",
    name: "John Doe",
    workshop: "Residential Building",
    category: "Lahore",
    assignedToName: "Aamir",
    assignmentStatus: "Assigned",
    progress: 3,
    status: "Negotiation",
    statusColor: "orange",
    quoteValue: "PKR 120,000",
    chatCount: 2,
  } as const;

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
              <BasicDetails />
            </TabsContent>
            {/* <TabsContent value="rfq" className="mt-6">
              <RFQTab />
            </TabsContent> */}
            <TabsContent value="quotation" className="mt-6">
              <QuotationCard />
            </TabsContent>
            <TabsContent value="open-chat" className="mt-6">
              <ChatCard lead={lead} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-6">
              <TimelineCard lead={lead} />
            </TabsContent>
            <TabsContent value="follow-ups" className="mt-6">
              <FollowUpsCard />
            </TabsContent>
            <TabsContent value="payments" className="mt-6">
              <PaymentsCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
