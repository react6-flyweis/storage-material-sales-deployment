import quotationImage from "@/assets/images/quotation.png";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            <ArrowLeft />
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

      {/* Fallback to image */}
      <div className="overflow-x-auto border rounded-md p-4 bg-white mt-4">
        <img
          src={quotationImage}
          alt="Quotation"
          className="w-full h-auto mx-auto"
        />
      </div>
    </div>
  );
}
