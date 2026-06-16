import { useState } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract error information
  let errorMessage = "An unexpected error has occurred.";
  let errorStatus: number | string = "Error";
  let errorStack: string | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || JSON.stringify(error.data) || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object") {
    errorMessage = "message" in error && typeof (error as Record<string, unknown>).message === "string"
      ? (error as Record<string, string>).message
      : JSON.stringify(error);
  }

  const handleCopy = async () => {
    const detailString = JSON.stringify(
      {
        status: errorStatus,
        message: errorMessage,
        stack: errorStack,
        raw: error,
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(detailString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground font-sans p-6">
      {/* Decorative background gradients matching theme */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-md space-y-6 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <AlertCircle className="size-10" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            We ran into a minor hiccup. Try refreshing the page. If the error persists, don't worry—we've automatically sent the details to our support team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-5"
          >
            <RefreshCw className="size-4 mr-2" />
            Reload Page
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-accent font-medium py-5"
          >
            <Home className="size-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Expandable Technical Details */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <span>Diagnostics info</span>
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-3 text-left space-y-2 animate-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">Error Code: {errorStatus}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              <pre className="max-h-32 overflow-y-auto bg-muted rounded p-3 font-mono text-[10px] text-muted-foreground thin-scrollbar whitespace-pre-wrap select-all">
                {errorMessage}
                {errorStack && `\n\nStack:\n${errorStack}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
