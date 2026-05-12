import { useState } from "react";
import {
  AlertCircle,
  Mail,
  MessageSquareReply,
  Package2,
  Phone,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SuccessDialog from "@/components/success-dialog";
import { cn } from "@/lib/utils";

type RequestType =
  | "new-delivery"
  | "reschedule"
  | "customer-issue"
  | "callback";

type Priority = "low" | "normal" | "high" | "urgent";

const requestTypes: Array<{
  id: RequestType;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "new-delivery",
    title: "New Delivery Request",
    description: "Request setup for a new delivery",
    icon: <Package2 className="size-4 text-blue-600" />,
  },
  {
    id: "reschedule",
    title: "Reschedule Request",
    description: "Request to change delivery date/time",
    icon: <RotateCcw className="size-4 text-slate-600" />,
  },
  {
    id: "customer-issue",
    title: "Customer Issue",
    description: "Report a customer concern or problem",
    icon: <AlertCircle className="size-4 text-slate-600" />,
  },
  {
    id: "callback",
    title: "Callback Request",
    description: "Request team to contact customer",
    icon: <MessageSquareReply className="size-4 text-slate-600" />,
  },
];

const priorities: Array<{ id: Priority; label: string }> = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
];

const projectOptions = [
  "Project title 1",
  "Project title 2",
  "Project title 3",
];

export default function RequestDeliveryChangePage() {
  const [requestType, setRequestType] = useState<RequestType>("new-delivery");
  const [priority, setPriority] = useState<Priority>("normal");
  const [project, setProject] = useState(projectOptions[0]);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessOpen(true);
  };

  return (
    <div className="p-5">
      <div className=" space-y-4">
        <div className="space-y-1 px-1">
          <h1 className="text-[24px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
            Request Delivery / Change
          </h1>
          <p className="text-sm text-slate-600 sm:text-[15px]">
            Create a request for the Construction team
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <div className="rounded-md border border-blue-200 bg-[#F5F8FF] px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-blue-500 text-[10px] text-blue-600">
                  i
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-blue-700">
                    Sales Team Request Process
                  </div>
                  <p className="text-[12px] leading-5 text-blue-700/90 sm:text-sm">
                    As a Sales team member, you cannot directly modify
                    deliveries or logistics. Submit a request here, and the
                    Construction team will handle the execution.
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <section className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Request Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {requestTypes.map((item) => {
                    const selected = item.id === requestType;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRequestType(item.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                          selected
                            ? "border-blue-300 bg-blue-50 shadow-[0_0_0_1px_rgba(37,99,235,0.12)]"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-md",
                            selected ? "bg-blue-100" : "bg-slate-100",
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="space-y-0.5">
                          <span className="block text-sm font-medium text-slate-800">
                            {item.title}
                          </span>
                          <span className="block text-[12px] leading-4 text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Project <span className="text-red-500">*</span>
                  </Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-10 bg-white text-slate-700">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Requested Delivery Date
                  </Label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    className="h-10 bg-white"
                  />
                </div>
              </div>

              <section className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {priorities.map((item) => {
                    const selected = item.id === priority;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPriority(item.id)}
                        className={cn(
                          "h-9 rounded-md border text-sm font-medium transition-colors",
                          selected
                            ? "border-blue-300 bg-blue-100 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Notes / Details <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  className="min-h-32 resize-none bg-white"
                  placeholder="Provide detailed information about your request..."
                />
                <p className="text-[12px] text-slate-500">
                  Include relevant customer details, specific requirements, or
                  any context that will help the Construction team.
                </p>
              </section>

              <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
                <Button
                  type="submit"
                  className="h-10 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="mr-2 size-4" />
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="space-y-1">
              <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">
                Need Immediate Assistance?
              </h2>
              <p className="text-sm text-slate-600">
                For urgent matters that require immediate attention, contact the
                Construction team directly.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Phone className="mr-2 size-3.5 text-slate-500" />
                (555) 123-4567
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Mail className="mr-2 size-3.5 text-slate-500" />
                construction@company.com
              </Button>
            </div>
          </CardContent>
        </Card>

        <SuccessDialog
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Submitted Successfully"
          okLabel="Continue"
        />
      </div>
    </div>
  );
}
