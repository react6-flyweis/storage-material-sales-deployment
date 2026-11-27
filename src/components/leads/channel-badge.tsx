import { ClipboardList, Globe, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageSource } from "@/lib/chat-source";

const STYLES: Record<MessageSource, { label: string; className: string; Icon: typeof Globe }> = {
  facebook: {
    label: "Facebook",
    className: "bg-[#E7F0FF] text-[#1877F2] border-[#C9DCFB]",
    Icon: MessageCircle,
  },
  website: {
    label: "Website",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    Icon: Globe,
  },
  phone: {
    label: "Phone",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: Phone,
  },
  facebook_lead_ad: {
    label: "Meta lead ad",
    className: "bg-[#EEF0FF] text-[#4F46E5] border-[#D6D9FB]",
    Icon: ClipboardList,
  },
};

type Props = {
  source: MessageSource;
  /** Override the visible text (e.g. "Facebook Messenger"). */
  label?: string;
  size?: "xs" | "sm";
  className?: string;
};

export default function ChannelBadge({ source, label, size = "xs", className }: Props) {
  const style = STYLES[source] ?? STYLES.website;
  const Icon = style.Icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        style.className,
        className,
      )}
    >
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {label ?? style.label}
    </span>
  );
}
