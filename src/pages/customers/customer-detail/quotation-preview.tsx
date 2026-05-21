import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import QuotationCard from "@/components/leads/quotation-card";
import type {
  LeadDetailQuotation,
  LeadDetailLead,
  LeadDetailCustomer,
} from "@/modules/leads/leads.api";

interface QuotationData {
  projectName: string;
  quoteNumber: string;
  proposalDate: string;
  validity: string;
  preparedBy: string;
  customerName: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  buildingType: string;
  width: number;
  length: number;
  height: number;
  roofStyle: string;
  windLoad: number;
  snowLoad: number;
  estimatedDelivery: string;
  basePrice: number;
  margin: string;
  currency: string;
  totalPrice: string;
  validUntil: string;
  paymentTerms: string;
  assignedSalesperson: string;
  specialNotes: string;
  internalNotes: string;
  leadSource: string;
  priorityLevel: string;
  assignLead: string;
}

export default function QuotationPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quotationData = (location.state?.quotationData as QuotationData) || {};
  const leadData = location.state?.leadData || {};

  // Map form/lead data to LeadDetailQuotation structure
  const mappedQuotation: LeadDetailQuotation = {
    _id: "preview-id",
    leadId: leadData._id || "preview-lead-id",
    buildingType: quotationData.buildingType || leadData.buildingType || "—",
    basePrice: Number(quotationData.basePrice) || 0,
    maxPrice: Number(quotationData.totalPrice) || 0,
    sqft: leadData.sqft || (quotationData.width && quotationData.length ? String(Number(quotationData.width) * Number(quotationData.length)) : undefined),
    currency: quotationData.currency || "USD",
    roofStyle: quotationData.roofStyle || "—",
    validTill: quotationData.validUntil || undefined,
    location: quotationData.location || leadData.location || "—",
    paymentTerms: quotationData.paymentTerms || "—",
    specialNote: quotationData.specialNotes || "—",
    internalNotes: quotationData.internalNotes || "—",
    priorityLevel: quotationData.priorityLevel || "—",
    status: "draft",
    createdAt: quotationData.proposalDate ? new Date(quotationData.proposalDate).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLatest: true,
    includedMaterials: [
      { name: "Primary Frame Structure" },
      { name: "Secondary Framing" },
      { name: "Roof Panels" },
      { name: "Wall Panels" },
      { name: "Trim & Flashing" },
      { name: "Fasteners & Hardware" },
      { name: "Engineering Drawings" },
      { name: "Structural Calculations" },
      { name: "Foundation Anchor Bolts" },
      { name: "Gutter System" },
      { name: "Ridge Ventilation" },
      { name: "Insulation (if selected)" },
    ],
    optionalAddOns: [
      { name: "Walk-in Doors", price: 450 },
      { name: "Overhead Doors", price: 1200 },
      { name: "Windows", price: 180 },
      { name: "Skylights", price: 320 },
      { name: "Insulation Package", price: 450 },
      { name: "Color Upgrade", price: 450 },
      { name: "Concrete Foundation", price: 4500 },
      { name: "Electrical Package", price: 450 },
    ],
  };

  // Map to LeadDetailLead structure
  const mappedLead: LeadDetailLead = {
    _id: leadData._id || "preview-lead-id",
    customerId: leadData.customerId || "preview-customer-id",
    buildingType: quotationData.buildingType || leadData.buildingType || "—",
    location: leadData.location || quotationData.location || "—",
    source: leadData.source || "—",
    quoteValue: Number(quotationData.totalPrice) || leadData.quoteValue || 0,
    lifecycleStatus: leadData.lifecycleStatus || "—",
    projectName: leadData.projectName || quotationData.projectName || "—",
    sqft: leadData.sqft || (quotationData.width && quotationData.length ? Number(quotationData.width) * Number(quotationData.length) : undefined),
    width: Number(quotationData.width) || leadData.width || null,
    length: Number(quotationData.length) || leadData.length || null,
    height: Number(quotationData.height) || leadData.height || null,
    createdAt: leadData.createdAt || new Date().toISOString(),
    updatedAt: leadData.updatedAt || new Date().toISOString(),
  };

  // Map to LeadDetailCustomer structure
  const mappedCustomer: LeadDetailCustomer = {
    _id: leadData.customerId || "preview-customer-id",
    customerId: leadData.customerId || "preview-customer-id",
    firstName: quotationData.customerName || leadData.customer?.firstName || "—",
    email: quotationData.email || leadData.customer?.email || "—",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Quotation Preview
            </h1>
            {quotationData?.projectName && (
              <p className="text-sm text-gray-600 mt-1">
                Project: {quotationData.projectName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white mt-4">
        <QuotationCard
          quotation={mappedQuotation}
          lead={mappedLead}
          customer={mappedCustomer}
        />
      </div>
    </div>
  );
}

