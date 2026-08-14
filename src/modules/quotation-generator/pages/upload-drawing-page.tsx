import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  FileDropzoneCard,
  type FileItem,
} from "@/components/ui/file-dropzone-card";

export default function UploadDrawingPage() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile] = useState<FileItem | null>({
    name: "Prelim Drawing Building ABC pdf.",
    size: "5.3MB",
  });

  const [xlsxFile, setXlsxFile] = useState<FileItem | null>({
    name: "Prelim Drawing Building ABC pdf.",
    size: "5.3MB",
  });

  return (
    <div className="p-5">
      {/* Top Header Banner */}
      <div className="flex items-center gap-4 mb-6">
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

      <div className="space-y-6">
        {/* Step 1 Card: Upload Prelim Drawing (PDF) */}
        <Card className="">
          <CardHeader className="">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Step 1 — Upload Prelim Drawing (PDF)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  We'll scan page 1 and extract building size, loads, and project details automatically
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-2">
            <div className="border border-slate-200 rounded-xl p-5 bg-white">
              <FileDropzoneCard
                title="Upload Building Drawings & Photos"
                description="Add your documents here, and you can upload up to 5 files max"
                dropText="Drop Prelim Drawing PDF Here"
                subDropText="PDF Only - We only read page 1 - Click to Browse"
                fileTypeLabel="Only support pdf. files"
                accept=".pdf"
                fileIcon="pdf"
                selectedFile={pdfFile}
                onFileSelect={setPdfFile}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2 Card: Upload Xshipper file (.xlsx) */}
        <Card className="bg-white rounded-xl shadow-xs border border-slate-200/80">
          <CardContent className="p-6">
            <FileDropzoneCard
              dropText="Drop your Xshipper file here"
              subDropText="Or click to browse. xlsx files"
              extraInfoText="All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc."
              accept=".xlsx, .xls"
              fileIcon="xlsx"
              selectedFile={xlsxFile}
              onFileSelect={setXlsxFile}
            />
          </CardContent>
        </Card>

        {/* Next Action Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={() => {
              navigate("/quotation/extracted-drawing");
            }}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-14 py-2.5 rounded font-medium cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


