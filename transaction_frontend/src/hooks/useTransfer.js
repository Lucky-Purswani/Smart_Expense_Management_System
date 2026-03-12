import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api";
import { transactionKeys } from "./useTransactions";
import { profileKeys } from "./useProfile";

export function useTransferMoney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionApi.transfer(data),
    onSuccess: () => {
      // Invalidate both transactions and profile data
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
