import { useState } from "react";
import { useNavigate } from "react-router";
import StatCard from "@/components/ui/stat-card";
import {
  UserPlus,
  RefreshCw,
  Clock,
  AlertTriangle,
  Calendar,
  Truck,
  FileText,
  DollarSign,
  Package,
  MessageSquare,
  Bell,
  BellRing,
  BellOff,
  CheckSquare,
  FileSpreadsheet,
  AlertCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/modules/notifications/notifications.hooks";
import {
  getNotificationRoute,
  formatNotificationTime,
} from "@/modules/notifications/notifications.utils";
import type { NotificationItem } from "@/modules/notifications/notifications.types";

export type FilterOption = {
  id: string;
  label: string;
  read: string;
  type: string;
};

const iconMap: Record<
  string,
  { icon: LucideIcon; bg: string; text: string }
> = {
  new: { icon: UserPlus, bg: "bg-[#DBEAFE]", text: "text-[#1D51A4]" },
  lead: { icon: UserPlus, bg: "bg-[#DBEAFE]", text: "text-[#1D51A4]" },
  update: { icon: RefreshCw, bg: "bg-blue-100", text: "text-blue-600" },
  task: { icon: CheckSquare, bg: "bg-purple-100", text: "text-purple-600" },
  reminder: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-600" },
  followup: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-600" },
  alert: { icon: AlertTriangle, bg: "bg-red-100", text: "text-red-600" },
  escalation: { icon: AlertTriangle, bg: "bg-red-100", text: "text-red-600" },
  schedule: { icon: Calendar, bg: "bg-cyan-100", text: "text-cyan-600" },
  meeting: { icon: Calendar, bg: "bg-cyan-100", text: "text-cyan-600" },
  payment: { icon: DollarSign, bg: "bg-green-100", text: "text-green-600" },
  drawing: { icon: FileSpreadsheet, bg: "bg-indigo-100", text: "text-indigo-600" },
  delivery: { icon: Truck, bg: "bg-amber-100", text: "text-amber-600" },
  material_request: { icon: Package, bg: "bg-teal-100", text: "text-teal-600" },
  quotation: { icon: FileText, bg: "bg-emerald-100", text: "text-emerald-600" },
  invoice: { icon: FileText, bg: "bg-blue-100", text: "text-blue-700" },
  freight_bid: { icon: Truck, bg: "bg-orange-100", text: "text-orange-600" },
  chat: { icon: MessageSquare, bg: "bg-sky-100", text: "text-sky-600" },
  system: { icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-600" },
};

export default function Notifications() {
  const navigate = useNavigate();

  const [activeFilterId, setActiveFilterId] = useState<string>("all");
  const [activeRead, setActiveRead] = useState<string>("");
  const [activeType, setActiveType] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useNotificationsQuery({
    page,
    limit,
    type: activeType,
    read: activeRead,
  });

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications: NotificationItem[] = data?.data?.notifications || [];
  const stats = data?.data?.stats || {
    total: 0,
    unread: 0,
    highPriority: 0,
    today: 0,
  };
  const totalItems = data?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const filters: FilterOption[] = [
    { id: "all", label: "All", read: "", type: "" },
    {
      id: "unread",
      label: stats.unread > 0 ? `Unread(${stats.unread})` : "Unread",
      read: "false",
      type: "",
    },
    { id: "lead", label: "Leads", read: "", type: "lead" },
    { id: "task", label: "Tasks", read: "", type: "task" },
    { id: "meeting", label: "Meetings", read: "", type: "meeting" },
    { id: "escalation", label: "Escalations", read: "", type: "escalation" },
    { id: "delivery", label: "Deliveries", read: "", type: "delivery" },
    { id: "quotation", label: "Quotations", read: "", type: "quotation" },
    { id: "invoice", label: "Invoices", read: "", type: "invoice" },
    { id: "payment", label: "Payments", read: "", type: "payment" },
    { id: "chat", label: "Chat", read: "", type: "chat" },
  ];

  const equipmentStats = [
    {
      title: "Total",
      value: String(stats.total),
      icon: <Bell className="w-5 h-5 text-[#1D51A4]" />,
      color: "bg-[#1D51A4]",
    },
    {
      title: "Unread",
      value: String(stats.unread),
      icon: <BellRing className="w-5 h-5 text-[#3AB449]" />,
      color: "bg-[#3AB449]",
    },
    {
      title: "High Priority",
      value: String(stats.highPriority),
      icon: <BellOff className="w-5 h-5 text-[#F59E0B]" />,
      color: "bg-[#F59E0B]",
    },
    {
      title: "Today",
      value: String(stats.today),
      icon: <Bell className="w-5 h-5 text-[#FD8D5B]" />,
      color: "bg-[#FD8D5B]",
    },
  ];

  const renderIcon = (type: string) => {
    const key = (type || "").toLowerCase();
    const styleConfig = iconMap[key] || {
      icon: Bell,
      bg: "bg-gray-100",
      text: "text-gray-600",
    };
    const IconComponent = styleConfig.icon;

    return (
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${styleConfig.bg} ${styleConfig.text}`}
      >
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    const route = getNotificationRoute(notification);
    navigate(route);
  };

  const handleFilterClick = (filter: FilterOption) => {
    setActiveFilterId(filter.id);
    setActiveRead(filter.read);
    setActiveType(filter.type);
    setPage(1);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
        <div className="flex items-start gap-1 flex-col">
          <h1 className="xl:text-3xl text-xl font-bold text-gray-800 md:mb-2 mb-1">
            Notifications
          </h1>
          <p className="text-[#4B5563] md:text-base font-normal text-sm">
            Stay updated with project changes, approvals, drawings, dispatches,
            billings, and communication.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || stats.unread === 0}
            variant="outline"
            className="flex items-center gap-2 text-xs border-gray-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {equipmentStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Filters Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <span className="text-gray-700 font-medium md:text-lg text-xs mr-2 shrink-0">
          Filter by:
        </span>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilterId === filter.id;
            return (
              <Button
                key={filter.id}
                onClick={() => handleFilterClick(filter)}
                className={cn(
                  "px-6 py-2 rounded-lg md:text-sm text-xs font-medium transition-colors cursor-pointer",
                  {
                    "bg-[#1D51A4] text-white hover:bg-[#153f82]": isActive,
                    "bg-gray-100 text-gray-600 hover:bg-gray-200": !isActive,
                  }
                )}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-6 flex flex-col md:flex-row items-start justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer group",
                  !notification.isRead ? "bg-blue-50/30" : ""
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  {renderIcon(notification.type)}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-gray-900 font-semibold text-base group-hover:text-blue-600 transition-colors">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                      {notification.priority && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded border capitalize",
                            getPriorityBadgeClass(notification.priority)
                          )}
                        >
                          {notification.priority} priority
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">
                      {notification.body}
                    </p>
                    <span className="text-gray-400 text-xs font-medium">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!notification.isRead && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate(notification._id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Mark Read
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No notifications found in this category.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Showing page {page} of {totalPages} ({totalItems} total notifications)
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="text-xs flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="text-xs flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
