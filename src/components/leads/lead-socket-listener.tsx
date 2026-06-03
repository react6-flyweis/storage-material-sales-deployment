import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { createAdminSocket, type Socket } from "@/lib/socket";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, AlertCircle, Info, ArrowUpRight } from "lucide-react";

interface LeadListSocketPayload {
  leadId: string;
  lead: Record<string, any>;
  scoreRow?: Record<string, any> | null;
  meta: {
    action: "created" | "updated";
    trigger: string;
  };
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: "success" | "info" | "warning";
  leadId?: string;
}

export function LeadSocketListener() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<Socket | null>(null);

  // States for dialog and toasts
  const [createdLead, setCreatedLead] = useState<LeadListSocketPayload | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Function to add a toast
  const addToast = (title: string, description: string, type: "success" | "info" | "warning" = "info", leadId?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type, leadId }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Request notification permission initially
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Set up socket listener
  useEffect(() => {
    if (!accessToken) return;

    // Connect to /admin namespace using websocket transport
    const socket = createAdminSocket(accessToken);
    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to /admin socket namespace for Lead List events");
    });

    const handleLeadCreated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_created event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // Extract client or project name
      const clientName = payload.lead?.customerId?.firstName ||
        payload.lead?.customerId?.name ||
        payload.lead?.projectName ||
        "New Lead";
      const triggerInfo = payload.meta.trigger ? ` (via ${payload.meta.trigger})` : "";

      if (document.visibilityState !== "visible") {
        // Tab is inactive - fire browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("New Lead Created", {
            body: `Lead for ${clientName} has been created${triggerInfo}. Click to view.`,
            icon: "/favicon.ico"
          });
          notification.onclick = () => {
            window.focus();
            if (payload.leadId) {
              navigate(`/leads/${payload.leadId}`);
            }
            notification.close();
          };
        }
      } else {
        // Tab is active - show global success dialog
        setCreatedLead(payload);
      }
    };

    const handleLeadUpdated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_updated event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // Extract client or project name
      const clientName = payload.lead?.customerId?.firstName ||
        payload.lead?.customerId?.name ||
        payload.lead?.projectName ||
        "Lead";
      const triggerName = payload.meta.trigger ? payload.meta.trigger.replace(/_/g, " ") : "update";

      if (document.visibilityState !== "visible") {
        // Tab is inactive - fire browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("Lead Updated", {
            body: `Lead details for ${clientName} updated: ${triggerName}.`,
            icon: "/favicon.ico"
          });
          notification.onclick = () => {
            window.focus();
            if (payload.leadId) {
              navigate(`/leads/${payload.leadId}`);
            }
            notification.close();
          };
        }
      } else {
        // Tab is active - show Toast
        addToast(
          "Lead Updated",
          `"${clientName}" was updated due to ${triggerName}.`,
          "success",
          payload.leadId
        );
      }
    };

    socket.on("lead_list_created", handleLeadCreated);
    socket.on("lead_list_updated", handleLeadUpdated);

    return () => {
      socket.off("lead_list_created", handleLeadCreated);
      socket.off("lead_list_updated", handleLeadUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, queryClient, navigate]);

  // Navigate to created lead details and close dialog
  const handleViewCreatedLead = () => {
    if (createdLead?.leadId) {
      navigate(`/leads/${createdLead.leadId}`);
    }
    setCreatedLead(null);
  };

  // Get name details of created lead for UI
  const getCreatedLeadName = () => {
    if (!createdLead) return "";
    return createdLead.lead?.customerId?.firstName ||
      createdLead.lead?.customerId?.name ||
      createdLead.lead?.projectName ||
      "New Lead";
  };

  return (
    <>
      {/* Global Success Dialog for Lead Creation */}
      <Dialog open={!!createdLead} onOpenChange={(open) => !open && setCreatedLead(null)}>
        <DialogContent className="w-full max-w-md rounded-2xl p-6 text-center shadow-2xl bg-white border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
          <DialogHeader className="flex flex-col items-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-xl font-semibold leading-tight text-slate-900">
              New Lead Created
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 text-sm text-slate-500">
            <p className="font-medium text-slate-800 text-base mb-1">
              {getCreatedLeadName()}
            </p>
            {createdLead?.lead?.customerId?.email && (
              <p className="text-slate-400 mb-2">{createdLead.lead.customerId.email}</p>
            )}
            <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
              Trigger: {createdLead?.meta?.trigger?.replace(/_/g, " ") || "system"}
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCreatedLead(null)}
              className="w-full order-2 sm:order-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleViewCreatedLead}
              className="w-full order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <span>View Details</span>
              <ArrowUpRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Toast Stack */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] bg-opacity-95 backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in-40 duration-300"
          >
            <div className="mt-0.5">
              {toast.type === "success" && (
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                  <Info className="size-5" />
                </div>
              )}
              {toast.type === "warning" && (
                <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircle className="size-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {toast.description}
              </p>
              {toast.leadId && (
                <button
                  onClick={() => {
                    navigate(`/leads/${toast.leadId}`);
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  View Details
                  <ArrowUpRight className="size-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition hover:bg-slate-50"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
