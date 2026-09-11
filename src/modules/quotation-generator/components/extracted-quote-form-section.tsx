import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  FileText,
  FolderUp,
  Check,
  Loader2,
  FileCode,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { extractDrawingProvider } from "../estimates.api";
import {
  type ExtractedQuoteFormData,
  defaultExtractedQuoteFormData,
  mapExtractedDrawingToFormData,
} from "../utils/extracted-drawing-mapper";

import type { ExtractDrawingResponseData } from "../estimates.api";

export type { ExtractedQuoteFormData };

interface ExtractedQuoteFormSectionProps {
  initialValues?: Partial<ExtractedQuoteFormData>;
  pdfFileName?: string;
  rawTextPreview?: string;
  note?: string;
  isExtracted?: boolean;
  onSubmit?: (data: ExtractedQuoteFormData) => void;
  onDrawingExtracted?: (data: ExtractDrawingResponseData) => void;
  onApplyDimensionsOnly?: (dimensions: {
    width: string;
    length: string;
    eaveHeight: string;
    sqFootage: string;
    roofSlope: string;
    baySpacing: string;
  }) => void;
}

export function ExtractedQuoteFormSection({
  initialValues,
  pdfFileName,
  rawTextPreview,
  note,
  isExtracted,
  onSubmit,
  onDrawingExtracted,
  onApplyDimensionsOnly,
}: ExtractedQuoteFormSectionProps) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState(pdfFileName || "");
  const [currentRawText, setCurrentRawText] = useState(rawTextPreview || "");
  const [currentNote, setCurrentNote] = useState(note || "");

  const [isRawTextModalOpen, setIsRawTextModalOpen] = useState(false);
  const [isReExtracting, setIsReExtracting] = useState(false);
  const [reExtractError, setReExtractError] = useState<string | null>(null);

  const hasExtractedData = Boolean(
    isExtracted ||
    Boolean(fileName && fileName.trim()) ||
    Boolean(currentRawText && currentRawText.trim())
  );

  const { register, handleSubmit, reset, setValue, getValues } =
    useForm<ExtractedQuoteFormData>({
      defaultValues: {
        ...defaultExtractedQuoteFormData,
        ...initialValues,
      },
    });

  useEffect(() => {
    if (initialValues) {
      reset({
        ...defaultExtractedQuoteFormData,
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  useEffect(() => {
    setFileName(pdfFileName || "");
  }, [pdfFileName]);

  useEffect(() => {
    setCurrentRawText(rawTextPreview || "");
  }, [rawTextPreview]);

  useEffect(() => {
    setCurrentNote(note || "");
  }, [note]);

  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setReExtractError("Please upload a PDF file (.pdf).");
      return;
    }

    setFileName(file.name);
    setIsReExtracting(true);
    setReExtractError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const fileBase64 = reader.result as string;
          const res = await extractDrawingProvider({
            fileBase64,
            fileName: file.name,
          });

          if (res.success && res.data) {
            const ext = res.data.extracted || {};
            setCurrentRawText(res.data.rawTextPreview || "");
            if (res.data.note) setCurrentNote(res.data.note);

            const mapped = mapExtractedDrawingToFormData(ext);
            (Object.keys(mapped) as Array<keyof ExtractedQuoteFormData>).forEach((key) => {
              const val = mapped[key];
              if (val !== undefined) {
                setValue(key, val);
              }
            });
            if (onDrawingExtracted) {
              onDrawingExtracted(res.data);
            }
          } else {
            setReExtractError(res.message || "Failed to extract drawing data.");
          }
        } catch (err) {
          console.error("Extraction error:", err);
          setReExtractError("Failed to extract drawing data from PDF.");
        } finally {
          setIsReExtracting(false);
        }
      };
    } catch (err) {
      console.error("File read error:", err);
      setIsReExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isReExtracting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyDimensions = () => {
    const values = getValues();
    if (onApplyDimensionsOnly) {
      onApplyDimensionsOnly({
        width: values.width,
        length: values.length,
        eaveHeight: values.eaveHeight,
        sqFootage: values.sqFootage,
        roofSlope: values.roofSlope,
        baySpacing: values.baySpacing,
      });
    }
  };

  const onFormSubmit = (data: ExtractedQuoteFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      navigate("/quotation");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Step 1 Card: Upload Prelim Drawing (PDF) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Step 1 — Upload Prelim Drawing (PDF)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  We'll scan page 1 and extract building size, loads, and project details automatically
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <div className="border border-slate-200/80 rounded-xl mx-5 p-5 bg-white">
              <h3 className="text-base font-bold text-slate-900 mb-0.5">
                Upload Building Drawings & Photos
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Add your documents here, and you can upload up to 5 files max
              </p>

              {/* Upload Drop Zone */}
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-600 bg-[#d8f3e5] ring-2 ring-blue-400"
                    : "border-blue-400 bg-[#EAF7F0] hover:bg-[#E2F4EB]"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isReExtracting}
                />
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mb-3 shadow-xs">
                  {isReExtracting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <FolderUp className="h-6 w-6" />
                  )}
                </div>
                {isReExtracting ? (
                  <p className="text-sm font-semibold text-blue-600">
                    Extracting Page 1 Drawing Data...
                  </p>
                ) : fileName ? (
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600 stroke-3" />
                    <span>{fileName}</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    Drop Prelim Drawing PDF Here
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  PDF Only - We only read page 1 - Click to Browse
                </p>
              </label>

              {reExtractError && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{reExtractError}</span>
                </div>
              )}
            </div>

            {hasExtractedData && (
              <>
                {/* Extracted Information Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 px-5">
                  <h2 className="text-sm md:text-base font-extrabold text-slate-900 tracking-wide uppercase">
                    EXTRACTED FROM DRAWING - EDIT ANYTHING BEFORE APPLYING
                  </h2>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-medium cursor-pointer shadow-xs"
                    >
                      Apply All to Quote & SOW
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRawTextModalOpen(true)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg text-xs md:text-sm font-medium cursor-pointer"
                    >
                      Show raw text
                    </Button>
                  </div>
                </div>

            {/* Extracted Data Sections Container */}
            <div className="mt-5 border-t divide-y">
              {/* 1. TITLE BLOCK */}
              <div className="bg-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    📋 Title Block
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Purchaser / Customer
                    </label>
                    <Input
                      type="text"
                      {...register("purchaser")}
                      className="rounded h-10"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project Name
                    </label>
                    <Input
                      type="text"
                      {...register("projectName")}
                      className="rounded h-10"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Job Number
                    </label>
                    <Input
                      type="text"
                      {...register("jobNumber")}
                      className="rounded h-10"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Location / City State
                    </label>
                    <Input
                      type="text"
                      {...register("location")}
                      className="rounded h-10"
                    />
                  </div>
                  <div className="md:col-span-1 md:col-start-5">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Date
                    </label>
                    <Input
                      type="text"
                      {...register("date")}
                      className="rounded h-10"
                    />
                  </div>
                </div>
              </div>

              {/* 2. BUILDING DIMENSIONS */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    📐 BUILDING DIMENSIONS
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Width</label>
                    <Input
                      type="text"
                      {...register("width")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Length</label>
                    <Input
                      type="text"
                      {...register("length")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Eave Height</label>
                    <Input
                      type="text"
                      {...register("eaveHeight")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sq Footage</label>
                    <Input
                      type="text"
                      {...register("sqFootage")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bay Spacing</label>
                    <Input
                      type="text"
                      {...register("baySpacing")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Roof Slope</label>
                    <Input
                      type="text"
                      {...register("roofSlope")}
                      className="rounded h-10"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DESIGN LOADS */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    ⚖️ DESIGN LOADS
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Roof Dead Load</label>
                    <Input
                      type="text"
                      {...register("roofDeadLoad")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Collateral Load</label>
                    <Input
                      type="text"
                      {...register("collateralLoad")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Roof Live Load</label>
                    <Input
                      type="text"
                      {...register("roofLiveLoad")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Roof Snow Load</label>
                    <Input
                      type="text"
                      {...register("roofSnowLoad")}
                      className="rounded h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ground Snow Load (pg)</label>
                    <Input
                      type="text"
                      {...register("groundSnowLoad")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Basic wind speed</label>
                    <Input
                      type="text"
                      {...register("basicWindSpeed")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Wind Exposure</label>
                    <Input
                      type="text"
                      {...register("windExposure")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Snow Exposure Factor</label>
                    <Input
                      type="text"
                      {...register("snowExposureFactor")}
                      className="rounded h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Int. Pressure Coeff.</label>
                  <Input
                    type="text"
                    {...register("intPressureCoeff")}
                    className="rounded h-10"
                  />
                </div>
              </div>

              {/* 4. SEISMIC, SITE & CODE */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    🌍 SEISMIC, SITE & CODE
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Occupancy category</label>
                    <Input
                      type="text"
                      {...register("occupancyCategory")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Site Class</label>
                    <Input
                      type="text"
                      {...register("siteClass")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seismic Design Cat.</label>
                    <Input
                      type="text"
                      {...register("seismicDesignCat")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seismic Zone</label>
                    <Input
                      type="text"
                      {...register("seismicZone")}
                      className="rounded h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sds</label>
                    <Input
                      type="text"
                      {...register("sds")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sd1</label>
                    <Input
                      type="text"
                      {...register("sd1")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">S1</label>
                    <Input
                      type="text"
                      {...register("s1")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thermal Factor</label>
                    <Input
                      type="text"
                      {...register("thermalFactor")}
                      className="rounded h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Building Code</label>
                    <Input
                      type="text"
                      {...register("buildingCode")}
                      className="rounded h-10"
                    />
                  </div>
                </div>
              </div>

              {/* 5. IMPORTANCE FACTORS & BASE SHEAR */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    📊 IMPORTANCE FACTORS & BASE SHEAR
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Wind IF</label>
                    <Input
                      type="text"
                      {...register("windIF")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Snow IF</label>
                    <Input
                      type="text"
                      {...register("snowIF")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Shear — Long.</label>
                    <Input
                      type="text"
                      {...register("baseShearLong")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Shear — Trans.</label>
                    <Input
                      type="text"
                      {...register("baseShearTrans")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deflection Limit (Col)</label>
                    <Input
                      type="text"
                      {...register("deflectionLimitCol")}
                      className="rounded h-10"
                    />
                  </div>
                </div>
              </div>

              {/* 6. BUILDING TYPE & PANELS */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    🏗️ BUILDING TYPE & PANELS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frame Type</label>
                    <Input
                      type="text"
                      {...register("frameType")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Roof Panel / Color</label>
                    <Input
                      type="text"
                      {...register("roofPanelColor")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Wall Panel</label>
                    <Input
                      type="text"
                      {...register("wallPanel")}
                      className="rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Additional Notes</label>
                    <Input
                      type="text"
                      {...register("additionalNotes")}
                      className="rounded h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
                </>
              )}
          </CardContent>

          {hasExtractedData && (
            <CardFooter className="flex flex-col sm:flex-row items-center gap-3 border-t">
              <Button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Apply All to Quote & SOW
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyDimensions}
                className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer"
              >
                Apply Dimensions Only
              </Button>
              <span className="text-xs text-slate-400 font-medium ml-1">
                Edit any field above before applying
              </span>
            </CardFooter>
          )}
        </Card>
      </form>

      {/* Raw Text Preview Modal */}
      <Dialog open={isRawTextModalOpen} onOpenChange={setIsRawTextModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileCode className="h-5 w-5 text-blue-600" />
              Drawing Page 1 Raw Text Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {currentNote || "Best-effort extraction — review before applying."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
            {currentRawText || "No raw text preview extracted from this document."}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => setIsRawTextModalOpen(false)}
              variant="secondary"
              className="text-xs px-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
