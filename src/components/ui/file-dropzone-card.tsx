import { useState } from "react";
import { Upload, X, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileItem {
  name: string;
  size: string;
}

export interface FileDropzoneCardProps {
  title?: string;
  description?: string;
  dropText: string;
  subDropText?: string;
  extraInfoText?: string;
  accept: string;
  fileTypeLabel?: string;
  fileIcon?: "pdf" | "xlsx";
  selectedFile: FileItem | null;
  onFileSelect: (file: FileItem | null) => void;
  className?: string;
}

export function FileDropzoneCard({
  title,
  description,
  dropText,
  subDropText,
  extraInfoText,
  accept,
  fileTypeLabel,
  fileIcon = "pdf",
  selectedFile,
  onFileSelect,
  className,
}: FileDropzoneCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
      });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}

      {/* Drag & Drop Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-100/60"
            : "border-blue-300 bg-[#F5F8FF] hover:bg-blue-50/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-xs">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">{dropText}</p>
        {subDropText && (
          <p className="text-xs text-slate-500 mt-1">{subDropText}</p>
        )}
        {extraInfoText && (
          <p className="text-[11px] text-slate-400 mt-1">{extraInfoText}</p>
        )}
      </label>

      {fileTypeLabel && (
        <p className="text-xs text-slate-400">{fileTypeLabel}</p>
      )}

      {/* Uploaded File Chip / Item */}
      {selectedFile && (
        <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 max-w-sm bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            {fileIcon === "pdf" ? (
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                PDF
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile.size}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
