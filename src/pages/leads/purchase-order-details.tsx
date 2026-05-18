import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ActivityLogEntry = {
  id: string;
  title: string;
  timestamp: string;
};

type PurchaseOrderDetails = {
  leadId: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  buildingRequirements: {
    buildingType: string;
    dimensions: string;
    roofStyle: string;
    windLoad: string;
    snowLoad: string;
    estimatedDelivery: string;
    priceRange: string;
  };
  leadManagement: {
    status: string;
    handlerType: string;
    leadScore: string;
    assignedTo: string;
    lastContact: string;
    nextFollowUp: string;
  };
  paymentDetails: {
    received: string;
    pending: string;
  };
  aiHandlingSummary: {
    qualification: string;
    conversationSummary: string[];
    quotationStatus: string;
  };
  includedMaterials: string[];
  optionalAddOns: string[];
  activityLog: ActivityLogEntry[];
};

const details: PurchaseOrderDetails = {
  leadId: "Q-2025-1047",
  contact: {
    name: "John Doe",
    email: "john@doe.com",
    phone: "+1 (555) 123-4567",
    location: "Dallas, TX",
  },
  buildingRequirements: {
    buildingType: "Workshop",
    dimensions: "30' x 40' x 12'",
    roofStyle: "Gable Roof",
    windLoad: "120 mph",
    snowLoad: "20 psf",
    estimatedDelivery: "4-6 weeks",
    priceRange: "$24,500 - $28,000",
  },
  leadManagement: {
    status: "In Pipeline",
    handlerType: "AI",
    leadScore: "HOT",
    assignedTo: "AI Assistant",
    lastContact: "2024-01-15",
    nextFollowUp: "2024-01-18",
  },
  paymentDetails: {
    received: "$208742",
    pending: "$208742",
  },
  aiHandlingSummary: {
    qualification: "Qualified - Budget OK, Timeline Realistic",
    conversationSummary: [
      "Initial quote request received",
      "AI confirmed building specifications",
      "Customer interested in premium options",
    ],
    quotationStatus: "Created by AI - sent",
  },
  includedMaterials: [
    "Frame",
    "Roof",
    "Panels",
    "Trim",
    "Fasteners",
    "Drawings",
    "Engineer Plans",
  ],
  optionalAddOns: ["Doors", "Windows", "Skylights"],
  activityLog: [
    { id: "1", title: "Lead created", timestamp: "by System on 2024-01-15" },
    {
      id: "2",
      title: "AI qualification completed",
      timestamp: "by AI Assistant on 2024-01-15",
    },
    {
      id: "3",
      title: "Quotation sent",
      timestamp: "by AI Assistant on 2024-01-16",
    },
  ],
};

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

export default function PurchaseOrderDetailsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#e9eef8] p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/leads/purchase-orders")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl text-slate-900">PO Details</h1>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          >
            View Customer Profile
          </Button>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          >
            Reject
          </Button>
        </div>
      </div>

      <Card className="mx-auto max-w-305 border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Lead ID: {details.leadId}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Contact Information
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.contact.name}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.contact.email}
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.contact.phone}
                  </p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.contact.location}
                  </p>
                </div>
                <div>
                  <Label>Payment Details</Label>
                  <div className="mt-1 space-y-2 text-sm text-slate-900">
                    <div>
                      <Label>Payment Received</Label>
                      <p className="mt-1">{details.paymentDetails.received}</p>
                    </div>
                    <div>
                      <Label>Payment Pending</Label>
                      <p className="mt-1">{details.paymentDetails.pending}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Building Requirements
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Building Type</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.buildingType}
                  </p>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.dimensions}
                  </p>
                </div>
                <div>
                  <Label>Roof Style</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.roofStyle}
                  </p>
                </div>
                <div>
                  <Label>Wind Load</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.windLoad}
                  </p>
                </div>
                <div>
                  <Label>Snow Load</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.snowLoad}
                  </p>
                </div>
                <div>
                  <Label>Estimated Delivery</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.buildingRequirements.estimatedDelivery}
                  </p>
                </div>
                <div>
                  <Label>Price Range</Label>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {details.buildingRequirements.priceRange}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800">
                Lead Management
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Status</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
                    {details.leadManagement.status}
                  </Badge>
                </div>
                <div>
                  <Label>Handler Type</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
                    {details.leadManagement.handlerType}
                  </Badge>
                </div>
                <div>
                  <Label>Lead Score</Label>
                  <Badge className="mt-1 rounded-full border-0 bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-100">
                    {details.leadManagement.leadScore}
                  </Badge>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.leadManagement.assignedTo}
                  </p>
                </div>
                <div>
                  <Label>Last Contact</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.leadManagement.lastContact}
                  </p>
                </div>
                <div>
                  <Label>Next Follow-up</Label>
                  <p className="mt-1 text-sm text-slate-900">
                    {details.leadManagement.nextFollowUp}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-800">
              AI Handling Summary
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>AI Qualification</Label>
                <p className="mt-1 text-sm text-slate-900">
                  {details.aiHandlingSummary.qualification}
                </p>

                <div className="mt-4">
                  <Label>AI Conversation Summary</Label>
                  <ul className="mt-2 space-y-1.5">
                    {details.aiHandlingSummary.conversationSummary.map(
                      (item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <Label>Quotation Status</Label>
                <p className="mt-1 text-sm text-slate-900">
                  {details.aiHandlingSummary.quotationStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Included Materials
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {details.includedMaterials.map((material) => (
                  <Badge
                    key={material}
                    className="rounded-full border-0 bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    {material}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Optional Add-ons
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {details.optionalAddOns.map((addon) => (
                  <Badge
                    key={addon}
                    className="rounded-full border-0 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-800">
              Activity Log
            </h2>
            <div className="mt-4 space-y-5">
              {details.activityLog.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500" />
                    {index !== details.activityLog.length - 1 ? (
                      <div className="h-10 w-px bg-slate-200" />
                    ) : null}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-slate-900">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
