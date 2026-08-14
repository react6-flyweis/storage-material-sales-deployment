import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { FileText, FolderUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface ExtractedQuoteFormData {
  // Title Block
  purchaser: string;
  projectName: string;
  jobNumber: string;
  location: string;
  date: string;

  // Building Dimensions
  width: string;
  length: string;
  eaveHeight: string;
  sqFootage: string;
  baySpacing: string;
  roofSlope: string;

  // Design Loads
  roofDeadLoad: string;
  collateralLoad: string;
  roofLiveLoad: string;
  roofSnowLoad: string;
  groundSnowLoad: string;
  basicWindSpeed: string;
  windExposure: string;
  snowExposureFactor: string;
  intPressureCoeff: string;

  // Seismic, Site & Code
  occupancyCategory: string;
  siteClass: string;
  seismicDesignCat: string;
  seismicZone: string;
  sds: string;
  sd1: string;
  s1: string;
  thermalFactor: string;
  buildingCode: string;

  // Importance Factors & Base Shear
  windIF: string;
  snowIF: string;
  baseShearLong: string;
  baseShearTrans: string;
  deflectionLimitCol: string;

  // Building Type & Panels
  frameType: string;
  roofPanelColor: string;
  wallPanel: string;
  additionalNotes: string;
}

const defaultValues: ExtractedQuoteFormData = {
  purchaser: "Council Bluffs, IA 51503",
  projectName: "BUILDING-C DATA",
  jobNumber: "88901",
  location: "Pune, Maharashtra",
  date: "31 July 2026",

  width: "20'",
  length: "150'",
  eaveHeight: "8.5'",
  sqFootage: "3000",
  baySpacing: "-",
  roofSlope: "0.50/12",

  roofDeadLoad: "2.5 psf",
  collateralLoad: "0.5 psf",
  roofLiveLoad: "20 psf",
  roofSnowLoad: "7 psf",
  groundSnowLoad: "30 psf",
  basicWindSpeed: "115 mph",
  windExposure: "Exposure C",
  snowExposureFactor: "-",
  intPressureCoeff: "-",

  occupancyCategory: "-",
  siteClass: "-",
  seismicDesignCat: "SDC D",
  seismicZone: "-",
  sds: "-",
  sd1: "-",
  s1: "-",
  thermalFactor: "-",
  buildingCode: "IBC 12",

  windIF: "1",
  snowIF: "1",
  baseShearLong: "-",
  baseShearTrans: "-",
  deflectionLimitCol: "-",

  frameType: "-",
  roofPanelColor: "-",
  wallPanel: "-",
  additionalNotes: "-",
};

interface ExtractedQuoteFormSectionProps {
  initialValues?: Partial<ExtractedQuoteFormData>;
  onSubmit?: (data: ExtractedQuoteFormData) => void;
}

export function ExtractedQuoteFormSection({ initialValues, onSubmit }: ExtractedQuoteFormSectionProps) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("Steel_Building_Preliminary_Drawing_Vector.pdf");

  const { register, handleSubmit } = useForm<ExtractedQuoteFormData>({
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
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
            <label className="relative border-2 border-dashed border-blue-400 bg-[#EAF7F0] hover:bg-[#E2F4EB] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white mb-3 shadow-xs">
                <FolderUp className="h-6 w-6" />
              </div>
              {fileName ? (
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
          </div>

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

          {/* Bottom Action Footer */}
        </CardContent>
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
            className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer"
          >
            Apply Dimensions Only
          </Button>
          <span className="text-xs text-slate-400 font-medium ml-1">
            Edit any field above before applying
          </span>
        </CardFooter>
      </Card>
    </form>
  );
}
