import { useMemo } from "react";
import { format } from "date-fns";
import { ClipboardList, Copy } from "lucide-react";
import { toast } from "sonner";
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
};

// Same tile / card styles as the "Project Specifications" card.
const CARD_CLASS = "bg-white rounded-xl border border-gray-100 shadow-sm p-6";
const TILE_CLASS = "px-4 py-3 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]";

function formatSubmittedAt(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
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

function CardTitle() {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-7 h-7 rounded-md bg-[#EEF0FF] flex items-center justify-center text-[#4F46E5]">
        <ClipboardList className="w-4 h-4" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">Meta Lead Form</h3>
    </div>
  );
}

function MetaTile({ label, value, copyable }: { label: string; value?: string; copyable?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${TILE_CLASS}`}>
      <span className="text-sm text-gray-600 shrink-0">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-sm font-bold text-gray-900" title={value}>
          {value || "N/A"}
        </span>
        {copyable && value ? (
          <button
            type="button"
            onClick={() => copyToClipboard(label, value)}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </span>
    </div>
  );
}

/**
 * Meta (Facebook / Instagram) instant form answers.
 * Renders every `fieldData` row except keys the backend already maps onto
 * lead / customer columns (those appear in the regular contact / project cards).
 */
export default function MetaLeadFormCard({ metaLeadAd, isMetaLead }: Props) {
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
      <div className={CARD_CLASS} data-tour="lead-meta-form-card">
        <CardTitle />
        <p className="text-sm text-gray-500">Form data unavailable for this lead.</p>
      </div>
    );
  }

  return (
    <div className={CARD_CLASS} data-tour="lead-meta-form-card">
      <CardTitle />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <MetaTile label="Submitted" value={formatSubmittedAt(metaLeadAd.submittedAt)} />
        <MetaTile label="Form ID" value={metaLeadAd.formId} copyable />
        <MetaTile label="Ad ID" value={metaLeadAd.adId} copyable />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Form Answers</h4>
        {extraFields.length === 0 ? (
          <p className="text-sm text-gray-500">No additional answers</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {extraFields.map((field) => (
              <div key={field.key} className={`flex flex-col gap-1 ${TILE_CLASS}`}>
                <span className="text-sm text-gray-600">{field.label}</span>
                <span className="whitespace-pre-wrap break-words text-sm font-bold text-gray-900">
                  {field.value || "N/A"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
