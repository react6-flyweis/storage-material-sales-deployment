import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedQuoteFormSection } from "../components/extracted-quote-form-section";
import { QuoteBreakdownPricingSection } from "../components/quote-breakdown-pricing-section";
import { QuotationStickerTool } from "../components/quotation-sticker-tool";

export default function ExtractedDrawingPage() {
  const navigate = useNavigate();
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);

  return (
    <div className="">
      {/* Sticky Header / Tool Section */}
      <QuotationStickerTool />

      <div className="p-5 pt-0 space-y-4">
        {/* Top Header Banner */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-primary text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PEMB Quote</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review the customer's material request, configure pricing, and generate a quotation for approval.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer & Project Information Card (Collapsible) */}
          <Card className="p-0">
            <button
              type="button"
              onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Customer & Project Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill in customer details — auto-populates Quote, SOW & Contract
                  </p>
                </div>
              </div>
              <div className="text-slate-500 p-1">
                {isCustomerInfoOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </button>

            {isCustomerInfoOpen && (
              <CardContent className="px-6 pb-6 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">Lead / Company:</span> John Doe
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Email:</span> johndoe@gmail.com
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Street Address:</span> 1234 Main Street
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">City, State ZIP:</span> Pune, 412101
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 1 Section using React Hook Form */}
          <ExtractedQuoteFormSection />

          {/* Extracted Drawing Breakdown & Pricing Section */}
          <QuoteBreakdownPricingSection />
        </div>
      </div>
    </div>
  );
}

