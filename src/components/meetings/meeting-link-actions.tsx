import { Copy, ExternalLink, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  meetingLink?: string;
  /** Host start URL — staff only. */
  zoomStartUrl?: string;
  className?: string;
  /** Show the join URL as text above the buttons. */
  showLink?: boolean;
  /** Boxed link with full-width, secondary buttons (e.g. inside a dialog). */
  centered?: boolean;
  /** Keep the buttons side by side on one row (e.g. in a narrow card). */
  singleRow?: boolean;
};

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Meeting link copied");
  } catch {
    toast.error("Couldn't copy the link");
  }
}

/**
 * Staff actions for an online meeting: copy / open the join link and start
 * the Zoom meeting as host.
 */
export default function MeetingLinkActions({
  meetingLink,
  zoomStartUrl,
  className,
  showLink = false,
  centered = false,
  singleRow = false,
}: Props) {
  if (!meetingLink && !zoomStartUrl) return null;

  const buttonClass = singleRow
    ? "min-w-0 flex-auto shrink px-2 text-xs"
    : centered
      ? "h-9 flex-auto"
      : "";
  const iconClass = singleRow ? "size-3.5" : "size-4";

  return (
    // min-w-0: lets the link truncate instead of stretching a grid/flex parent.
    <div className={cn("min-w-0 space-y-2", className)}>
      {showLink && meetingLink ? (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block truncate text-sm text-blue-600 hover:underline",
            centered && "rounded-md border bg-slate-50 px-3 py-2",
          )}
          title={meetingLink}
        >
          {meetingLink}
        </a>
      ) : null}
      <div
        className={cn(
          "flex gap-2",
          !singleRow && "flex-wrap",
        )}
      >
        {zoomStartUrl ? (
          <Button
            type="button"
            size="sm"
            variant={centered ? "outline" : "default"}
            title="Start meeting (host)"
            className={cn(
              !centered && "bg-blue-600 text-white hover:bg-blue-700",
              buttonClass,
            )}
            onClick={() =>
              window.open(zoomStartUrl, "_blank", "noopener,noreferrer")
            }
          >
            <Play className={iconClass} />
            <span className="truncate">Start meeting (host)</span>
          </Button>
        ) : null}
        {meetingLink ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Copy join link"
              className={buttonClass}
              onClick={() => void copyToClipboard(meetingLink)}
            >
              <Copy className={iconClass} />
              <span className="truncate">Copy join link</span>
            </Button>
            {!zoomStartUrl ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Open link"
                className={buttonClass}
                onClick={() =>
                  window.open(meetingLink, "_blank", "noopener,noreferrer")
                }
              >
                <ExternalLink className={iconClass} />
                <span className="truncate">Open link</span>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
