import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/services/api";

export const profileKeys = {
  all: ["profile"],
  detail: () => [...profileKeys.all, "detail"],
  account: () => [...profileKeys.all, "account"],
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const res = await userApi.getMe();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccount() {
  return useQuery({
    queryKey: profileKeys.account(),
    queryFn: async () => {
      const res = await userApi.getAccount();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}
