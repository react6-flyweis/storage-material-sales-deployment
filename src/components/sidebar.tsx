import { NavLink, useLocation, useNavigate } from "react-router";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

// icons
import dashboardIcon from "@/assets/icons/sidebar/dashboard.svg";
import customerIcon from "@/assets/icons/sidebar/customer.svg";
import deliveryIcon from "@/assets/icons/sidebar/delivery.svg";
import callIcon from "@/assets/icons/sidebar/call.svg";
import invoices from "@/assets/icons/sidebar/invoices.svg";
import leadsIcon from "@/assets/icons/sidebar/leads.svg";
import notificationIcon from "@/assets/icons/sidebar/notifications.svg";
import freightIcon from "@/assets/icons/sidebar/freights.svg";
import salesIcon from "@/assets/icons/sidebar/sales.svg";
import communicationIcon from "@/assets/icons/sidebar/communication.svg";

import activeBgImage from "@/assets/images/active-bg.png";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavGroup =
  | "dashboard"
  | "users"
  | "messages"
  | "teams"
  | "gallery"
  | "analytics"
  | "documents"
  | "settings"
  | "links"
  | "accounts"
  | "reports"
  | "construction"
  | "ai-marketing"
  | "deliveries"
  | "notifications"
  | "awarded-freight"
  | "sales"
  | "communication";

interface NavigationItem {
  path: string;
  label: string;
  collapsible?: boolean;
  icon?: string;
  subItems?: {
    path: string;
    label: string;
    badge?: number;
    icon?: string;
  }[];
}
interface NavigationGroup {
  id: NavGroup;
  icon: string;
  label: string;
  color: string;
  link: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    id: "dashboard" as NavGroup,
    icon: dashboardIcon,
    label: "Dashboard",
    color: "bg-[#1e3a8a]",
    link: "/dashboard",
    items: [],
  },

  {
    id: "users" as NavGroup,
    icon: customerIcon,
    label: "Customer",
    color: "bg-[#EAB308]",
    link: "/customers",
    items: [],
  },

  {
    id: "links" as NavGroup,
    icon: leadsIcon,
    label: "Leads",
    color: "bg-[#a855f7]",
    link: "/leads",
    items: [
      {
        path: "/leads/follow-up",
        label: "Follow ups",
        collapsible: true,
        subItems: [
          { path: "/leads/follow-up", label: "Overview" },
          {
            path: "/leads/follow-up/communication-timeline",
            label: "Lead Communication Timeline",
          },
          {
            path: "/leads/follow-up/smart-reminders",
            label: "Smart Follow up Reminders",
          },
          {
            path: "/leads/follow-up/script-generator",
            label: "AI Follow-Up Script Generator",
          },
          { path: "/leads/follow-up/scoring", label: "Lead Scoring" },
          { path: "/leads/follow-up/kpis", label: "Follow-Up KPIs" },
        ],
      },
      { path: "/leads/ai-marketing", label: "AI Support" },
      // { path: "/leads/escalated-queries", label: "Escalated Queries" },
      // escalated queries
      // payment follow-up
      {
        path: "/leads/payment-follow-up",
        label: "Payment Follow-Up",
      },
      // new quotation list
      {
        path: "/leads/quotation-list",
        label: "Quote List",
      },
      {
        path: "/leads/escalated",
        label: "Escalated Leads",
      },
      {
        path: "/leads/purchase-orders",
        label: "All Purchase Orders",
      },
    ],
  },

  {
    id: "messages" as NavGroup,
    icon: callIcon,
    label: "Communication",
    color: "bg-[#3AB449]",
    link: "/communication",
    items: [],
  },

  // notification
  {
    id: "notifications" as NavGroup,
    icon: notificationIcon,
    label: "Notifications",
    color: "bg-black",
    link: "/notifications",
    items: [],
  },

  {
    id: "documents" as NavGroup,
    icon: invoices,
    label: "Invoices",
    color: "bg-[#a855f7]",
    link: "/invoice",
    items: [
      // invite list
      // { path: "/invoice/list", label: "Invoice List" },
      // sales growth
      // {
      //   path: "/invoice/sales-growth",
      //   label: "Sales Growth",
      // },
    ],
  },
  {
    id: "deliveries" as NavGroup,
    icon: deliveryIcon,
    label: "Customer Delivery",
    color: "bg-[#F54900]",
    link: "/deliveries",
    items: [
      // project deliveries
      {
        path: "/deliveries/projects",
        label: "Project Deliveries",
      },
      // request delivery/change
      {
        path: "/customers/request-delivery-change",
        label: "Request Delivery / Change",
      },
    ],
  },
  // awarded freight
  {
    id: "awarded-freight" as NavGroup,
    icon: freightIcon,
    label: "Awarded Freight",
    color: "bg-[#9810FA]",
    link: "/awarded-freight",
    items: [],
  },
  {
    id: "sales" as NavGroup,
    icon: salesIcon,
    label: "Sales",
    color: "bg-[#F54900]",
    link: "/sales",
    items: [],
  },
  {
    id: "communication" as NavGroup,
    icon: communicationIcon,
    label: "Communication",
    color: "bg-[#155DFC]",
    link: "/customer-communication",
    items: [],
  },
  // sales
  // communication
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMainCollapsed: boolean;
  setIsMainCollapsed: (val: boolean) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isMainCollapsed = false,
  setIsMainCollapsed,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredGroup, setHoveredGroup] = useState<{
    label: string;
    top: number;
    left: number;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => {
      return new Set(
        navigationGroups.flatMap((group) =>
          group.items
            .filter((item) => item.collapsible && item.subItems)
            .map((item) => item.path),
        ),
      );
    },
  );

  const currentPath = location.pathname;

  // Determine active group based on current path
  const activeGroup =
    navigationGroups.find((group) => {
      if (
        currentPath === group.link ||
        currentPath.startsWith(`${group.link}/`)
      ) {
        return true;
      }
      return group.items.some((item) => {
        if (item.path === "/") {
          return currentPath === "/";
        }
        if (item.collapsible && item.subItems) {
          return item.subItems.some((subItem) =>
            currentPath.startsWith(subItem.path),
          );
        }
        return currentPath.startsWith(item.path);
      });
    }) || navigationGroups[0];

  // Auto-expand collapsible section if any of its child routes is active
  useEffect(() => {
    activeGroup?.items.forEach((item) => {
      if (item.collapsible && item.subItems) {
        const fullPath = location.pathname + location.search;
        const isAnySubItemActive = item.subItems.some(
          (subItem) => fullPath === subItem.path,
        );
        if (isAnySubItemActive) {
          setCollapsedSections((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.path);
            return newSet;
          });
        }
      }
    });
  }, [location.pathname, location.search, activeGroup]);

  const toggleSection = (path: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Get the index of the active group
  const activeGroupIndex = navigationGroups.findIndex(
    (group) => group.id === activeGroup.id,
  );

  // Calculate padding based on active group index
  // Each icon with gap is approximately 48px (36px icon + 20px gap)
  const calculatedPadding = 10 + activeGroupIndex * 56;

  // Calculate the height needed for active group items
  const activeGroupItemsHeight =
    40 +
    activeGroup.items.reduce((total, item) => {
      let height = 40; // Base item height (py-2 + content)
      if (
        item.collapsible &&
        item.subItems &&
        !collapsedSections.has(item.path)
      ) {
        height += item.subItems.length * 36; // Sub-items are slightly smaller
      }
      return total + height;
    }, 0);

  // Top section height (header with UserMenu, buttons, border, padding)
  const topSectionHeight = 120;

  // Determine final padding: use calculated padding if content fits, otherwise use 5
  const menuPaddingTop =
    activeGroupItemsHeight + calculatedPadding + topSectionHeight + 20 <
    window.innerHeight
      ? calculatedPadding
      : 10;

  const handleGroupChange = (group: (typeof navigationGroups)[0]) => {
    navigate(group.link);
    setIsMainCollapsed(false);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`flex fixed inset-y-0 left-0 lg:left-0 lg:top-0 z-50 transition-transform duration-300 lg:translate-x-0 h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Icon Sidebar */}
        <aside
          style={{ scrollbarGutter: "stable", direction: "rtl" }}
          className={`w-18 pt-28 pb-8 bg-sidebar h-screen flex flex-col items-center gap-4 z-40 overflow-y-scroll overflow-x-visible thin-scrollbar relative`}
        >
          <div style={{ direction: "ltr" }}>
            <nav className="flex flex-col gap-5">
              {navigationGroups.map((group) => {
                const iconSrc = group.icon as string;
                const isActive = activeGroup.id === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => handleGroupChange(group)}
                    onMouseEnter={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setHoveredGroup({
                        label: group.label,
                        top: rect.top + rect.height / 2,
                        left: rect.left - 4,
                      });
                    }}
                    onMouseLeave={() => setHoveredGroup(null)}
                    className={`relative flex items-center justify-center transition-all group focus:outline-none`}
                  >
                    {isActive && (
                      <img
                        src={activeBgImage}
                        alt="Active background"
                        className="absolute -right-3 max-w-14 **: object-contain"
                      />
                    )}
                    <div
                      className={`z-50 relative size-10 flex items-center justify-center rounded-full ${
                        group.color
                      } ${isActive ? "" : ""} group-hover:scale-105`}
                    >
                      <img
                        src={iconSrc}
                        alt={group.label}
                        className="max-w-5 max-h-5 object-contain"
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {hoveredGroup && (
            <div
              className="fixed flex items-center bg-white rounded-full py-1 pl-8 pointer-events-none whitespace-nowrap shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1),0_8px_8px_-6px_rgba(0,0,0,0.1)] z-40 -translate-y-1/2"
              style={{ top: hoveredGroup.top, left: hoveredGroup.left }}
            >
              <div className="w-10 h-10 shrink-0" />
              <span className="ml-4 font-normal text-black text-sm lg:text-base tracking-tight">
                {hoveredGroup.label}
              </span>
            </div>
          )}
        </aside>

        {/* Main Sidebar */}
        <aside
          className={cn(
            "bg-[#E8EFF9] h-full flex flex-col overflow-y-auto thin-scrollbar z-30 transition-all duration-300",
            isMainCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-56",
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          {/* Header */}
          <div className="p-2 border-b relative">
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Sales User
                  </h2>
                  <p className="text-xs text-gray-500">sales@steelpro.com</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent hidden lg:block"
                onClick={() => setIsMainCollapsed(true)}
              >
                <ChevronLeftIcon />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
              <Button
                className="rounded bg-gray-300 px-4 text-foreground hover:bg-gray-400"
                size="sm"
              >
                <span>Today</span>
              </Button>
              <div className="flex gap-1">
                <button className="hover:text-gray-600">
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button className="hover:text-gray-600">
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            className="flex-1 p-3 px-3"
            style={{ paddingTop: `${menuPaddingTop}px` }}
          >
            <div className="space-y-2">
              <NavLink
                to={activeGroup.link}
                onClick={handleNavClick}
                className={() =>
                  cn(
                    "block px-4 py-2 rounded-md transition-colors text-sm w-[95%] mb-5 text-white",
                    activeGroup.color,
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <span>{activeGroup.label}</span>
                </div>
              </NavLink>

              {activeGroup?.items.map((item) => {
                if (item.collapsible && item.subItems) {
                  const isExpanded = !collapsedSections.has(item.path);
                  const fullPath = location.pathname + location.search;
                  const isAnySubItemActive = item.subItems.some(
                    (subItem) => fullPath === subItem.path,
                  );

                  return (
                    <div key={item.path}>
                      <button
                        onClick={() => toggleSection(item.path)}
                        className={cn(
                          "w-full flex items-center justify-between text-sm px-4 py-2 rounded transition-colors bg-white",
                          {
                            "ring shadow-lg": isAnySubItemActive,
                          },
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-gray-500">
                            <SidebarItemIcon src={item.icon} alt={item.label} />
                          </span>
                          {item.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUpIcon className="size-4" />
                        ) : (
                          <ChevronDownIcon className="size-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 mb-1 space-y-2">
                          {item.subItems.map((subItem) => {
                            const fullSubPath =
                              location.pathname + location.search;
                            const isActiveExact = fullSubPath === subItem.path;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                onClick={handleNavClick}
                                className={() =>
                                  cn(
                                    "block px-4 py-2 rounded transition-colors text-sm",
                                    {
                                      [`text-white ${activeGroup.color}`]:
                                        isActiveExact,
                                      "bg-white shadow": !isActiveExact,
                                      // islast
                                      // "mb-6":
                                      //   subItem ===
                                      //   item.subItems?.[
                                      //     item.subItems.length - 1
                                      //   ],
                                    },
                                  )
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {subItem.icon && (
                                      <span
                                        className={cn(
                                          isActiveExact
                                            ? "text-white"
                                            : "text-gray-500",
                                        )}
                                      >
                                        <SidebarItemIcon
                                          className={cn({
                                            "brightness-0 invert":
                                              isActiveExact,
                                          })}
                                          src={subItem.icon}
                                          alt={subItem.label}
                                        />
                                      </span>
                                    )}
                                    <span>{subItem.label}</span>
                                  </div>

                                  {subItem.badge ? (
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 shadow text-sm text-gray-600">
                                      {subItem.badge}
                                    </div>
                                  ) : null}
                                </div>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "block px-4 py-2 rounded transition-colors text-sm",
                        {
                          [`text-white ${activeGroup.color}`]: isActive,
                        },
                        {
                          "bg-white shadow-lg": !isActive,
                        },
                      )
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-2">
                        <SidebarItemIcon
                          src={item.icon}
                          alt={item.label}
                          className={cn({
                            "brightness-0 invert": isActive,
                          })}
                        />
                        <span>{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}

function SidebarItemIcon({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("max-h-5 max-w-5 object-contain", className)}
    />
  );
}
