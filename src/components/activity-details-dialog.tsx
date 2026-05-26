import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsDialog({
  open,
  onOpenChange,
}: ActivityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-lg">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-[15px] font-semibold text-[#1a1a1a]">
            Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0 overflow-y-auto max-h-[85vh] thin-scrollbar">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white">
                <Phone className="w-5 h-5 fill-current" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Phone Call
              </h3>
            </div>
            <Badge className="bg-[#dcfce7] text-[#059669] hover:bg-[#dcfce7] pointer-events-none border-none px-2 py-0.5 rounded-[4px] font-normal text-xs">
              Completed
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-[140px_1fr] gap-y-4 mb-8 text-[14px]">
            <div className="text-gray-700">Date & Time</div>
            <div className="text-gray-900 font-medium tracking-tight">
              May 19,2025 03:45
            </div>

            <div className="text-gray-700">Follow up by</div>
            <div className="text-gray-900 font-medium tracking-tight">
              John Smith (Sales Executive)
            </div>

            <div className="text-gray-700">Department</div>
            <div className="text-gray-900 font-medium tracking-tight">
              Sales
            </div>

            <div className="text-gray-700">Outcome</div>
            <div className="text-gray-900 font-medium tracking-tight">
              Positive
            </div>

            <div className="text-gray-700">Next Follow up</div>
            <div className="text-gray-900 font-medium tracking-tight">
              May 22, 2025 11:00 AM
            </div>

            <div className="text-gray-700">Duration</div>
            <div className="text-gray-900 font-medium tracking-tight">
              25 mins
            </div>

            <div className="text-gray-700">Related to</div>
            <div className="text-gray-900 font-medium tracking-tight">
              Lead Follow up
            </div>
          </div>

          {/* Text Blocks */}
          <div className="space-y-6 mb-8">
            <div>
              <h4 className="text-[14px] font-medium text-gray-900 mb-1.5">
                Description
              </h4>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[95%]">
                Discussed requirement for structural steel supply for their
                upcoming commercial building
              </p>
            </div>

            <div>
              <h4 className="text-[14px] font-medium text-gray-900 mb-1.5">
                Client Response
              </h4>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[95%]">
                Discussed requirement for structural steel supply for their
                upcoming commercial building
              </p>
            </div>

            <div>
              <h4 className="text-[14px] font-medium text-gray-900 mb-1.5">
                Remarks/Notes (Internal)
              </h4>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[95%]">
                Discussed requirement for structural steel supply for their
                upcoming commercial building
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-8">
            <h4 className="text-[14px] font-medium text-gray-900 mb-3">
              Attachments
            </h4>
            <div className="flex items-center justify-between p-1">
              <div className="flex items-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#F43F5E"
                  />
                  <path d="M14 2V8H20" fill="#E11D48" />
                  <path
                    d="M9.5 14.5C9.5 14.5 10.5 13.5 11 13.5C11.5 13.5 12 14.5 12 14.5C12 14.5 13 14 13.5 14C14 14 14.5 14.5 14.5 14.5C14.5 14.5 15 16.5 13.5 16.5C12 16.5 11.5 16 11.5 16C11.5 16 10.5 16.5 9.5 16.5C8.5 16.5 9.5 14.5 9.5 14.5Z"
                    fill="white"
                  />
                </svg>
                <a
                  href="#"
                  className="text-[14px] font-medium text-[#2563eb] hover:underline"
                >
                  Project Requirement.PDF
                </a>
              </div>
              <Button size="icon" variant="ghost">
                <Download className="" />
              </Button>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="grid grid-cols-[140px_1fr] text-[14px]">
            <div className="text-gray-700">Created On</div>
            <div className="text-gray-900 font-medium tracking-tight">
              May 19,2026 03.05PM
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
