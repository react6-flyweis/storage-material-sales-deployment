import StatCard from "@/components/ui/stat-card";
import SalesFunnel from "@/components/dashboard/sales-funnel";
import AiSupportSummary from "@/components/dashboard/ai-support-summary";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import PerformanceTrends from "@/components/dashboard/performance-trends";
import TodaysTask from "@/components/dashboard/todays-task";

import LeadsIcon from "@/assets/icons/dashboard/leads.svg";
import ConfirmedIcon from "@/assets/icons/dashboard/confirmed.svg";
import ValueIcon from "@/assets/icons/dashboard/value.svg";
import RevenueIcon from "@/assets/icons/dashboard/revenue.svg";
import { useState } from "react";
import { useDashboardMetricsQuery } from "@/lib/metrics";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>();
  const { data: metrics, isPending } = useDashboardMetricsQuery(period);
  const loading = isPending && !metrics;

  return (
    <div className="">
      {/* Tabs */}
      <FilterTabs onPeriodChange={setPeriod} />

      <div className="lg:pr-5 lg:pt-5 p-5 lg:p-0 space-y-5">
        {/* Header */}
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Complete overview of your leads, sales pipeline, and revenue
            performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={metrics?.totalLeads ?? 0}
            icon={<img src={LeadsIcon} alt="leads" className="size-7" />}
            color="bg-blue-500"
            navigateTo="/leads"
            loading={loading}
          />

          <StatCard
            title="Leads Closed"
            value={metrics?.leadsClosed ?? 0}
            icon={
              <img src={ConfirmedIcon} alt="confirmed" className="size-7" />
            }
            color="bg-green-500"
            navigateTo="/leads"
            loading={loading}
          />

          <StatCard
            title="Follow-ups Pending"
            value={metrics?.followUpPending ?? 0}
            icon={<img src={ValueIcon} alt="value" className="size-7" />}
            color="bg-yellow-500"
            navigateTo="/leads/follow-up"
            loading={loading}
          />

          <StatCard
            title="AI Escalations"
            value={metrics?.escalationsPending ?? 0}
            icon={<img src={RevenueIcon} alt="revenue" className="size-7" />}
            color="bg-red-500"
            navigateTo="/leads/escalated-queries"
            loading={loading}
          />
        </div>

        {/* Chart Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesFunnel period={period} />
          </div>
          <AiSupportSummary />
        </div>

        {/* chart row 2 2:1 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PerformanceTrends />
          </div>
          <div className="lg:col-span-2">
            <TodaysTask />
          </div>
        </div>
      </div>
    </div>
  );
}
