import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ExtractedQuoteFormSection,
  type ExtractedQuoteFormData,
} from "../components/extracted-quote-form-section";
import { mapExtractedDrawingToFormData } from "../utils/extracted-drawing-mapper";
import { QuoteBreakdownPricingSection } from "../components/quote-breakdown-pricing-section";
import { QuotationStickerTool } from "../components/quotation-sticker-tool";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import type {
  ExtractDrawingResponseData,
  ExtractShipperResponseData,
} from "../estimates.api";

export default function PembQuotePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);

  const {
    pembLeadId,
    pembLeadName,
    pembEmail,
    pembStreet,
    pembCityStateZip,
    pembJobNumber,
    pembBuildingSize,
    pembSquareFootage,
    pembQuoteDate,
    pembExtractedDrawing,
    pembExtractedShipper,
    pembPdfFileName,
    pembEstimateId,
    setPembLeadData,
    setPembExtractedDrawing,
    setPembExtractedShipper,
    setPembPdfFileName,
    setPembEstimateId,
    setBuildingSize,
    setSquareFootage,
  } = useQuotationStore();

  const navState = (location.state || {}) as {
    quotationForm?: Record<string, string>;
    extractedDrawing?: ExtractDrawingResponseData;
    extractedShipper?: ExtractShipperResponseData;
    pdfFileName?: string;
    pdfUrl?: string;
    xlsxFileName?: string;
    xlsxUrl?: string;
    estimateId?: string;
  };

  // Preserve state from store if already present, or use from location.state
  const quotationForm = useMemo(() => {
    if (
      navState.quotationForm &&
      (navState.quotationForm.leadName ||
        navState.quotationForm.leadId ||
        navState.quotationForm.jobNumber ||
        navState.quotationForm.cityStateZip)
    ) {
      return navState.quotationForm;
    }
    if (pembLeadName || pembLeadId || pembJobNumber) {
      return {
        leadId: pembLeadId,
        leadName: pembLeadName,
        email: pembEmail,
        street: pembStreet,
        cityStateZip: pembCityStateZip,
        jobNumber: pembJobNumber,
        buildingSize: pembBuildingSize,
        squareFootage: pembSquareFootage,
        quoteDate: pembQuoteDate,
      };
    }
    return navState.quotationForm;
  }, [
    navState.quotationForm,
    pembLeadId,
    pembLeadName,
    pembEmail,
    pembStreet,
    pembCityStateZip,
    pembJobNumber,
    pembBuildingSize,
    pembSquareFootage,
    pembQuoteDate,
  ]);

  // Check if lead data or loaded estimate data is available in state or store. If not, redirect to /quotation/pemb/create
  const hasLeadData = Boolean(
    (quotationForm &&
      (quotationForm.leadName ||
        quotationForm.leadId ||
        quotationForm.jobNumber ||
        quotationForm.cityStateZip)) ||
    navState.extractedShipper ||
    navState.estimateId ||
    pembExtractedShipper,
  );

  useEffect(() => {
    if (!hasLeadData) {
      navigate("/quotation/pemb/create", { replace: true });
    }
  }, [hasLeadData, navigate]);

  const [extractedDrawing, setExtractedDrawing] = useState<
    ExtractDrawingResponseData | undefined
  >(navState.extractedDrawing || pembExtractedDrawing || undefined);

  const [extractedShipper, setExtractedShipper] = useState<
    ExtractShipperResponseData | undefined
  >(navState.extractedShipper || pembExtractedShipper || undefined);

  const [pdfFileName, setPdfFileName] = useState<string>(
    navState.pdfFileName ||
      navState.extractedDrawing?.fileName ||
      pembPdfFileName ||
      pembExtractedDrawing?.fileName ||
      "",
  );

  // Sync navState to store & local state if provided
  useEffect(() => {
    if (navState.quotationForm) {
      setPembLeadData(navState.quotationForm);
    }
    if (navState.extractedDrawing) {
      setPembExtractedDrawing(navState.extractedDrawing);
      setExtractedDrawing(navState.extractedDrawing);
    }
    if (navState.extractedShipper) {
      setPembExtractedShipper(navState.extractedShipper);
      setExtractedShipper(navState.extractedShipper);
    }
    if (navState.pdfFileName || navState.extractedDrawing?.fileName) {
      const pName =
        navState.pdfFileName || navState.extractedDrawing?.fileName || "";
      setPembPdfFileName(pName);
      setPdfFileName(pName);
    }
    if (navState.estimateId) {
      setPembEstimateId(navState.estimateId);
    }
  }, [
    navState.quotationForm,
    navState.extractedDrawing,
    navState.extractedShipper,
    navState.pdfFileName,
    navState.estimateId,
    setPembLeadData,
    setPembExtractedDrawing,
    setPembExtractedShipper,
    setPembPdfFileName,
    setPembEstimateId,
  ]);

  const extracted = extractedDrawing?.extracted;
  const coverLabelMap = extractedShipper?.coverSheet?.labelMap;

  const initialValues: Partial<ExtractedQuoteFormData> = useMemo(
    () =>
      mapExtractedDrawingToFormData(extracted, {
        coverLabelMap,
        quotationForm,
        extractedShipperSqFt: extractedShipper?.squareFootage,
      }),
    [extracted, coverLabelMap, quotationForm, extractedShipper?.squareFootage],
  );

  const applyDimensions = useCallback(
    (dims: {
      width?: string;
      length?: string;
      eaveHeight?: string;
      sqFootage?: string;
    }) => {
      if (dims.width || dims.length || dims.eaveHeight) {
        setBuildingSize(
          `${dims.width || ""}${dims.length ? `×${dims.length}` : ""}${dims.eaveHeight ? `×${dims.eaveHeight}` : ""}`,
        );
      }
      if (dims.sqFootage) {
        const sqVal = parseFloat(dims.sqFootage.replace(/[^0-9.]/g, ""));
        if (!isNaN(sqVal) && sqVal > 0) {
          setSquareFootage(sqVal);
        }
      }
    },
    [setBuildingSize, setSquareFootage],
  );

  const handleApplyDimensionsOnly = useCallback(
    (dims: {
      width: string;
      length: string;
      eaveHeight: string;
      sqFootage: string;
      roofSlope: string;
      baySpacing: string;
    }) => {
      applyDimensions(dims);
    },
    [applyDimensions],
  );

  const handleFormSubmit = useCallback(
    (data: ExtractedQuoteFormData) => {
      applyDimensions(data);
    },
    [applyDimensions],
  );

  const handleDrawingExtracted = useCallback(
    (data: ExtractDrawingResponseData) => {
      setExtractedDrawing(data);
      setPembExtractedDrawing(data);
      if (data.fileName) {
        setPdfFileName(data.fileName);
        setPembPdfFileName(data.fileName);
      }
      if (data.extracted) {
        const dims = {
          width: data.extracted.width,
          length: data.extracted.length,
          eaveHeight: data.extracted.eaveheight || data.extracted.eave,
          sqFootage: data.extracted.sqfootage || data.extracted.sqft,
        };
        applyDimensions(dims);
      }
    },
    [applyDimensions, setPembExtractedDrawing, setPembPdfFileName],
  );

  const handleShipperExtracted = useCallback(
    (data: ExtractShipperResponseData) => {
      setExtractedShipper(data);
      setPembExtractedShipper(data);
      if (data.squareFootage) {
        setSquareFootage(data.squareFootage);
      }
    },
    [setSquareFootage, setPembExtractedShipper],
  );

  if (!hasLeadData) {
    return null;
  }

  const customerLeadName =
    quotationForm?.leadName ||
    extracted?.customer ||
    coverLabelMap?.customer ||
    "";
  const customerEmail = quotationForm?.email || "";
  const customerStreet = quotationForm?.street || "";
  const customerCityStateZip = quotationForm?.cityStateZip || "";
  const jobNumber = quotationForm?.jobNumber || extracted?.jobnumber || "";
  const buildingSize = quotationForm?.buildingSize || "";
  const squareFootage = quotationForm?.squareFootage || "";
  const quoteDate = quotationForm?.quoteDate || pembQuoteDate || "";

  return (
    <div className="">
      {/* Sticky Header / Tool Section */}
      <QuotationStickerTool />

      <div className="p-5 pt-0 space-y-6">
        {/* Top Header Banner */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => navigate("/quotation/pemb/create")}
            variant="outline"
            className="border-primary text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PEMB Quote</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review the customer's material request, configure pricing, and
              generate a quotation for approval.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer & Project Information Card (Collapsible) */}
          <Card className="p-0 gap-0">
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
                    Fill in customer details — auto-populates Quote, SOW &
                    Contract
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-slate-500 p-1">
                  {isCustomerInfoOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>

            {isCustomerInfoOpen && (
              <CardContent className="p-6 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* Customer / Company Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Customer / Company Name
                    </Label>
                    <Input
                      disabled
                      value={customerLeadName}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Customer Email */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Customer Email
                    </Label>
                    <Input
                      disabled
                      value={customerEmail}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Street Address
                    </Label>
                    <Input
                      disabled
                      value={customerStreet}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* City, State ZIP */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      City, State ZIP
                    </Label>
                    <Input
                      disabled
                      value={customerCityStateZip}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Building Size */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Building Size
                    </Label>
                    <Input
                      disabled
                      value={buildingSize}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Square Footage */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Square Footage
                    </Label>
                    <Input
                      disabled
                      value={squareFootage}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Job Number (optional) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Job Number (optional)
                    </Label>
                    <Input
                      disabled
                      value={jobNumber}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Quote Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Quote Date
                    </Label>
                    <Input
                      disabled
                      value={quoteDate}
                      className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg disabled:opacity-100 disabled:bg-[#F8FAFC] disabled:text-slate-900 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 1: Prelim Drawing (PDF) & Extracted Quote Form */}
          <ExtractedQuoteFormSection
            initialValues={initialValues}
            pdfFileName={pdfFileName}
            rawTextPreview={extractedDrawing?.rawTextPreview}
            note={extractedDrawing?.note}
            isExtracted={Boolean(extractedDrawing)}
            onApplyDimensionsOnly={handleApplyDimensionsOnly}
            onSubmit={handleFormSubmit}
            onDrawingExtracted={handleDrawingExtracted}
          />

          {/* Step 2: Xshipper file (.xlsx) & Quote Breakdown Pricing Section */}
          <QuoteBreakdownPricingSection
            extractedShipper={extractedShipper}
            quotationForm={quotationForm}
            extractedDrawing={extractedDrawing}
            pdfFileName={pdfFileName}
            estimateId={navState.estimateId || pembEstimateId}
            onShipperExtracted={handleShipperExtracted}
          />
        </div>
      </div>
    </div>
  );
}
