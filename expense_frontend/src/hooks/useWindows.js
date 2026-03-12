import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { windowApi } from "@/services/api";
import { dashboardKeys } from "./useDashboard";

export const windowKeys = {
  all: ["windows"],
  detail: (id) => [...windowKeys.all, "detail", id],
};

export function useWindows() {
  return useQuery({
    queryKey: windowKeys.all,
    queryFn: async () => {
      const res = await windowApi.getAll();
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useWindow(id) {
  return useQuery({
    queryKey: windowKeys.detail(id),
    queryFn: async () => {
      const res = await windowApi.getById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => windowApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.windows() });
    },
  });
}

export function useUpdateWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => windowApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
      queryClient.invalidateQueries({ queryKey: windowKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.windows() });
    },
  });
}

export function useDeleteWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => windowApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.windows() });
    },
  });
}

export function useAddLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, labels }) => windowApi.addLabels(id, { labels }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: windowKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
    },
  });
}

export function useRemoveLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, labels }) => windowApi.removeLabels(id, { labels }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: windowKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
    },
  });
}

export function useResetWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resetDay }) => windowApi.reset(id, resetDay),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: windowKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: windowKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.windows() });
    },
  });
}
