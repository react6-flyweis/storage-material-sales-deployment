import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import {
  getPeriodRange,
  type DateRange,
  type Period,
} from "@/components/FilterTabs";

export type DashboardMetrics = {
  totalLeads: number;
  leadsClosed: number;
  followUpPending: number;
  escalationsPending: number;
  followUpsPending: number;
  aiEscalations: number;
};

export type LeadsStats = {
  totalLeads: number;
  leadsClosed: number;
  followUpPending: number;
  escalationsPending: number;
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

type LeadsStatsResponse = {
  success: boolean;
  message: string;
  data: LeadsStats;
};

type ConversionFunnelResponse = {
  success: boolean;
  message: string;
  data: ConversionFunnelMetrics;
};

const formatDateParam = (date: Date) => date.toISOString().slice(0, 10);

export async function getDashboardMetrics(
  dateRange: DateRange,
): Promise<DashboardMetrics> {
  // if no date range don't add
  const params =
    dateRange.startDate && dateRange.endDate
      ? {
        startDate: formatDateParam(dateRange.startDate),
        endDate: formatDateParam(dateRange.endDate),
      }
      : {};
  const response = await apiClient.get<DashboardStatsResponse>(
    "/api/sales/dashboard/stats",
    {
      params,
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

export async function getLeadsStats(): Promise<LeadsStats> {
  const response = await apiClient.get<LeadsStatsResponse>(
    "/api/sales/leads/stats",
  );

  return response.data.data;
}

export async function getConversionFunnelMetrics(
  dateRange: DateRange,
): Promise<ConversionFunnelMetrics> {
  const params =
    dateRange.startDate && dateRange.endDate
      ? {
        startDate: formatDateParam(dateRange.startDate),
        endDate: formatDateParam(dateRange.endDate),
      }
      : {};
  const response = await apiClient.get<ConversionFunnelResponse>(
    "/api/sales/dashboard/conversion-funnel",
    {
      params,
    },
  );

  return response.data.data;
}

export function useDashboardMetricsQuery(period?: Period) {
  const dateRange = getPeriodRange(period);
  return useQuery({
    queryKey: [
      "sales",
      "dashboard",
      "stats",
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: () => getDashboardMetrics(dateRange),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useLeadsStatsQuery() {
  return useQuery({
    queryKey: ["sales", "leads", "stats"],
    queryFn: getLeadsStats,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export type FollowUpStats = {
  total: number;
  upcoming: number;
  completed: number;
  overdue: number;
};

type FollowUpStatsResponse = {
  success: boolean;
  message: string;
  data: FollowUpStats;
};

export async function getFollowUpStats(): Promise<FollowUpStats> {
  const response = await apiClient.get<FollowUpStatsResponse>(
    "/api/sales/followups/stats",
  );

  return response.data.data;
}

export function useFollowUpStatsQuery() {
  return useQuery({
    queryKey: ["sales", "followups", "stats"],
    queryFn: getFollowUpStats,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useConversionFunnelQuery(period?: Period) {
  const dateRange = getPeriodRange(period);
  return useQuery({
    queryKey: ["sales", "dashboard", "conversion-funnel", dateRange.startDate, dateRange.endDate],
    queryFn: () => getConversionFunnelMetrics(dateRange),
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

export async function getCustomerStats(
  dateRange: DateRange,
): Promise<CustomerStats> {
  const params = dateRange.startDate && dateRange.endDate
    ? {
      startDate: formatDateParam(dateRange.startDate),
      endDate: formatDateParam(dateRange.endDate),
    }
    : {};
  const response = await apiClient.get<CustomerStatsResponse>(
    "/api/sales/customers/stats",
    {
      params
    },
  );

  return response.data.data;
}

export function useCustomerStatsQuery(period?: Period) {
  const dateRange = getPeriodRange(period);
  return useQuery({
    queryKey: ["sales", "customers", "stats", dateRange.startDate, dateRange.endDate],
    queryFn: () => getCustomerStats(dateRange),
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
