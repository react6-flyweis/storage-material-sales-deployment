import { Outlet, useLocation } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LeadSocketListener } from "@/components/leads/lead-socket-listener";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMainCollapsed, setIsMainCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      try {
        scrollRef.current.scrollTo({ top: 0, left: 0 });
      } catch {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeadSocketListener />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMainCollapsed={isMainCollapsed}
        setIsMainCollapsed={setIsMainCollapsed}
      />
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col ml-0 overflow-auto transition-all duration-300",
          isMainCollapsed ? "lg:ml-18" : "lg:ml-74",
        )}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 bg-[#E8EFF9] pb-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
