import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft } from "lucide-react";
import ClientSelector from "@/components/customers/client-selector";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useCreateMeetingMutation } from "@/modules/meetings/meetings.hooks";
import SuccessDialog from "@/components/success-dialog";

const meetingSchema = z.object({
  client: z.string().min(1, "Please select a client"),
  title: z.string().min(1, "Please select a meeting title"),
  date: z.string().min(1, "Meeting date is required"),
  time: z.string().min(1, "Meeting time is required"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+$/, "Duration must be a number of minutes"),
  mode: z.enum(["online", "in-person"]),
  link: z.string().min(1, "Meeting link is required"),
  notes: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

type MeetingRouteState = {
  customerId?: string;
  leadId?: string;
  assignedTo?: string;
};

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClient, setSelectedClient] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMeetingMutation = useCreateMeetingMutation();
  const authUserId = useAuthStore((state) => state.user?._id ?? "");
  const routeState = (location.state ?? {}) as MeetingRouteState;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      mode: "online",
      title: "",
      date: "",
      time: "",
      duration: "",
      link: "",
      notes: "",
      client: "",
    },
  });

  // clients list available for the selector

  const onSubmit = async (data: MeetingFormData) => {
    setErrorMessage(null);

    const customerId = routeState.customerId ?? selectedClient.trim();
    const leadId = routeState.leadId?.trim() ?? "";
    const assignedTo = routeState.assignedTo?.trim() ?? authUserId.trim();

    if (!customerId) {
      setErrorMessage(
        "Customer ID is missing. Select a customer before scheduling.",
      );
      return;
    }

    if (!leadId) {
      setErrorMessage(
        "leadId is not available on this screen yet. Pass it from the customer or lead context before submitting.",
      );
      return;
    }

    if (!assignedTo) {
      setErrorMessage(
        "assignedTo is not available. Select or pass the sales user id before submitting.",
      );
      return;
    }

    const meetingTime = new Date(
      `${data.date}T${data.time}:00.000Z`,
    ).toISOString();

    try {
      const response = await createMeetingMutation.mutateAsync({
        customerId,
        leadId,
        title: data.title,
        meetingTime,
        duration: Number.parseInt(data.duration, 10),
        mode: data.mode,
        meetingLink: data.link?.trim() ?? "",
        notes: data.notes?.trim() || undefined,
        assignedTo,
      });

      if (!response.success) {
        setErrorMessage(response.message || "Unable to schedule meeting.");
        return;
      }

      setSuccessOpen(true);
      setTimeout(() => navigate("/customers/meetings"), 500);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to schedule meeting."));
    }
  };

  return (
    <div className="p-4 sm:p-6  w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white h-9 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          Schedule meeting
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow space-y-5">
          <h3 className="text-base font-semibold text-gray-900">
            Meeting Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select a customer */}
            <div className="space-y-2">
              <Label htmlFor="client">
                Select a customer <span className="text-red-500">*</span>
              </Label>
              <ClientSelector
                value={selectedClient}
                placeholder="Search Customer"
                onValueChange={(client) => {
                  const val = client?.id ?? "";
                  setSelectedClient(val);
                  setValue("client", val);
                }}
              />
              {errors.client && (
                <p className="text-sm text-red-500">{errors.client.message}</p>
              )}
            </div>

            {/* Meeting title */}
            <div className="space-y-2">
              <Label htmlFor="title">Meeting title</Label>
              <Select
                onValueChange={(value) => setValue("title", value)}
                {...register("title")}
              >
                <SelectTrigger className="w-full" id="title">
                  <SelectValue placeholder="Meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-review">Project Review</SelectItem>
                  <SelectItem value="sales-meeting">Sales Meeting</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Meeting Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input
                id="date"
                type="date"
                placeholder="dd-mm-yyyy"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Meeting Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Meeting Time</Label>
              <Input
                id="time"
                type="time"
                placeholder="dd-mm-yyyy"
                {...register("time")}
              />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                step={1}
                placeholder="60"
                {...register("duration")}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Meeting mode */}
            <div className="space-y-2">
              <Label>Meeting mode</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    {...register("mode")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="in-person"
                    {...register("mode")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">In Person</span>
                </label>
              </div>
              {errors.mode && (
                <p className="text-sm text-red-500">{errors.mode.message}</p>
              )}
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="link">
              Meeting Link <span className="text-red-500">*</span>
            </Label>
            <Input id="link" placeholder="Zoom Meeting" {...register("link")} />
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link.message}</p>
            )}
          </div>

          {/* Add Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or agenda items"
              rows={4}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/customers/meetings")}
            className="w-full sm:w-auto px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMeetingMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6"
          >
            {createMeetingMutation.isPending
              ? "Scheduling..."
              : "Schedule meeting"}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/customers/meetings");
        }}
        title="Meeting scheduled"
        okLabel="Go to meetings"
      />
    </div>
  );
}
