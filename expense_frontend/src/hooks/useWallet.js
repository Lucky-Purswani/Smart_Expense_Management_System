import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/services/api";

export const walletKeys = {
  all: ["wallet"],
  detail: () => [...walletKeys.all, "detail"],
};

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.detail(),
    queryFn: async () => {
      const res = await walletApi.getWallet();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}
