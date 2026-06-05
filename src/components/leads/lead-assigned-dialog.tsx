import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, MapPin, Building, DollarSign, Award, Mail, User } from "lucide-react";
import { LEAD_NO_NAME } from "@/modules/leads/leads.utils";
import {
  getLeadLifecycleBadgeClassName,
  getLeadLifecycleBadgeDotClassName,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lifecycle-statuses";

interface CustomerId {
  _id: string;
  firstName: string;
  email: string;
  name?: string;
}

interface LeadScoring {
  score: number;
}

interface LeadDetails {
  _id: string;
  projectName?: string;
  customerId?: CustomerId | null;
  lifecycleStatus?: string;
  quoteValue?: number;
  leadScoring?: LeadScoring;
  buildingType?: string;
  location?: string;
  isRaisedToPO?: boolean;
  nextFollowUp?: string | null;
  jobId?: string;
  projectId?: string;
}

interface LeadListSocketPayload {
  leadId: string;
  lead: LeadDetails;
  scoreRow?: Record<string, unknown> | null;
  meta: {
    action: "created" | "updated";
    trigger: string;
  };
}

interface LeadAssignedDialogProps {
  open: boolean;
  onClose: () => void;
  leadPayload: LeadListSocketPayload;
  onViewDetails: () => void;
}

export default function LeadAssignedDialog({
  open,
  onClose,
  leadPayload,
  onViewDetails,
}: LeadAssignedDialogProps) {
  const lead = leadPayload?.lead;
  if (!lead) return null;

  const projectName = lead.projectName || LEAD_NO_NAME;
  const customerName = lead.customerId?.name || lead.customerId?.firstName || "Unknown Customer";
  const customerEmail = lead.customerId?.email || "No email available";

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-md rounded-2xl p-6 text-left shadow-xl border border-slate-100">
        <DialogHeader className="flex flex-row items-center gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              New Lead Assigned
            </DialogTitle>
            <p className="text-sm text-slate-500">
              A new lead has been assigned to your pipeline
            </p>
          </div>
        </DialogHeader>

        {/* Lead Summary Info Card */}
        <div className="mb-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-100/50">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Project / Lead
          </div>
          <h4 className="text-lg font-bold text-slate-900 leading-snug">
            {projectName}
          </h4>
        </div>

        {/* Lead Details Grid */}
        <div className="space-y-4 mb-6 text-sm">
          {/* Customer info */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-slate-800">{customerName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3 w-3" />
                {customerEmail}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Location & Building Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Location</div>
                <div className="font-medium text-slate-800 truncate">
                  {lead.location || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Building Type</div>
                <div className="font-medium text-slate-800 truncate font-mono">
                  {lead.buildingType || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Quote & Score Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <DollarSign className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Quote Value</div>
                <div className="font-semibold text-emerald-600">
                  {formatCurrency(lead.quoteValue)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Lead Score</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  {lead.leadScoring?.score !== undefined ? (
                    <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-700 font-medium px-2 py-0 border-none rounded-md text-xs">
                      {lead.leadScoring.score}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {lead.lifecycleStatus && (
            <>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Lifecycle Status</span>
                <Badge className={`inline-flex items-center px-2 py-0.5 text-[12px] font-medium border-none hover:opacity-90 ${getLeadLifecycleBadgeClassName(lead.lifecycleStatus)}`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getLeadLifecycleBadgeDotClassName(lead.lifecycleStatus)}`}></span>
                  {getLeadLifecycleStatusLabel(lead.lifecycleStatus)}
                </Badge>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100 pt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-28">
              Dismiss
            </Button>
          </DialogClose>
          <Button onClick={onViewDetails} className="w-full sm:w-32 bg-blue-600 hover:bg-blue-700 text-white">
            View Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
