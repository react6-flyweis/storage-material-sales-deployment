import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LEAD_LIFECYCLE_STEPS,
  getLeadLifecycleStepId,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lifecycle-statuses";
import type { LeadDetailLead } from "src/modules/leads/leads.api";

const progressSteps = LEAD_LIFECYCLE_STEPS;

export default function TimelineCard({ lead }: { lead: LeadDetailLead }) {
  const progress = getLeadLifecycleStepId(lead.lifecycleStatus ?? "");
  return (
    <Card className="flex flex-col gap-6 p-6">
      <div>
        <div className="text-sm text-gray-500">
          {/* Lead ID- */}
          <span className="font-semibold">{lead.jobId}</span>
        </div>
      </div>

      <h4 className="text-sm font-medium text-gray-900">Progress Steps</h4>
      <div className="">
        <div className="space-y-3">
          {progressSteps.map((step) => {
            const idx = step.id;
            const progress = getLeadLifecycleStepId(lead.lifecycleStatus ?? "");
            const completed = idx <= progress;
            const isCurrent =
              idx === progress + 1 && progress < progressSteps.length;
            return (
              <div
                key={step.value}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      completed
                        ? "bg-green-600 text-white"
                        : isCurrent
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{idx}</span>
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-sm ${
                        completed
                          ? "text-green-800"
                          : isCurrent
                            ? "text-blue-700 font-semibold"
                            : "text-gray-700"
                      }`}
                    >
                      {getLeadLifecycleStatusLabel(step.value)}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-gray-500">Current Step</div>
                    )}
                  </div>
                </div>
                {completed && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 text-xs text-gray-500 border-t">
          {(() => {
            const completedCount = Math.max(0, progress);
            const currentIndex =
              completedCount >= progressSteps.length
                ? progressSteps.length
                : completedCount + 1;
            return `Progress: Step ${currentIndex} of ${progressSteps.length}`;
          })()}
        </div>
      </div>
    </Card>
  );
}
