import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, windowApi } from "@/services/api";

export const dashboardKeys = {
  all: ["dashboard"],
  summary: () => [...dashboardKeys.all, "summary"],
  windows: () => [...dashboardKeys.all, "windows"],
  activity: () => [...dashboardKeys.all, "activity"],
};

export function useDashboard() {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const res = await analyticsApi.getSummary();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const windowsQuery = useQuery({
    queryKey: dashboardKeys.windows(),
    queryFn: async () => {
      const res = await windowApi.getAll();
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: async () => {
      const res = await analyticsApi.getRecentActivity();
      return res.data || [];
    },
    staleTime: 30 * 1000,
  });

  return {
    summary: summaryQuery.data,
    windowBreakdown: windowsQuery.data,
    recentActivity: activityQuery.data,
    isLoading: summaryQuery.isLoading || windowsQuery.isLoading || activityQuery.isLoading,
    isError: summaryQuery.isError || windowsQuery.isError || activityQuery.isError,
    error: summaryQuery.error || windowsQuery.error || activityQuery.error,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  };
}
