import axios from "axios";
import { AlertTriangle, ArrowLeft, Lock, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

export type LeadDetailsErrorKind = "not_found" | "forbidden" | "error";

/** HTTP status of a failed request, if any. */
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * Classify a failed lead-detail load.
 * - 404, or 400 (malformed / unknown id), or a success response without a lead → not found
 * - 403 → no access (e.g. sales user not assigned to this lead)
 * - anything else (5xx, network) → generic error with retry
 */
export function getLeadDetailsErrorKind(error: unknown): LeadDetailsErrorKind {
  const status = getErrorStatus(error);
  if (status === 404 || status === 400) return "not_found";
  if (status === 403) return "forbidden";
  return "error";
}

/** React Query `retry` option: never retry 4xx (not found / no access); retry others once. */
export function retryUnlessClientError(failureCount: number, error: unknown) {
  const status = getErrorStatus(error);
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 1;
}

const CONTENT: Record<
  LeadDetailsErrorKind,
  { title: string; description: string; Icon: typeof SearchX; iconClassName: string }
> = {
  not_found: {
    title: "Lead not found",
    description:
      "This lead doesn't exist or may have been deleted. Check the link or go back to the leads list.",
    Icon: SearchX,
    iconClassName: "bg-slate-100 text-slate-500",
  },
  forbidden: {
    title: "You don't have access to this lead",
    description:
      "You don't have permission to view this lead, or it isn't assigned to you. Ask an admin if you need access.",
    Icon: Lock,
    iconClassName: "bg-amber-50 text-amber-600",
  },
  error: {
    title: "Couldn't load lead details",
    description: "Something went wrong while loading this lead.",
    Icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-500",
  },
};

type Props = {
  kind: LeadDetailsErrorKind;
  /** The request error — its API message is shown for generic errors. */
  error?: unknown;
  leadId?: string;
  onBack: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  backLabel?: string;
};

export default function LeadDetailsErrorState({
  kind,
  error,
  leadId,
  onBack,
  onRetry,
  isRetrying,
  backLabel = "Back to leads",
}: Props) {
  const { title, description, Icon, iconClassName } = CONTENT[kind];
  const detail =
    kind === "error" && error ? getApiErrorMessage(error, description) : description;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6" role="alert">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{detail}</p>
        {leadId ? (
          <p className="mt-1 break-all text-xs text-gray-400">Lead ID: {leadId}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
          {kind === "error" && onRetry ? (
            <Button onClick={onRetry} disabled={isRetrying}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying…" : "Try again"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
