import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Package,
  Calendar as CalendarIcon,
  Truck,
  MapPin,
  Download,
  Loader2,
  Check,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDeliveryDetailsApi,
  downloadDeliveryPackingListApi,
  downloadDeliveryBillOfLadingApi,
} from "@/modules/calendar/calendar.api";

interface DeliveryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  deliveryId?: string | null;
  leadId?: string | null;
}

const formatDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${dateFormatted}${timeStr ? `, ${timeStr}` : ""}`;
  } catch {
    return dateStr;
  }
};

export default function DeliveryDetailsModal({
  open,
  onClose,
  deliveryId,
  leadId,
}: DeliveryDetailsModalProps) {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const { data: detailData, isLoading, isError } = useQuery({
    queryKey: ["delivery-details", leadId, deliveryId],
    queryFn: () => getDeliveryDetailsApi(leadId!, deliveryId!),
    enabled: Boolean(open && leadId && deliveryId),
  });

  const downloadPackingListMutation = useMutation({
    mutationFn: () => downloadDeliveryPackingListApi(deliveryId!),
    onSuccess: (res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PackingList_${deliveryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadSuccessMessage("Packing list downloaded successfully");
      setTimeout(() => setDownloadSuccessMessage(null), 3000);
    },
  });

  const downloadBillOfLadingMutation = useMutation({
    mutationFn: () => downloadDeliveryBillOfLadingApi(deliveryId!),
    onSuccess: (res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BillOfLading_${deliveryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadSuccessMessage("Bill of lading downloaded successfully");
      setTimeout(() => setDownloadSuccessMessage(null), 3000);
    },
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const delivery = detailData?.data?.delivery;
  const statusHistory = delivery?.statusHistory || [];
  const activeStatus =
    delivery?.status ||
    (statusHistory.length > 0
      ? statusHistory[statusHistory.length - 1]?.status
      : null);

  const steps =
    statusHistory.length > 0
      ? statusHistory.map((item, idx) => {
          const isCurrent = idx === statusHistory.length - 1;
          return {
            label: item.status
              ? item.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : "-",
            status: isCurrent ? ("current" as const) : ("completed" as const),
            timestamp: item.changedAt,
          };
        })
      : activeStatus
      ? [
          {
            label: activeStatus
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            status: "current" as const,
            timestamp: undefined,
          },
        ]
      : [];

  const formattedStatusText = activeStatus
    ? activeStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "-";

  const timeWindowOrEta =
    delivery?.overview?.timeWindow
      ? `Time Window: ${delivery.overview.timeWindow}`
      : delivery?.schedule?.deliveryTime
      ? `ETA: ${delivery.schedule.deliveryTime}`
      : null;

  const receivingPocName =
    typeof delivery?.receivingPoc === "object" && delivery?.receivingPoc !== null
      ? delivery.receivingPoc.name || "-"
      : (delivery?.receivingPoc as string) || "-";

  const receivingPocPhone =
    typeof delivery?.receivingPoc === "object" && delivery?.receivingPoc !== null
      ? delivery.receivingPoc.phone
      : null;

  const customerPhone =
    delivery?.customer?.phone
      ? `${delivery.customer.phone.countryCode || ""} ${delivery.customer.phone.number || ""}`.trim()
      : null;

  const siteAddress =
    delivery?.overview?.siteAddress ||
    delivery?.deliveryLocation ||
    delivery?.stagingArea ||
    "-";

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6 overflow-y-auto animate-in fade-in-50 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-212.5 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  {delivery?.title || "Delivery Details"}
                </h2>
                {delivery?.status && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {delivery.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                {delivery?.deliveryNumber || deliveryId || "-"}
                {delivery?.project?.projectName || delivery?.overview?.projectName
                  ? ` • ${delivery?.project?.projectName || delivery?.overview?.projectName}`
                  : ""}
                {delivery?.project?.jobId ? ` (Job #${delivery.project.jobId})` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1">
          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-gray-500">
                Loading delivery details...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm font-semibold text-rose-600">
                Failed to load delivery details.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div className="border border-blue-100 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-blue-800">
                      Current Status
                    </p>
                    {timeWindowOrEta && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        {timeWindowOrEta}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 tracking-tight">
                    {formattedStatusText}
                  </h3>
                </div>
                <div className="sm:text-right max-w-xs">
                  <p className="text-xs font-medium text-gray-500">
                    Site Destination
                  </p>
                  <h4
                    className="text-xs sm:text-sm font-bold text-gray-800 truncate"
                    title={siteAddress}
                  >
                    {siteAddress}
                  </h4>
                </div>
              </div>

              {/* Progress Tracker */}
              {steps.length > 0 && (
                <div className="border border-gray-200/80 rounded-xl p-4 bg-gray-50/40">
                  <p className="text-xs font-semibold text-gray-700 mb-3">
                    Status Timeline
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="shrink-0">
                          {step.status === "completed" ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 ring-2 ring-blue-500/30">
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">
                            {step.label}
                          </span>
                          {step.timestamp && (
                            <span className="text-[10px] font-medium text-gray-400">
                              {formatDateTime(step.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Card */}
                <div className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Schedule Details
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Date</span>
                      <span className="font-semibold text-gray-800">
                        {formatDateTime(
                          delivery?.overview?.deliveryDate ||
                            delivery?.schedule?.deliveryDate
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time Window</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.overview?.timeWindow ||
                          delivery?.schedule?.deliveryTime ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pickup Date</span>
                      <span className="font-semibold text-gray-800">
                        {formatDateTime(
                          delivery?.deliveryInformation?.pickupDate ||
                            delivery?.schedule?.pickupDate
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pickup Time</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.schedule?.pickupTime || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vendor & Carrier Card */}
                <div className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Vendor & Logistics
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vendor Company</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.vendor?.company ||
                          delivery?.deliveryCompany?.companyName ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Person</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.vendor?.contactName ||
                          delivery?.deliveryCompany?.driverName ||
                          delivery?.carrier?.driverName ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Phone</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.vendor?.phone ||
                          delivery?.deliveryCompany?.driverPhone ||
                          delivery?.carrier?.driverPhone ||
                          delivery?.carrier?.phone ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Email</span>
                      <span className="font-semibold text-gray-800 truncate max-w-45">
                        {delivery?.vendor?.email ||
                          delivery?.deliveryCompany?.email ||
                          delivery?.carrier?.email ||
                          "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Destination Card */}
                <div className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Customer & Site
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer Name</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.customer?.customerName ||
                          delivery?.overview?.customerName ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer Email</span>
                      <span className="font-semibold text-gray-800 truncate max-w-45">
                        {delivery?.customer?.email || "-"}
                      </span>
                    </div>
                    {customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer Phone</span>
                        <span className="font-semibold text-gray-800">
                          {customerPhone}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Receiving POC</span>
                      <span className="font-semibold text-gray-800">
                        {receivingPocName}
                        {receivingPocPhone ? ` (${receivingPocPhone})` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Site Address</span>
                      <span className="font-semibold text-gray-800 block text-[11px] mt-0.5 leading-snug">
                        {siteAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Material & Site Coordination Card */}
                <div className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Material & Coordination
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Material Category</span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {delivery?.deliveryInformation?.materialCategory ||
                          delivery?.materialType ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required Equipment</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.siteCoordination?.requiredEquipment ||
                          (delivery?.loadingEquipment &&
                            delivery.loadingEquipment.join(", ")) ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Equipment Status</span>
                      <span className="font-semibold text-gray-800">
                        {delivery?.siteCoordination?.equipmentConfirmationStatus ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description</span>
                      <span
                        className="font-semibold text-gray-800 truncate max-w-45"
                        title={
                          delivery?.deliveryInformation?.description ||
                          delivery?.title ||
                          delivery?.description ||
                          "-"
                        }
                      >
                        {delivery?.deliveryInformation?.description ||
                          delivery?.title ||
                          delivery?.description ||
                          "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Instructions & Notes */}
              {(delivery?.siteCoordination?.siteInstructions ||
                delivery?.siteCoordination?.specialNotes ||
                delivery?.notes) && (
                <div className="p-4 rounded-xl border border-gray-200/70 bg-gray-50/50 space-y-2">
                  {delivery?.siteCoordination?.siteInstructions && (
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Site Instructions
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                        {delivery.siteCoordination.siteInstructions}
                      </p>
                    </div>
                  )}
                  {(delivery?.siteCoordination?.specialNotes ||
                    delivery?.notes) && (
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Special Notes
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                        {delivery.siteCoordination?.specialNotes ||
                          delivery.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-gray-50/80 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={downloadPackingListMutation.isPending || !deliveryId}
              onClick={() => downloadPackingListMutation.mutate()}
              className="px-3.5 py-2 rounded-lg bg-white border border-gray-200/90 hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {downloadPackingListMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>Packing List</span>
            </button>

            <button
              type="button"
              disabled={downloadBillOfLadingMutation.isPending || !deliveryId}
              onClick={() => downloadBillOfLadingMutation.mutate()}
              className="px-3.5 py-2 rounded-lg bg-white border border-gray-200/90 hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {downloadBillOfLadingMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>Bill of Lading</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
