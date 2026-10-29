import type { QuotationWorkflowStatus } from "../quotations.api";
import { getWorkflowStatusConfig } from "../quotations.utils";

export interface QuotationWorkflowBadgeProps {
  status?: QuotationWorkflowStatus | string | null;
  className?: string;
  showDot?: boolean;
  showIcon?: boolean;
}

export function QuotationWorkflowBadge({
  status,
  className = "",
  showDot = false,
  showIcon = false,
}: QuotationWorkflowBadgeProps) {
  const config = getWorkflowStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      )}
      {showIcon && config.iconText && <span>{config.iconText}</span>}
      {config.label}
    </span>
  );
}

export default QuotationWorkflowBadge;

