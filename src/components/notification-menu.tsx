import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import notificationIcon from "@/assets/icons/notification.svg";
import { Link, useNavigate } from "react-router";
import {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/modules/notifications/notifications.hooks";
import {
  getNotificationRoute,
  formatNotificationTime,
  getNotificationTypeConfig,
} from "@/modules/notifications/notifications.utils";
import type { NotificationItem } from "@/modules/notifications/notifications.types";

export function NotificationMenu() {
  const navigate = useNavigate();
  const { data: unreadCountData } = useUnreadNotificationCountQuery();
  const { data: notificationsData } = useNotificationsQuery({ page: 1, limit: 5 });

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const totalUnread = unreadCountData ?? notificationsData?.data?.stats?.unread ?? 0;
  const items: NotificationItem[] = notificationsData?.data?.notifications || [];

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    const route = getNotificationRoute(notification);
    navigate(route);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="relative flex size-8 items-center justify-center rounded-full border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900 cursor-pointer"
        >
          <img
            src={notificationIcon}
            alt="Notifications"
            className="max-h-5 max-w-5"
          />
          {totalUnread > 0 ? (
            <Badge className="absolute -right-1 -top-1 size-4 flex items-center justify-center rounded-full bg-red-600 p-0 text-[10px] font-semibold text-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-80 rounded-2xl border border-gray-100 bg-white p-0 shadow-[0_20px_45px_rgba(15,23,42,0.15)] overflow-hidden"
      >
        <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/50">
          <div>
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <p className="text-xs text-gray-500">
              {totalUnread > 0
                ? `${totalUnread} unread update${totalUnread > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {totalUnread > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {items.length > 0 ? (
            items.map((item) => {
              const typeConfig = getNotificationTypeConfig(item.type);
              const Icon = typeConfig.icon;

              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 cursor-pointer",
                    !item.isRead ? "bg-blue-50/40" : ""
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", typeConfig.bg, typeConfig.text)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {item.body}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatNotificationTime(item.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-gray-500">
              No notifications yet
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50">
          <Link
            to="/notifications"
            className="w-full block text-center rounded-b-2xl px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
