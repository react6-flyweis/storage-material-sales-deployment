import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
} from "lucide-react";
import uploadIcon from "@/assets/icons/upload.svg";
import { useLeadImport } from "@/modules/leads/leads.hooks";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export default function ImportLeadsDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showErrorsList, setShowErrorsList] = useState(false);

  const {
    startImport,
    resetImport,
    status,
    isUploading,
    isPolling,
    jobData,
    syncData,
    error: apiError,
  } = useLeadImport();

  const isBusy = isUploading || isPolling;
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  const onChoose = () => {
    if (isBusy) return;
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || isBusy) return;

    const file = files[0];
    setLocalError(null);

    // Validate extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx")) {
      setLocalError("Only Excel files (.xlsx) are accepted.");
      setSelectedFile(null);
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("File size exceeds 25 MB limit. Please select a smaller file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isBusy) {
      setIsDragging(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || isBusy) return;
    setLocalError(null);
    setShowErrorsList(false);

    try {
      await startImport(selectedFile, { async: true });
    } catch {
      // API error handled by useLeadImport state
    }
  };

  const handleClose = () => {
    if (isBusy) {
      // Background job continues even if modal closes
      setOpen(false);
      return;
    }

    if (isCompleted || isFailed) {
      resetImport();
      setSelectedFile(null);
      setLocalError(null);
      setShowErrorsList(false);
      if (inputRef.current) inputRef.current.value = "";
    }
    setOpen(false);
  };

  // Extract display metrics
  const totalRows = jobData?.totalRows ?? syncData?.totalRows ?? 0;
  const processedRows = jobData?.processedRows ?? syncData?.totalRows ?? 0;
  const importedCount =
    jobData?.imported ??
    jobData?.created ??
    syncData?.imported ??
    syncData?.created ??
    0;
  const skippedCount = jobData?.skipped ?? syncData?.skipped ?? 0;
  const progressPct =
    jobData?.progressPct ?? (isCompleted ? 100 : totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0);
  const errors = jobData?.errors ?? syncData?.errors ?? [];

  const displayError = localError || apiError;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white">
          <Upload className="h-4 w-4 mr-2" />
          Import Leads
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Import Leads (.xlsx)</DialogTitle>
          <DialogDescription>
            Upload a TractIQ Excel sheet (.xlsx) with project leads.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Active Job Progress View */}
          {isBusy && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span>
                    {isUploading
                      ? "Uploading file..."
                      : jobData?.status === "queued"
                      ? "Job Queued — waiting for worker..."
                      : "Processing rows..."}
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-700">{progressPct}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-200/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-blue-700">
                <span>
                  Processed {processedRows} of {totalRows} rows
                </span>
                <span>
                  {importedCount} imported, {skippedCount} skipped
                </span>
              </div>
            </div>
          )}

          {/* Completed State Summary */}
          {isCompleted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Import Finished</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm py-2">
                <div className="bg-white p-2.5 rounded border border-green-100">
                  <p className="text-gray-500 text-xs">Total Rows</p>
                  <p className="font-bold text-gray-800 text-base">{totalRows}</p>
                </div>
                <div className="bg-white p-2.5 rounded border border-green-100">
                  <p className="text-green-600 text-xs font-medium">Imported</p>
                  <p className="font-bold text-green-700 text-base">{importedCount}</p>
                </div>
                <div className="bg-white p-2.5 rounded border border-green-100">
                  <p className="text-amber-600 text-xs font-medium">Skipped</p>
                  <p className="font-bold text-amber-700 text-base">{skippedCount}</p>
                </div>
              </div>

              {skippedCount > 0 && (
                <p className="text-xs text-gray-600">
                  Skipped rows were duplicates or missing required project details.
                </p>
              )}
            </div>
          )}

          {/* Failed State Alert */}
          {isFailed && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-medium">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Import Failed</span>
              </div>
              <p className="text-xs text-red-700">
                {apiError || jobData?.errorMessage || "An unexpected error occurred during import."}
              </p>
            </div>
          )}

          {/* File Upload Drop Zone (Available when idle or failed) */}
          {!isBusy && !isCompleted && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                disabled={isBusy}
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 rounded-lg p-5 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/30"
                }`}
                onClick={onChoose}
                role="button"
              >
                <img src={uploadIcon} alt="Upload Icon" className="size-8 opacity-80" />

                <div className="text-gray-600">
                  <p className="text-sm font-medium">
                    Drop your TractIQ Excel (.xlsx) file here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoose();
                  }}
                  className="mt-1 bg-white"
                >
                  Choose file
                </Button>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate font-medium flex-1">{selectedFile.name}</span>
                  <span className="text-xs text-blue-600 font-normal">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Accepted format: <strong>.xlsx</strong> only (Max 25 MB).</p>
                <p>• Required column: <strong>Project</strong> (auto-detects TractIQ header rows).</p>
                <p>• Duplicates (same project + location) will be skipped automatically.</p>
              </div>
            </>
          )}

          {/* Expandable Errors/Skipped Report */}
          {errors.length > 0 && (
            <div className="border border-gray-200 rounded-md overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowErrorsList((prev) => !prev)}
                className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 font-medium text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Skipped Rows / Issues ({errors.length})
                  </span>
                </div>
                {showErrorsList ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {showErrorsList && (
                <div className="max-h-44 overflow-y-auto divide-y divide-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100/70 text-gray-600 sticky top-0">
                      <tr>
                        <th className="px-3 py-1.5 font-semibold w-16">Row</th>
                        <th className="px-3 py-1.5 font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {errors.map((err, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 text-gray-500">#{err.row}</td>
                          <td className="px-3 py-1.5 text-gray-700">
                            {err.reason}
                            {err.leadId && (
                              <span className="ml-1 text-gray-400 text-[10px]">
                                ({err.leadId})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Validation / Local Error */}
          {displayError && !isFailed && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
              {displayError}
            </div>
          )}
        </div>

        <DialogFooter className="border-t p-4 flex justify-end gap-2 bg-gray-50/50">
          {isCompleted ? (
            <Button size="default" className="w-28" onClick={handleClose}>
              Done
            </Button>
          ) : isFailed ? (
            <>
              <DialogClose asChild>
                <Button variant="outline" size="default" onClick={handleClose}>
                  Close
                </Button>
              </DialogClose>
              <Button
                size="default"
                onClick={() => {
                  resetImport();
                  setSelectedFile(null);
                  setLocalError(null);
                }}
              >
                Try Again
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="default"
                  disabled={isBusy}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size="default"
                className="w-32"
                onClick={handleSubmit}
                disabled={!selectedFile || isBusy}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isPolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Import Leads"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
