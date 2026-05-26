import { useState } from "react";
import StatCard from "@/components/ui/stat-card";
import { useFollowUpStatsQuery } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import UpcomingFollowUps from "@/components/follow-up/upcoming-follow-ups";
import AddFollowUpDialog from "@/components/follow-up/add-follow-up-dialog";
import LeadCommunicationTimeline from "@/components/leads/lead-communication-timeline";
import AiScriptGenerator from "@/components/follow-up/ai-script-generator";
import LeadScoring from "@/components/follow-up/lead-scoring";
// import FollowUpKpis from "@/components/follow-up/follow-up-kpis";

export default function FollowUpPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [initialFollowUpDate, setInitialFollowUpDate] = useState<string | null>(
    null,
  );
  const { data: stats, isPending } = useFollowUpStatsQuery();
  const loading = isPending && !stats;

  const openAddFollowUpDialog = (date: string | null = null) => {
    setInitialFollowUpDate(date);
    setIsAddDialogOpen(true);
  };

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);

    if (!open) {
      setInitialFollowUpDate(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Follow-up & Task Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor upcoming tasks, overdue follow-ups, and completed actions.
          </p>
        </div>
        <Button
          onClick={() => openAddFollowUpDialog()}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto mt-3 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Follow-up
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Follow-ups"
          value={stats?.total ?? 0}
          icon={<CalendarIcon className="w-6 h-6 text-blue-600" />}
          color="bg-blue-600"
          loading={loading}
        />
        <StatCard
          title="Upcoming"
          value={stats?.upcoming ?? 0}
          icon={<Clock className="w-6 h-6 text-green-600" />}
          color="bg-green-600"
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={stats?.completed ?? 0}
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          color="bg-green-600"
          loading={loading}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdue ?? 0}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          color="bg-red-600"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UpcomingFollowUps onScheduleFollowUp={openAddFollowUpDialog} />
        {/* <SmartReminders /> */}

        <AiScriptGenerator />
        <LeadCommunicationTimeline />

        <LeadScoring />
        {/* <FollowUpKpis /> */}
      </div>

      {/* Add Follow-up Dialog */}
      <AddFollowUpDialog
        open={isAddDialogOpen}
        onOpenChange={handleAddDialogOpenChange}
        initialDate={initialFollowUpDate}
      />
    </div>
  );
}
