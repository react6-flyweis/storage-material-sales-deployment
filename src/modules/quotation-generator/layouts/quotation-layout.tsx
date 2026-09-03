import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { QuotationSidebar } from "./quotation-sidebar";
import { Header } from "@/components/header";
import { PageTracker } from "@/components/page-tracker";
import { LeadSocketListener } from "@/components/leads/lead-socket-listener";

interface QuotationLayoutProps {
  children?: React.ReactNode;
}

export function QuotationLayout({ children }: QuotationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a192f] text-slate-100 font-sans">
      <PageTracker />
      <LeadSocketListener />

      {/* Custom Quotation Sidebar */}
      <QuotationSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col min-w-0 overflow-auto transition-all duration-300"
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 bg-[#E8EFF9] p-5 text-slate-900">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default QuotationLayout;
