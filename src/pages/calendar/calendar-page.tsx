import { useSearchParams } from "react-router";
import Calendar from "@/components/calendar/calendar";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId") || "";

  const handleProjectChange = (projectId: string) => {
    if (projectId) {
      setSearchParams({ projectId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Construction Delivery Calendar
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Track scheduled material site deliveries across projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Component */}
      <Calendar
        initialProjectId={projectIdParam}
        onProjectChange={handleProjectChange}
      />
    </div>
  );
}
