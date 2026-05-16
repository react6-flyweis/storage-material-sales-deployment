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
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import uploadIcon from "@/assets/icons/upload.svg";
import SuccessDialog from "@/components/success-dialog";
import { useImportLeadsMutation } from "@/modules/leads/leads.hooks";
import { getApiErrorMessage } from "@/lib/api-error";

const REQUIRED_HEADERS = ["name", "email", "phone", "projectType"] as const;

type ParsedLeadFile = {
  csv: string;
  previewHeaders: string[];
  previewRows: string[][];
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function parseLeadFile(file: File): Promise<ParsedLeadFile> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The selected file does not contain any sheet data.");
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    firstSheet,
    {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    },
  );

  if (rows.length < 2) {
    throw new Error(
      "The selected file must include a header and at least one row.",
    );
  }

  const [rawHeaders = [], ...rawDataRows] = rows;
  const normalizedHeaders = rawHeaders.map((header) =>
    normalizeHeader(String(header ?? "")),
  );

  const indexByRequiredHeader = REQUIRED_HEADERS.map((requiredHeader) =>
    normalizedHeaders.findIndex(
      (header) => header === normalizeHeader(requiredHeader),
    ),
  );

  const missingHeaders = REQUIRED_HEADERS.filter(
    (_, index) => indexByRequiredHeader[index] === -1,
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const dataRows = rawDataRows.filter((row) =>
    row.some((cell) => String(cell ?? "").trim().length > 0),
  );

  if (dataRows.length === 0) {
    throw new Error("The selected file does not contain any lead rows.");
  }

  const normalizedRows = dataRows.map((row) =>
    indexByRequiredHeader.map((headerIndex) =>
      String(row[headerIndex] ?? "").trim(),
    ),
  );

  const normalizedSheet = XLSX.utils.aoa_to_sheet([
    [...REQUIRED_HEADERS],
    ...normalizedRows,
  ]);
  const csv = XLSX.utils.sheet_to_csv(normalizedSheet, { blankrows: false });

  if (!csv.trim()) {
    throw new Error("The selected file is empty.");
  }

  return {
    csv,
    previewHeaders: [...REQUIRED_HEADERS],
    previewRows: normalizedRows.slice(0, 5),
  };
}

export default function ImportLeadsDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedCsv, setParsedCsv] = useState<string>("");
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const importLeadsMutation = useImportLeadsMutation();

  const onChoose = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setErrorMessage(null);
    setIsParsingFile(true);

    try {
      const parsedFile = await parseLeadFile(file);
      setSelectedFile(file);
      setParsedCsv(parsedFile.csv);
      setPreviewHeaders(parsedFile.previewHeaders);
      setPreviewRows(parsedFile.previewRows);
    } catch (error) {
      setSelectedFile(null);
      setParsedCsv("");
      setPreviewHeaders([]);
      setPreviewRows([]);
      setErrorMessage(
        getApiErrorMessage(error, "Unable to read the selected file."),
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleImport = async () => {
    if (!selectedFile || importLeadsMutation.isPending) return;

    setErrorMessage(null);

    try {
      const csv = parsedCsv || (await parseLeadFile(selectedFile)).csv;

      await importLeadsMutation.mutateAsync({ csv });

      setSelectedFile(null);
      setParsedCsv("");
      setPreviewHeaders([]);
      setPreviewRows([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setOpen(false);
      setShowSuccess(true);
    } catch (error) {
      const fallbackMessage = "Unable to import leads. Please try again.";
      setErrorMessage(getApiErrorMessage(error, fallbackMessage));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Import Leads</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="p-4">
          <input
            ref={inputRef}
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 rounded-lg p-5  flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-300 bg-blue-50"
                : "border-dashed border-gray-300 bg-transparent"
            }`}
            onClick={onChoose}
            role="button"
          >
            <img src={uploadIcon} alt="Upload Icon" className="size-8" />

            <div className="text-gray-600">
              <p className="text-lg font-medium">
                Drop your CSV or Excel file here
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>

            <div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onChoose();
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
              >
                Choose file
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-4">
            Supported formats: CSV, Excel (.xlsx, .xls)
            <br />
            Required columns: name, email, phone, projectType
          </div>

          {selectedFile && (
            <div className="mt-3 text-sm text-gray-700">
              Selected file: {selectedFile.name}
            </div>
          )}

          {isParsingFile && (
            <div className="mt-3 text-sm text-gray-500">
              Reading file preview...
            </div>
          )}

          {previewHeaders.length > 0 && previewRows.length > 0 && (
            <div className="mt-4 rounded-md border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50">
                Preview (first {previewRows.length} rows)
              </div>

              <div className="max-h-52 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white sticky top-0">
                    <tr>
                      {previewHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 border-b font-semibold text-gray-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="odd:bg-gray-50/50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`cell-${rowIndex}-${cellIndex}`}
                            className="px-3 py-2 border-b text-gray-600"
                          >
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 text-sm text-red-600">{errorMessage}</div>
          )}
        </div>

        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button size="lg" className="bg-gray-300 text-gray-700 mr-2 w-40">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            className="w-40"
            onClick={handleImport}
            disabled={
              !selectedFile ||
              !parsedCsv ||
              isParsingFile ||
              importLeadsMutation.isPending
            }
          >
            {importLeadsMutation.isPending ? "Importing..." : "Import Leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Leads Imported Successfully!"
      />
    </Dialog>
  );
}
