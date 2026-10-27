import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLeadsLookupQuery } from "@/modules/leads/leads.hooks";
import {
  formatLifecycleStatus,
  getStatusBadgeClassName,
  getLeadProjectName,
} from "@/modules/leads/leads.utils";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useLeadsLookupQuery(
    debouncedSearch.trim() || undefined,
    1,
    8,
  );

  const leads = data?.data?.leads ?? [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLead = (leadId: string) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/leads/${leadId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && leads.length > 0 && isOpen) {
      handleSelectLead(leads[0]._id);
    }
  };

  return (
    <div ref={containerRef} className="relative w-48 md:w-72 lg:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search leads, projects..."
          className="pl-9 pr-8 bg-gray-50 border-gray-200 text-sm focus-visible:bg-white transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-70">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span>Searching leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No leads found
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                Leads & Projects
              </div>
              <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {leads.map((lead) => {
                  const projectName = getLeadProjectName(lead);
                  const customerName =
                    [lead.customerId?.firstName, lead.customerId?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    lead.customerId?.email ||
                    "Unknown Customer";

                  return (
                    <li key={lead._id}>
                      <button
                        type="button"
                        onClick={() => handleSelectLead(lead._id)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex flex-col gap-0.5 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {projectName}
                          </span>
                          {lead.lifecycleStatus && (
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                                getStatusBadgeClassName(lead.lifecycleStatus)
                              )}
                            >
                              {formatLifecycleStatus(lead.lifecycleStatus)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">{customerName}</span>
                          {lead.jobId && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="font-mono text-[11px] text-gray-400">
                                #{lead.jobId}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
