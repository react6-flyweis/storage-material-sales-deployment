import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadsLookupQuery } from "@/modules/leads/leads.hooks";
import { formatLifecycleStatus } from "@/modules/leads/leads.utils";
import type { LeadLookupItem } from "@/modules/leads/leads.api";

/**
 * TEMP PATCH — load all leads instead of per-customer projects; project select
 * works without a client id. Set to `false` and remove TEMP PATCH branches below.
 */
const TEMP_USE_ALL_LEADS = true;


type Props = {
  customerId: string;
  value: string;
  onValueChange: (project: LeadLookupItem | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function CustomerProjectSelector({
  customerId,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select a project",
}: Props) {
  const allLeadsQuery = useLeadsLookupQuery(undefined, 1, 100);


  const { isLoading, isError } = allLeadsQuery

  const projects =  allLeadsQuery.data?.data.leads ?? []
  

  const handleChange = (projectId: string) => {
    const project = projects.find((item) => item._id === projectId) ?? null;
    onValueChange(project);
  };

  const isDisabled = TEMP_USE_ALL_LEADS
    ? disabled || isLoading || isError || projects.length === 0
    : disabled ||
      !customerId ||
      isLoading ||
      isError ||
      (Boolean(customerId) && projects.length === 0);

  const selectPlaceholder = TEMP_USE_ALL_LEADS
    ? isLoading
      ? "Loading projects..."
      : isError
        ? "Failed to load projects"
        : projects.length === 0
          ? "No projects found"
          : placeholder
    : !customerId
      ? "Select a client first"
      : isLoading
        ? "Loading projects..."
        : isError
          ? "Failed to load projects"
          : projects.length === 0
            ? "No projects found"
            : placeholder;

  return (
    <div className="space-y-2 w-full max-w-sm">
      <label className="text-sm font-medium text-gray-700">Project</label>
      <Select
        value={value || undefined}
        onValueChange={handleChange}
        disabled={isDisabled}
      >
        <SelectTrigger className="w-full bg-white border-gray-200 h-11">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project._id} value={project._id}>
              <div className="flex flex-col items-start">
                <span>{project.projectName}</span>
                {project.lifecycleStatus && (
                  <span className="text-xs text-gray-500">
                    {formatLifecycleStatus(project.lifecycleStatus)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
