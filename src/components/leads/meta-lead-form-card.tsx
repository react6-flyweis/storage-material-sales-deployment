import { useMemo } from "react";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import ChannelBadge from "@/components/leads/channel-badge";
import {
  formatMetaFieldLabel,
  formatMetaFieldValue,
  isMappedMetaField,
} from "@/lib/chat-source";
import type { MetaLeadAd } from "@/modules/leads/leads.api";

type Props = {
  /** `data.metaLeadAd` from the lead detail API. */
  metaLeadAd?: MetaLeadAd | null;
  /** True when lead.source === "meta_lead_ads" (shows a note if form data is missing). */
  isMetaLead?: boolean;
  className?: string;
};

function formatSubmittedAt(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy h:mm a");
}

async function copyToClipboard(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

function MetaRow({ label, value, copyable }: { label: string; value?: string; copyable?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <span className="w-28 shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 break-all text-gray-900">{value || "—"}</span>
      {copyable && value ? (
        <button
          type="button"
          onClick={() => copyToClipboard(label, value)}
          className="ml-auto shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Copy ${label}`}
          title={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Meta (Facebook / Instagram) instant form answers.
 * Renders every `fieldData` row except keys the backend already maps onto
 * lead / customer columns (those appear in the regular contact / project cards).
 */
export default function MetaLeadFormCard({ metaLeadAd, isMetaLead, className }: Props) {
  const extraFields = useMemo(
    () =>
      (metaLeadAd?.fieldData ?? [])
        .filter((field) => field?.name && !isMappedMetaField(field.name))
        .map((field) => ({
          key: field.name,
          label: formatMetaFieldLabel(field.name),
          value: formatMetaFieldValue(field.values),
        })),
    [metaLeadAd],
  );

  if (!metaLeadAd) {
    if (!isMetaLead) return null;
    return (
      <div className={`rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-500 ${className ?? ""}`}>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Meta lead form</h3>
          <ChannelBadge source="facebook_lead_ad" />
        </div>
        Form data unavailable for this lead.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Meta lead form</h3>
        <ChannelBadge source="facebook_lead_ad" />
      </div>

      <div className="border-b border-gray-100 px-4 py-2">
        <MetaRow label="Submitted" value={formatSubmittedAt(metaLeadAd.submittedAt)} />
        <MetaRow label="Form ID" value={metaLeadAd.formId} copyable />
        <MetaRow label="Ad ID" value={metaLeadAd.adId} copyable />
      </div>

      <div className="px-4 py-2">
        {extraFields.length === 0 ? (
          <p className="py-1.5 text-sm text-gray-400">No additional answers</p>
        ) : (
          extraFields.map((field) => (
            <div key={field.key} className="flex items-start gap-3 py-1.5 text-sm">
              <span className="w-1/2 shrink-0 text-gray-500">{field.label}</span>
              <span className="min-w-0 whitespace-pre-wrap break-words text-gray-900">
                {field.value || "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
