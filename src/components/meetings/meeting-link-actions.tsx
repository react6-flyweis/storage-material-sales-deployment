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
}: Props) {
  if (!meetingLink && !zoomStartUrl) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {showLink && meetingLink ? (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm text-blue-600 hover:underline"
          title={meetingLink}
        >
          {meetingLink}
        </a>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {zoomStartUrl ? (
          <Button
            type="button"
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              window.open(zoomStartUrl, "_blank", "noopener,noreferrer")
            }
          >
            <Play className="h-4 w-4 mr-1.5" />
            Start meeting (host)
          </Button>
        ) : null}
        {meetingLink ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyToClipboard(meetingLink)}
            >
              <Copy className="h-4 w-4 mr-1.5" />
              Copy join link
            </Button>
            {!zoomStartUrl ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  window.open(meetingLink, "_blank", "noopener,noreferrer")
                }
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Open link
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
