import { getLeadProgress, LEAD_TOTAL_STEPS } from "@/modules/leads/leads.utils";

type ProgressDotsProps = {
  // either pass a numeric progress or the raw lifecycle status
  progress?: number;
  rawStatus?: string;
};

const DOT_COUNT = Math.ceil(LEAD_TOTAL_STEPS / 2); // one dot represents two progress units

export default function ProgressDots({
  progress,
  rawStatus,
}: ProgressDotsProps) {
  const progressNumber =
    typeof progress === "number" ? progress : getLeadProgress(rawStatus ?? "");

  const filled = Math.ceil(progressNumber / 2);
  const stepText = `Step ${Math.min(progressNumber, 8)}/8`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < filled ? "bg-green-500" : "bg-gray-300"}`}
          />
        ))}
      </div>
      <a className="text-sm text-blue-600" href="#">
        {stepText}
      </a>
    </div>
  );
}
