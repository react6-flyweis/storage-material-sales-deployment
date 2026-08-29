import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { Loader2, AlertCircle, RefreshCw, Printer, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ServerDocumentPreviewRef {
  print: () => void;
  openInNewTab: () => void;
  getIframe: () => HTMLIFrameElement | null;
}

export interface ServerDocumentPreviewProps {
  html?: string | null;
  isLoading?: boolean;
  error?: string | Error | null;
  onRetry?: () => void;
  title?: string;
  minHeight?: string | number;
  className?: string;
  showToolbar?: boolean;
  id?: string;
}

export const ServerDocumentPreview = React.forwardRef<
  ServerDocumentPreviewRef,
  ServerDocumentPreviewProps
>(function ServerDocumentPreview(
  {
    html,
    isLoading = false,
    error = null,
    onRetry,
    title,
    minHeight = 700,
    className,
    showToolbar = false,
    id,
  },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number | string>(minHeight);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const errorMessage =
    typeof error === "string" ? error : error?.message || null;

  // Auto-measure iframe content height whenever html changes
  const updateIframeHeight = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

      const doc = iframe.contentDocument;
      const body = doc.body;
      const htmlEl = doc.documentElement;

      if (!body && !htmlEl) return;

      const scrollHeight = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        htmlEl ? htmlEl.clientHeight : 0,
        htmlEl ? htmlEl.scrollHeight : 0,
        htmlEl ? htmlEl.offsetHeight : 0
      );

      if (scrollHeight > 100) {
        setIframeHeight(scrollHeight + 40);
      }
    } catch {
      // If cross-origin or measurement issue, maintain fallback height
    }
  };

  useEffect(() => {
    if (html && !isLoading && !errorMessage) {
      // Delay measurement slightly to allow CSS/fonts/images to layout
      const timer1 = setTimeout(updateIframeHeight, 100);
      const timer2 = setTimeout(updateIframeHeight, 500);
      const timer3 = setTimeout(updateIframeHeight, 1500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [html, isLoading, errorMessage]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err) {
        console.warn("Direct iframe print failed, fallback to window.print:", err);
      }
    }
    window.print();
  };

  const handleOpenInNewTab = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  useImperativeHandle(ref, () => ({
    print: handlePrint,
    openInNewTab: handleOpenInNewTab,
    getIframe: () => iframeRef.current,
  }));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card
      ref={containerRef}
      id={id}
      className={cn(
        "relative overflow-hidden bg-white border border-slate-200 shadow-sm transition-all pt-0  rounded-xl",
        isFullscreen
          ? "fixed inset-4 z-50 shadow-2xl flex flex-col p-4 bg-slate-100"
          : "w-full",
        className
      )}
    >
      {/* Top Document Header Bar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              {title || "Server Document Preview"}
            </span>
            {isLoading && (
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 ml-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Rendering from server...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onRetry && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
                title="Refresh server preview"
                className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 cursor-pointer"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </Button>
            )}

            {html && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  title="Open preview in new tab"
                  className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1">Open Tab</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  title="Print this preview"
                  className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1">Print</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                  className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content Container */}
      <div
        className={cn(
          "relative w-full bg-white transition-all",
          isFullscreen ? "flex-1 overflow-auto p-4 bg-slate-100 flex justify-center" : ""
        )}
      >
        {/* Loading Overlay State */}
        {isLoading && !html && (
          <div
            style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
            className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/70"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 animate-bounce">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Generating Server Preview
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Rendering official quotation layout and styling directly from the backend server...
            </p>
          </div>
        )}

        {/* Error State (No fallback on local preview) */}
        {!isLoading && errorMessage && (
          <div
            style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
            className="flex flex-col items-center justify-center p-12 text-center bg-rose-50/40 border border-rose-200 m-4 rounded-xl"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-rose-900">
              Failed to Load Server Preview
            </h4>
            <p className="text-xs text-rose-700 mt-1 max-w-md">
              {errorMessage}
            </p>
            {onRetry && (
              <Button
                type="button"
                onClick={onRetry}
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Server Preview
              </Button>
            )}
          </div>
        )}

        {/* Empty State when no HTML and no error */}
        {!isLoading && !errorMessage && !html && (
          <div
            style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
            className="flex flex-col items-center justify-center p-12 text-center bg-slate-50"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No Document Preview Available
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Calculate estimate pricing or select an estimate from the list to view its server preview.
            </p>
            {onRetry && (
              <Button
                type="button"
                onClick={onRetry}
                className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Load Preview
              </Button>
            )}
          </div>
        )}

        {/* Rendered HTML via Iframe for full CSS isolation and print styling */}
        {html && (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title={title || "Server Document Preview"}
            onLoad={updateIframeHeight}
            className={cn(
              "w-full border-0 transition-opacity duration-200 block",
              isLoading ? "opacity-40" : "opacity-100",
              isFullscreen ? "max-w-5xl shadow-lg bg-white rounded-lg" : ""
            )}
            style={{
              height: iframeHeight,
              minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            }}
          />
        )}
      </div>
    </Card>
  );
});

export default ServerDocumentPreview;
