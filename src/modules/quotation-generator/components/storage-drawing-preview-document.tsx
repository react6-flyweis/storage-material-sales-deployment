import React from "react";
import { cn } from "@/lib/utils";

export interface StorageDrawingItem {
  name?: string;
  data?: string;
  includeInPackage?: boolean;
  fileBase64?: string;
}

export interface StorageDrawingPreviewDocumentProps {
  className?: string;
  id?: string;
  drawing?: StorageDrawingItem;
  drawingIndex?: number;
  totalDrawings?: number;
  customerLeadName?: string;
  customerAddress?: string;
  jobNumber?: string;
  quoteDate?: string;
}

function getImageSrc(data?: string, name?: string): string {
  if (!data) return "";
  if (data.startsWith("data:")) return data;
  const fileName = name || "";
  if (/\.svg$/i.test(fileName)) return `data:image/svg+xml;base64,${data}`;
  if (/\.jpe?g$/i.test(fileName)) return `data:image/jpeg;base64,${data}`;
  if (/\.webp$/i.test(fileName)) return `data:image/webp;base64,${data}`;
  return `data:image/png;base64,${data}`;
}

export const StorageDrawingPreviewDocument = React.forwardRef<
  HTMLDivElement,
  StorageDrawingPreviewDocumentProps
>(function StorageDrawingPreviewDocument(props, ref) {
  const {
    className,
    id,
    drawing,
    drawingIndex,
    totalDrawings,
    customerLeadName = "Valued Customer",
    customerAddress = "Project Location",
    jobNumber = "8098",
    quoteDate: customDate,
  } = props;

  const effectiveDate =
    customDate ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const rawData = drawing?.data || drawing?.fileBase64 || "";
  const fileName = drawing?.name || "";

  const isImage =
    rawData.startsWith("data:image") ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);
  const isPdf =
    rawData.startsWith("data:application/pdf") ||
    /\.pdf$/i.test(fileName);

  const imgSrc = isImage ? getImageSrc(rawData, fileName) : "";

  return (
    <div
      ref={ref}
      id={id || `storage-drawing-preview-document${drawingIndex ? `-${drawingIndex}` : ""}`}
      className={cn(
        "p-6 md:p-8 bg-white border border-slate-200 shadow-2xs rounded-xl space-y-6 text-slate-800 font-sans print-card min-h-[750px] flex flex-col justify-between print:break-before-page",
        className
      )}
    >
      {/* Top Header - Matching standard Storage Preview document header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-[#1e3a8a]">
        <div>
          <div className="flex items-center gap-1 font-extrabold text-xl md:text-2xl tracking-tight">
            <span className="text-slate-900 font-black">STORAGE</span>
            <span className="bg-[#2176c7] text-white px-2.5 py-0.5 rounded font-black tracking-wide">
              MATERIALS
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
            1851 Madison Ave Suite 300, Council Bluffs, IA 51503 - (888) 968-1222
          </p>
        </div>

        <div className="text-right text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            ESTIMATE
          </h3>
          <p className="text-slate-600 mt-1 text-[11px]">Date: {effectiveDate}</p>
          <p className="text-slate-600 text-[11px]">Job #: {jobNumber}</p>
          {customerLeadName && (
            <p className="text-slate-600 text-[11px] font-semibold truncate max-w-[220px]" title={customerLeadName}>
              Customer: {customerLeadName}
            </p>
          )}
          {customerAddress && customerAddress !== "Project Location" && (
            <p className="text-slate-500 text-[10px] truncate max-w-[220px]" title={customerAddress}>
              {customerAddress}
            </p>
          )}
        </div>
      </div>


      {/* Subtitle / Heading */}
      <div className="text-center pt-2">
        <h2 className="text-sm md:text-base font-bold text-[#1e3a8a] tracking-wide">
          Building Drawings & Plans
        </h2>
        {totalDrawings && totalDrawings > 1 && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Drawing {drawingIndex} of {totalDrawings}
          </p>
        )}
      </div>

      {/* Drawing Body Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full max-w-3xl border border-slate-200/80 bg-slate-50/40 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-xs">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={fileName || "Building Drawing"}
              className="max-h-[520px] w-auto max-w-full object-contain rounded-lg shadow-2xs"
            />
          ) : isPdf ? (
            <object
              data={rawData.startsWith("data:") ? rawData : `data:application/pdf;base64,${rawData}`}
              type="application/pdf"
              className="w-full h-[520px] rounded-lg border border-slate-200"
            >
              <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center text-slate-600">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl mb-2">
                  📄
                </div>
                <span className="text-sm font-bold">{fileName || "PDF Drawing attached"}</span>
                <span className="text-xs text-slate-500 mt-1">
                  PDF layout plan included in final output
                </span>
              </div>
            </object>
          ) : rawData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-600">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl mb-2">
                📄
              </div>
              <span className="text-sm font-bold">{fileName || "Drawing Document"}</span>
              <span className="text-xs text-slate-500 mt-1">
                Document attached to final quotation package
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-2xl mb-2">
                📐
              </div>
              <span className="text-xs font-bold text-slate-600">No Drawing Attached</span>
              <span className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Upload layout plans or elevations using the file box above to display here.
              </span>
            </div>
          )}

          {fileName && (
            <p className="text-xs text-slate-400 font-mono mt-3 text-center">
              {fileName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
