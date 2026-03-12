import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api";
import { profileKeys } from "./useProfile";

export const transactionKeys = {
  all: ["transactions"],
  list: (filters) => [...transactionKeys.all, "list", filters],
};

export function useTransactions(pageSize = 15, windowId = null) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list({ pageSize, windowId }),
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: String(pageParam),
        limit: String(pageSize),
        ...(windowId && { windowId }),
      };
      const res = await transactionApi.getAll(params);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionApi.create(data),
    onSuccess: () => {
      // Invalidate transactions list and profile data (balance)
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
