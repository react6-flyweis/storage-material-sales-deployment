import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  FileText,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SuccessDialog from "@/components/success-dialog";
import UpdateStatusDialog from "./update-status-dialog";
import { AddNotesDialog, type AddNotesFormValues } from "./add-notes-dialog";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";

const quickActionButtons = [
  { label: "View Quotation", path: "project-quotation" },
  { label: "View Agreement", path: "contracts/1" },
  { label: "View Invoices", path: "project-invoices" },
  { label: "View Payments", path: "project-payments" },
];

const lifecycleSteps = [
  { id: 1, label: "Released\nto plant", date: "24-10-10" },
  { id: 2, label: "Drawings\nReceived", date: "24-10-10" },
  { id: 3, label: "BOM\nReceived", date: "24-10-10" },
  { id: 4, label: "BOM\nReview", date: "24-10-10" },
  { id: 5, label: "Material\nCheck", date: "24-10-10" },
  { id: 6, label: "Material\nRequest", date: "24-10-10" },
  {
    id: 7,
    label: "Production\nPlanning",
    labelSub: "Current\nStep",
    current: true,
  },
  { id: 8, label: "Fabrication\nStarted" },
  { id: 9, label: "Quality\nInspection" },
  { id: 10, label: "Packing\nBundling" },
  { id: 11, label: "Shipper\nPrepared" },
  { id: 12, label: "Ready For\nDelivery" },
  { id: 13, label: "Dispatched" },
  { id: 14, label: "Delivered" },
];

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const basePath = id ? `/customers/${id}` : "/customers";

  const [notes, setNotes] = useState<AddNotesFormValues[]>([
    {
      title: "Steel Investment",
      notes:
        "Reliable for long-distance steel transport.\nPreferred carrier for Texas routes.\nFast response time during bidding.",
    },
  ]);
  const [selectedStepId, setSelectedStepId] = useState(7);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle] = useState("Status Updated Successfully");

  const handleSaveNote = (data: AddNotesFormValues) => {
    setNotes((current) => [data, ...current]);
  };

  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Project Details- Project 1</h1>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActionButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px] shadow-sm"
              onClick={() => navigate(`${basePath}/${btn.path}`)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Basic Info Card */}
      <Card className="">
        <CardHeader className="border-b  flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#EEF2FC]">
              <Building2 className="h-6 w-6 text-[#1D51A4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-slate-800">
                  Project 1- ABC Warehouse
                </h2>
                <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[12px] font-medium text-[#16A34A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5"></span>
                  In Progress
                </span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">Q-2025-1047</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Building Type</p>
                <p className="text-[14px] font-medium text-slate-800">
                  Workshop
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Quote Value</p>
                <p className="text-[14px] font-medium text-slate-800">
                  $12,500
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Created On</p>
                <p className="text-[14px] font-medium text-slate-800">
                  2024-10-10
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Location</p>
                <p className="text-[14px] font-medium text-slate-800">
                  1878 Bayonne Ave, Manchester, NNJ, 088765
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Contact Information
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-[14px] font-medium text-slate-800 mb-1">
                    John Doe
                  </p>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Phone</span>
                      <span className="font-medium text-slate-800">
                        (163) 2459 315
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Email</span>
                      <a
                        href="mailto:darlee@example.com"
                        className="font-medium text-[#1D51A4] hover:underline"
                      >
                        darlee@example.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-[13px]">
                      <span className="text-slate-500 w-16">Address</span>
                      <span className="font-medium text-slate-800">
                        1861 Bayonne Ave,
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Assignment
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800">
                    Assigned to: Sarah Lee
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    1 person working on this lead
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Signed Contract/Agreement
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800">
                    Signed contract/Agreement
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Signed on: 12 April 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Project Lifecycle */}
      <Card className="">
        <CardHeader>
          <CardTitle>Project Lifecycle</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative min-w-[900px] mb-8">
            <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-[#E2E8F0] -z-10"></div>
            <div className="absolute top-[11px] left-3 w-[45%] h-[2px] bg-[#1D51A4] -z-10"></div>

            <div className="flex justify-between">
              {lifecycleSteps.map((step) => {
                const isCompleted = step.id < selectedStepId;
                const isCurrent = step.id === selectedStepId;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center group relative w-16"
                  >
                    <div
                      className={`flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] font-semibold mb-2 z-10 transition-colors
                      ${
                        isCompleted
                          ? "bg-[#16A34A] text-white border-2 border-white"
                          : isCurrent
                            ? "bg-[#1D51A4] text-white border-2 border-white"
                            : "bg-white border-2 border-[#E2E8F0] text-slate-400"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="text-center font-medium">
                      <p
                        className={`text-[11px] whitespace-pre-line leading-tight ${isCurrent ? "text-[#1D51A4]" : "text-slate-600"}`}
                      >
                        {step.label}
                      </p>
                      {step.labelSub && (
                        <p className="text-[10px] text-slate-400 whitespace-pre-line mt-1">
                          {step.labelSub}
                        </p>
                      )}
                      {step.date && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {step.date}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#F8FAFC] rounded-[8px] p-5 mb-5 border border-slate-100">
            <div>
              <p className="text-[14px] font-semibold text-slate-800 mb-1">
                Production Planning (Step 7 of 14)
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Plan Production Schedule, assign resources and determine
                fabrication priority for this project
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500">
                    Planned start date
                  </p>
                  <p className="text-[13px] font-medium text-slate-800">
                    2024-10-10
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500">
                    Target Completion
                  </p>
                  <p className="text-[13px] font-medium text-slate-800">
                    2024-10-10
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-[12px] text-slate-500 mb-0.5">
                  Assigned Planner
                </p>
                <p className="text-[13px] font-medium text-slate-800">
                  Sarah Lee
                </p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Priority</p>
                <p className="text-[13px] font-medium text-[#D97706] inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#FEF3C7]">
                  Medium
                </p>
              </div>
            </div>

            <div>
              <p className="text-[12px] text-slate-500 mb-1">Next Step</p>
              <p className="text-[13px] font-medium text-slate-800">
                Fabrication Production Started
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                Upcoming After completion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px]"
              onClick={handleOpenStatusDialog}
            >
              Update Step Status
            </Button>
            <AddNotesDialog onSave={handleSaveNote} />
          </div>

          <UpdateStatusDialog
            open={statusDialogOpen}
            currentStepId={selectedStepId}
            steps={lifecycleSteps}
            onOpenChange={setStatusDialogOpen}
            onSave={(stepId) => {
              setSelectedStepId(stepId);
              setSuccessDialogOpen(true);
            }}
          />

          <SuccessDialog
            open={successDialogOpen}
            onClose={() => setSuccessDialogOpen(false)}
            title={successDialogTitle}
          />
        </CardContent>
      </Card>

      {/* Grid: Status, Activity, Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <div className="w-full flex justify-start mb-4">
            <h3 className="text-[16px] font-bold text-slate-800">
              Project Status
            </h3>
          </div>

          <div className="relative w-32 h-32 mb-6">
            {/* SVG Circle Progress */}
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="125.6" /* 50% */
                className="text-[#1D51A4]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[12px] text-slate-500">Step</span>
              <span className="text-[28px] font-bold text-slate-800 leading-none">
                7
              </span>
              <span className="text-[11px] text-slate-500">of 14</span>
            </div>
          </div>

          <div className="w-full text-left space-y-4">
            <div>
              <p className="text-[12px] text-slate-500">Current step</p>
              <p className="text-[14px] font-medium text-[#1D51A4]">
                Production Planning
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-slate-600" />
                <p className="text-[13px] font-semibold text-slate-800">
                  Started on
                </p>
              </div>
              <p className="text-[13px] text-slate-500 ml-6">2024-10-10</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 mb-1">
                Estimate Completion
              </p>
              <p className="text-[13px] text-slate-500">2024-10-10</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-6">
          <h3 className="text-[16px] font-bold text-slate-800 mb-6">
            Recent Activity
          </h3>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-[1px] bg-slate-200"></div>

            <div className="relative">
              <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
              <p className="text-[13px] font-medium text-slate-800">
                Step updated: material request completed
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> 19 Jan 2025
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
              <p className="text-[13px] font-medium text-slate-800">
                Additional material request #AMR-001 Created
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> 18 Jan 2025
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
              <p className="text-[13px] font-medium text-slate-800">
                Material Check Completed
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> 18 Jan 2025
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
              <p className="text-[13px] font-medium text-slate-800">
                BOM Review completed
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> 17 Jan 2025
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
              <p className="text-[13px] font-medium text-slate-800">
                2 unread messages
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> 17 Jan 2025
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6 overflow-y-auto max-h-[400px]">
          <h3 className="text-[16px] font-bold text-slate-800 mb-4">Notes</h3>
          <div className="space-y-4 text-[13px] text-slate-600">
            {notes.map((note, index) => (
              <div key={index} className="space-y-2">
                <p className="text-[14px] font-medium text-slate-800">
                  {note.title}
                </p>
                <p className="whitespace-pre-line">{note.notes}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Project Photos */}
      <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-6">
          Project Photos (Latest)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-video bg-slate-100 rounded-[8px] overflow-hidden border border-slate-200"
            >
              <img
                src={`https://placehold.co/400x300/E2E8F0/A1A1AA?text=Photo+${i}`}
                alt={`Project photo ${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
