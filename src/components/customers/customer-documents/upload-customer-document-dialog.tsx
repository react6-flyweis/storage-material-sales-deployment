import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  UploadCloud,
  X,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadCustomerDocumentToS3,
} from "@/modules/customers/customers.api";
import {
  useCreateCustomerDocumentMutation,
} from "@/modules/customers/customers.hooks";
import {
  CUSTOMER_DOCUMENT_CATEGORIES,
  type CustomerDocumentCategory,
} from "@/modules/customers/customer-documents.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
  categories?: CustomerDocumentCategory[];
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function UploadCustomerDocumentDialog({
  open,
  onOpenChange,
  customerId,
  onSuccess,
  categories,
}: Props) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [docName, setDocName] = React.useState("");
  const [category, setCategory] = React.useState<CustomerDocumentCategory>("other");
  const [notes, setNotes] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);

  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadStep, setUploadStep] = React.useState<
    "idle" | "presigning" | "uploading" | "registering" | "done"
  >("idle");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const createMutation = useCreateCustomerDocumentMutation(customerId);

  // Available categories: either from API data.categories or default constant
  const categoryOptions = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((catKey) => {
        const found = CUSTOMER_DOCUMENT_CATEGORIES.find((c) => c.value === catKey);
        return (
          found || {
            value: catKey,
            label: catKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            description: "",
          }
        );
      });
    }
    return CUSTOMER_DOCUMENT_CATEGORIES;
  }, [categories]);

  const resetForm = React.useCallback(() => {
    setSelectedFile(null);
    setDocName("");
    setCategory("other");
    setNotes("");
    setIsDragging(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStep("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (isUploading) return; // Prevent closing while in-flight
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!docName.trim()) {
      setDocName(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!docName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setUploadStep("presigning");

      // 1 & 2: S3 presign and PUT
      setUploadStep("uploading");
      const { fileUrl } = await uploadCustomerDocumentToS3(
        selectedFile,
        (percent) => {
          // Map S3 upload progress from 10% to 85%
          setUploadProgress(10 + Math.round((percent * 75) / 100));
        },
      );

      // 3: Register document in Mongo Customer record
      setUploadStep("registering");
      setUploadProgress(90);

      const response = await createMutation.mutateAsync({
        name: docName.trim(),
        fileUrl,
        fileType: selectedFile.type || "application/octet-stream",
        fileSize: selectedFile.size,
        category,
        notes: notes.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to register document");
      }

      setUploadProgress(100);
      setUploadStep("done");
      toast.success("Customer document uploaded successfully");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setIsUploading(false);
      setUploadStep("idle");
      setUploadProgress(0);

      const errorObj = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ msg?: string; path?: string }>;
          };
        };
        message?: string;
      };

      const serverMsg = errorObj.response?.data?.message;
      const validationDetails = errorObj.response?.data?.errors
        ?.map((item) => `${item.path ? `${item.path}: ` : ""}${item.msg}`)
        .join(", ");

      const errorMsg =
        validationDetails || serverMsg || errorObj.message || "Failed to upload document";

      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#1D51A4] flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Upload Customer Document
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Documents stored on this customer profile are shared across all their projects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          {/* File Drag & Drop */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Select File <span className="text-red-500">*</span>
            </Label>

            {selectedFile ? (
              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-blue-100 text-[#1D51A4] flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || "file"}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/60"
                }`}
              >
                <div className="h-11 w-11 rounded-full bg-blue-50 text-[#1D51A4] flex items-center justify-center mb-2">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-800">
                  Click to select or drag and drop a file
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, DWG, DXF, PNG, JPG, or ZIP (Drawings, Plans, Renderings)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                />
              </label>
            )}
          </div>

          {/* Document Name */}
          <div className="space-y-1.5">
            <Label htmlFor="docName" className="text-xs font-medium text-slate-700">
              Document Title / Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="docName"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Master Site Plan Rev B"
              disabled={isUploading}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-slate-700">
              Document Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as CustomerDocumentCategory)}
              disabled={isUploading}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-medium text-slate-900">{opt.label}</span>
                      {opt.description && (
                        <span className="text-xs text-slate-400">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              Select the appropriate drawing or document classification (cannot be project lead type).
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-slate-700">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Updated site layout approved by civil engineer"
              disabled={isUploading}
              rows={2}
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  {uploadStep === "presigning" && "Requesting upload slot..."}
                  {uploadStep === "uploading" && "Uploading file to storage..."}
                  {uploadStep === "registering" && "Linking to customer profile..."}
                  {uploadStep === "done" && "Upload complete!"}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-blue-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1D51A4] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !docName.trim()}
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white min-w-28"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
