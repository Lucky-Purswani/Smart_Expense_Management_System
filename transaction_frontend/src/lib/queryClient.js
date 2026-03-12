import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default stale time
      gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
      retry: 1,
      refetchOnWindowFocus: true, // Refresh when returning to tab
    },
  },
});
