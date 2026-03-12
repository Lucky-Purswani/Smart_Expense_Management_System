import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "@/services/api";
import { dashboardKeys } from "./useDashboard";
import { profileKeys } from "./useProfile";

export const transactionKeys = {
  all: ["transactions"],
  list: (params) => [...transactionKeys.all, "list", params],
  recent: () => [...transactionKeys.all, "recent"],
};

export function useTransactions(pageSize = 15, windowId = null) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list({ pageSize, windowId }),
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        limit: pageSize,
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
    staleTime: 30 * 1000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useTransferMoney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
