import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderUp, XCircle } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  supportText?: string;
  accept?: string;
  maxFiles?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  onUpload?: (files: File[]) => void;
};

export function UploadFileDialog({
  title = "Upload File",
  description = "Add your documents here.",
  supportText = "Only support .jpg, .png and .svg and zip files",
  accept = "*",
  maxFiles = 5,
  open: controlledOpen,
  onOpenChange,
  children,
  onUpload,
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const newFiles = Array.from(list);
    setFiles((s) => [...s, ...newFiles].slice(0, maxFiles));
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const list = e.dataTransfer?.files;
    if (!list) return;
    const newFiles = Array.from(list);
    setFiles((s) => [...s, ...newFiles].slice(0, maxFiles));
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = () => {
    if (files.length && onUpload) {
      onUpload(files);
    }
    setFiles([]);
    setOpen(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-lg p-6 gap-0">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-[20px] font-semibold text-slate-900 border-none">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-slate-500 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <label
            className="block"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={`border-2 border-dashed rounded-[12px] p-6 text-center hover:bg-slate-50 relative transition-colors ${
                isDragging
                  ? "border-[#1D51A4] bg-blue-50/50"
                  : "border-blue-300 bg-white"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center justify-center gap-3 relative z-10 py-2">
                <div className="w-12 h-12 rounded-[10px] bg-[#2563EB] flex items-center justify-center mb-1">
                  <FolderUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-slate-800 text-[15px] font-medium">
                  Drag your file(s) to start uploading
                </div>

                <div className="flex items-center w-3/4 max-w-[200px] my-1">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-slate-400 text-[12px] px-3">OR</span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                <div>
                  <Button
                    variant="outline"
                    className="border-[#2563EB] text-[#2563EB] hover:bg-blue-50 h-9 px-6 rounded-[8px]"
                  >
                    Browse files
                  </Button>
                </div>
              </div>
            </div>
          </label>
        </div>

        <div className="text-[13px] text-slate-500 mb-4">{supportText}</div>

        {files.length > 0 && (
          <div className="space-y-3 mb-6 max-h-[160px] overflow-y-auto pr-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-[10px] bg-white border-slate-200"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#EF4444] rounded-[8px] flex flex-col items-center justify-center text-white font-bold text-[10px]">
                    PDF
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[14px] font-medium text-slate-800 truncate">
                      {f.name}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {formatSize(f.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setFiles((s) => s.filter((_, idx) => idx !== i))
                  }
                  className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0"
                  type="button"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-2 sm:justify-end gap-3 flex-row justify-end">
          <Button
            variant="outline"
            className="rounded-[8px] min-w-[100px] border-slate-200"
            onClick={() => {
              setFiles([]);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="rounded-[8px] min-w-[100px] bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            onClick={handleUpload}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
