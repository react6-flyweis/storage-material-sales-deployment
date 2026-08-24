import { cn } from "@/lib/utils";

export interface TotalProjectInvestmentBannerProps {
  title?: string;
  totalFormatted: string;
  subtitle?: string;
  className?: string;
}

export function TotalProjectInvestmentBanner({
  title = "TOTAL PROJECT INVESTMENT",
  totalFormatted,
  subtitle,
  className,
}: TotalProjectInvestmentBannerProps) {
  return (
    <div
      className={cn(
        "bg-[#1E3A8A] text-white rounded-xl p-6 text-center shadow-xs space-y-1",
        className
      )}
    >
      <div className="text-[11px] font-bold tracking-widest text-blue-200 uppercase">
        {title}
      </div>
      <div className="text-3xl md:text-4xl font-extrabold">{totalFormatted}</div>
      {subtitle && (
        <div className="text-xs text-blue-200 font-medium uppercase">
          {subtitle}
        </div>
      )}
    </div>
  );
}
