import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { useCalendarProjects } from "@/modules/calendar/calendar.hooks";
import type { CalendarProject } from "@/modules/calendar/calendar.types";

interface ProjectSelectorProps {
  value: string;
  onChange: (val: string, project?: CalendarProject | null) => void;
  showAllOption?: boolean;
  width?: string;
  hasDelivery?: boolean;
}

export default function ProjectSelector({
  value,
  onChange,
  showAllOption = true,
  width = "280px",
  hasDelivery = false,
}: ProjectSelectorProps) {
  const { data, isLoading } = useCalendarProjects(hasDelivery);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(() => {
    return data?.data?.projects || [];
  }, [data]);

  const effectiveValue = useMemo(() => {
    const match = projects.find(
      (p) => p._id === value || (p.leadId && p.leadId === value)
    );
    return match?._id || value;
  }, [projects, value]);

  const options = useMemo(() => {
    const list = projects.map((proj) => ({
      label:
        proj.projectName ||
        `${proj.buildingType || "Project"} - ${proj.location || "Site"} (${proj.jobId || "No Job ID"})`,
      value: proj._id,
      project: proj,
    }));

    if (showAllOption) {
      list.unshift({
        label: "All Projects",
        value: "",
        project: null as unknown as CalendarProject,
      });
    }

    return list;
  }, [projects, showAllOption]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === effectiveValue);
    return found?.label || "Select Project";
  }, [options, effectiveValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative" style={{ width }}>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-white px-3.5 h-9.5 rounded-lg border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors flex items-center justify-between text-left text-xs font-semibold text-gray-800 disabled:opacity-60 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate mr-2">
          {isLoading ? "Loading projects..." : selectedLabel}
        </span>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full min-w-65 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 pb-1.5 pt-1 border-b border-gray-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="max-h-55 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No matching projects found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === effectiveValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value, opt.project || null);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
