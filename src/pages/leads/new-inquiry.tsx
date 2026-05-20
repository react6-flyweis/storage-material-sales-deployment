import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import CreateQuotationForm from "@/components/leads/create-quotation-form";
import { Button } from "@/components/ui/button";

export default function NewInquiryPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Inquiry Form</h1>
            <p className="text-sm text-muted-foreground">
              Create a new lead record and assign it to your pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="">
        <CreateQuotationForm />
      </div>
    </div>
  );
}
