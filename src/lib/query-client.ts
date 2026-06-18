import { QueryClient } from "@tanstack/react-query";

export const QUERY_SETTINGS = {
  // Demo Mode: Set to false to disable react-query optimizations
  ENABLE_OPTIMIZATIONS: false,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: QUERY_SETTINGS.ENABLE_OPTIMIZATIONS ? false : true,
      retry: QUERY_SETTINGS.ENABLE_OPTIMIZATIONS ? 1 : 0,
      staleTime: QUERY_SETTINGS.ENABLE_OPTIMIZATIONS ? 60 * 1000 : 0,
      gcTime: QUERY_SETTINGS.ENABLE_OPTIMIZATIONS ? 5 * 60 * 1000 : 0,
    },
    mutations: {
      retry: 0,
    },
  },
});


