import type { Period } from "@/components/FilterTabs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";

export type DashboardMetrics = {
  totalLeads: number;
  leadsClosed: number;
  followUpPending: number;
  escalationsPending: number;
  followUpsPending: number;
  aiEscalations: number;
};

export type ConversionFunnelMetrics = {
  newLeads: number;
  contacted: number;
  inPipeline: number;
  closedWon: number;
};

type DashboardStatsResponse = {
  success: boolean;
  message: string;
  data: {
    totalLeads: number;
    leadsClosed: number;
    followUpPending: number;
    escalationsPending: number;
  };
};

type ConversionFunnelResponse = {
  success: boolean;
  message: string;
  data: ConversionFunnelMetrics;
};

const formatDateParam = (date: Date) => date.toISOString().slice(0, 10);

const getPeriodRange = (period: Period) => {
  const today = new Date();

  if (period === "week") {
    return { startDate: today, endDate: today };
  }

  if (period === "month") {
    return {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    };
  }

  const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;

  return {
    startDate: new Date(today.getFullYear(), quarterStartMonth, 1),
    endDate: today,
  };
};

export async function getDashboardMetrics(
  period: Period,
): Promise<DashboardMetrics> {
  const { startDate, endDate } = getPeriodRange(period);
  const response = await apiClient.get<DashboardStatsResponse>(
    "/api/sales/dashboard/stats",
    {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    },
  );

  const data = response.data.data;

  return {
    totalLeads: data.totalLeads,
    leadsClosed: data.leadsClosed,
    followUpPending: data.followUpPending,
    escalationsPending: data.escalationsPending,
    followUpsPending: data.followUpPending,
    aiEscalations: data.escalationsPending,
  };
}

export async function getConversionFunnelMetrics(
  period: Period,
): Promise<ConversionFunnelMetrics> {
  const { startDate, endDate } = getPeriodRange(period);
  const response = await apiClient.get<ConversionFunnelResponse>(
    "/api/sales/dashboard/conversion-funnel",
    {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    },
  );

  return response.data.data;
}

export function useDashboardMetricsQuery(period: Period) {
  return useQuery({
    queryKey: ["sales", "dashboard", "stats", period],
    queryFn: () => getDashboardMetrics(period),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useConversionFunnelQuery(period: Period) {
  return useQuery({
    queryKey: ["sales", "dashboard", "conversion-funnel", period],
    queryFn: () => getConversionFunnelMetrics(period),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export type CustomerStats = {
  total: number;
  active: number;
  newThisMonth: number;
  returning: number;
};

type CustomerStatsResponse = {
  success: boolean;
  message: string;
  data: CustomerStats;
};

export async function getCustomerStats(period: Period): Promise<CustomerStats> {
  const { startDate, endDate } = getPeriodRange(period);
  const response = await apiClient.get<CustomerStatsResponse>(
    "/api/sales/customers/stats",
    {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    },
  );

  return response.data.data;
}

export function useCustomerStatsQuery(period: Period) {
  return useQuery({
    queryKey: ["sales", "customers", "stats", period],
    queryFn: () => getCustomerStats(period),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

type PerformanceTrendPoint = { date: string; value: number };

type PerformanceTrendResponse = {
  success: boolean;
  message: string;
  data: {
    data: PerformanceTrendPoint[];
    percentageChange: number;
    rangeLabel: string;
  };
};

export async function getPerformanceTrend(
  tab: string,
  range: string,
): Promise<PerformanceTrendResponse["data"]> {
  const response = await apiClient.get<PerformanceTrendResponse>(
    "/api/sales/dashboard/performance-trend",
    {
      params: { tab, range },
    },
  );

  return response.data.data;
}

export function usePerformanceTrendQuery(tab: string, range: string) {
  return useQuery({
    queryKey: ["sales", "dashboard", "performance-trend", tab, range],
    queryFn: () => getPerformanceTrend(tab, range),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
