import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  FileDropzoneCard,
  type FileItem,
} from "@/components/ui/file-dropzone-card";
import {
  extractDrawingProvider,
  extractShipperProvider,
  type ExtractShipperResponseData,
} from "../estimates.api";
import { uploadFileToS3 } from "@/lib/upload";
import { useQuotationStore } from "@/modules/quotation/quotation.store";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

export default function UploadDrawingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    jobType,
    scope,
    roofType,
    installCost,
    installSell,
    blendPercentage,
  } = useQuotationStore();

  const [pdfFileItem, setPdfFileItem] = useState<FileItem | null>(null);
  const [rawPdfFile, setRawPdfFile] = useState<File | null>(null);

  const [xlsxFile, setXlsxFile] = useState<FileItem | null>(null);
  const [rawXlsxFile, setRawXlsxFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handlePdfSelect = (item: FileItem | null, rawFile?: File | null) => {
    setPdfFileItem(item);
    setRawPdfFile(rawFile ?? null);
    setExtractionError(null);
  };

  const handleXlsxSelect = (item: FileItem | null, rawFile?: File | null) => {
    setXlsxFile(item);
    setRawXlsxFile(rawFile ?? null);
    setExtractionError(null);
  };

  const handleNext = async () => {
    if (!pdfFileItem && !xlsxFile) {
      navigate("/quotation/extracted-drawing", {
        state: { ...location.state },
      });
      return;
    }

    setIsProcessing(true);
    setExtractionError(null);

    let pdfUrl = "";
    let xlsxUrl = "";
    let extractedData = undefined;
    let extractedShipperData: ExtractShipperResponseData | undefined = undefined;

    try {
      // 1. Upload PDF to S3 if present
      if (rawPdfFile) {
        setStatusMessage("Uploading PDF drawing to S3...");
        pdfUrl = await uploadFileToS3(rawPdfFile, "drawings");
      }

      // 2. Upload XLSX to S3 if present
      if (rawXlsxFile) {
        setStatusMessage("Uploading Xshipper file to S3...");
        xlsxUrl = await uploadFileToS3(rawXlsxFile, "drawings");
      }

      // 3. Extract Drawing Data from PDF
      if (rawPdfFile) {
        setStatusMessage("Extracting Drawing Data...");
        const fileBase64 = await fileToBase64(rawPdfFile);
        const res = await extractDrawingProvider({
          fileBase64,
          fileName: rawPdfFile.name,
        });

        if (res.success && res.data) {
          extractedData = res.data;
        } else {
          setExtractionError(
            res.message || "Failed to extract PDF drawing data. Proceeding manually."
          );
        }
      }

      // 4. Extract Shipper Data from XLSX
      if (rawXlsxFile) {
        setStatusMessage("Extracting Shipper Data (XLSX)...");
        const xlsxBase64 = await fileToBase64(rawXlsxFile);
        const resShipper = await extractShipperProvider({
          fileBase64: xlsxBase64,
          fileName: rawXlsxFile.name,
          jobType,
          scope: scope.toLowerCase(),
          roof: roofType.toLowerCase(),
          install: "medium",
          squareFootage: 0,
          useManualSquareFootage: false,
          blendPct: blendPercentage,
          installCostPerSf: installCost,
          sellPerSf: installSell,
        });

        if (resShipper.success && resShipper.data) {
          extractedShipperData = resShipper.data;
        } else {
          setExtractionError(
            (prev) =>
              (prev ? `${prev} | ` : "") +
              (resShipper.message || "Failed to extract shipper XLSX data.")
          );
        }
      }

      navigate("/quotation/extracted-drawing", {
        state: {
          ...location.state,
          extractedDrawing: extractedData,
          extractedShipper: extractedShipperData,
          pdfFileName: pdfFileItem?.name,
          pdfUrl,
          xlsxFileName: xlsxFile?.name,
          xlsxUrl,
        },
      });
    } catch (err: unknown) {
      console.error("Processing error:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while uploading or extracting files.";
      setExtractionError(errorMsg);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

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
                selectedFile={pdfFileItem}
                onFileSelect={handlePdfSelect}
              />
            </div>
            {extractionError && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{extractionError}</span>
              </div>
            )}
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
              onFileSelect={handleXlsxSelect}
            />
          </CardContent>
        </Card>

        {/* Next Action Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={handleNext}
            disabled={isProcessing}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-14 py-2.5 rounded font-medium cursor-pointer flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusMessage || "Processing..."}
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

