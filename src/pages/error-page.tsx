import { Component, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title?: string;
  description?: string;
  errorMessage?: string;
  errorStatus?: number | string;
  errorStack?: string;
  eventId?: string | null;
  onReload: () => void;
  onGoHome: () => void;
  onReportIssue?: () => void;
}

export function ErrorView({
  title = "Something went wrong",
  description = "We ran into a minor hiccup. Try refreshing the page. If the error persists, don't worry—we've automatically sent the details to our support team.",
  errorMessage,
  errorStatus,
  errorStack,
  eventId,
  onReload,
  onGoHome,
  onReportIssue,
}: ErrorViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const detailString = JSON.stringify(
      {
        status: errorStatus,
        message: errorMessage,
        stack: errorStack,
        eventId: eventId,
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
            {title}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={onReload}
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-5 cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="size-4" />
            Reload Page
          </Button>

          <div className="flex gap-2 w-full">
            <Button
              onClick={onGoHome}
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent font-medium py-5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="size-4" />
              Dashboard
            </Button>

            {eventId && onReportIssue && (
              <Button
                onClick={onReportIssue}
                className="flex-1 bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-medium py-5 cursor-pointer flex items-center justify-center gap-2"
              >
                Report Issue
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Technical Details */}
        {(errorMessage || errorStack || eventId) && (
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
            >
              <span>Diagnostics info</span>
              {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 text-left space-y-2 animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {errorStatus ? `Error Code: ${errorStatus}` : eventId ? `Event ID: ${eventId}` : "Error Details"}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono cursor-pointer"
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
                  {eventId && `\n\nSentry Event ID:\n${eventId}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  eventId: string | null;
  onReset?: () => void;
}

export function ErrorBoundaryFallback({ error, eventId, onReset }: ErrorBoundaryFallbackProps) {
  const handleReload = () => {
    if (onReset) onReset();
    window.location.reload();
  };

  const handleGoHome = () => {
    if (onReset) onReset();
    window.location.href = "/";
  };

  const handleReportIssue = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  return (
    <ErrorView
      errorMessage={error?.message || "Unknown rendering error"}
      errorStatus={error?.name || "Error"}
      errorStack={error?.stack}
      eventId={eventId}
      onReload={handleReload}
      onGoHome={handleGoHome}
      onReportIssue={handleReportIssue}
    />
  );
}

class RouterErrorBoundaryInner extends Component<{ error: unknown }, { eventId: string | null }> {
  public state = { eventId: null as string | null };

  public componentDidMount() {
    const errorObject = this.props.error instanceof Error ? this.props.error : new Error(String(this.props.error));
    const eventId = Sentry.captureException(errorObject);
    this.setState({ eventId });
  }

  public render() {
    const { error } = this.props;

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

    const handleReload = () => {
      window.location.reload();
    };

    const handleGoHome = () => {
      window.location.href = "/";
    };

    const handleReportIssue = () => {
      if (this.state.eventId) {
        Sentry.showReportDialog({ eventId: this.state.eventId });
      }
    };

    return (
      <ErrorView
        errorMessage={errorMessage}
        errorStatus={errorStatus}
        errorStack={errorStack}
        eventId={this.state.eventId}
        onReload={handleReload}
        onGoHome={handleGoHome}
        onReportIssue={handleReportIssue}
      />
    );
  }
}

export function RouterErrorFallback() {
  const error = useRouteError();
  return <RouterErrorBoundaryInner error={error} />;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = Sentry.captureException(error, { extra: { errorInfo } });
    this.setState({ eventId });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          eventId={this.state.eventId}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

