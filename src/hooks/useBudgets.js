// src/hooks/useBudgets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios'; // axios instance dengan baseURL & interceptor token

// ─── Query Keys ───────────────────────────────────────────────
export const budgetKeys = {
  all: ['budgets'],
  list: (filters) => ['budgets', filters],
  detail: (id) => ['budgets', id],
  dashboardProgress: ['dashboard', 'budget-progress'],
};

// ─── API Functions ────────────────────────────────────────────
const fetchBudgets = (params) => api.get('/budgets', { params }).then(r => r.data.data);
const fetchBudgetById = (id) => api.get(`/budgets/${id}`).then(r => r.data.data);
const createBudget = (payload) => api.post('/budgets', payload).then(r => r.data.data);
const updateBudget = ({ id, ...payload }) => api.put(`/budgets/${id}`, payload).then(r => r.data.data);
const deleteBudget = (id) => api.delete(`/budgets/${id}`);

// ─── Hooks ────────────────────────────────────────────────────

export function useBudgets(filters = {}) {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: () => fetchBudgets(filters),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useBudgetDetail(id) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => fetchBudgetById(id),
    enabled: !!id,
  });
}

// Hook khusus untuk Dashboard — query key berbeda agar bisa di-invalidate terpisah
export function useBudgetProgress(period) {
  return useQuery({
    queryKey: budgetKeys.dashboardProgress,
    queryFn: () => fetchBudgets({ period }),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.dashboardProgress });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBudget,
    onMutate: async (updatedBudget) => {
      // Cancel in-flight refetch agar tidak overwrite optimistic update
      await qc.cancelQueries({ queryKey: budgetKeys.all });

      // Snapshot data sebelum diubah (untuk rollback)
      const prevList = qc.getQueriesData({ queryKey: budgetKeys.all });

      // Optimistically update semua varian cache list yang ada
      qc.setQueriesData({ queryKey: budgetKeys.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(b => b.id === updatedBudget.id ? { ...b, ...updatedBudget } : b);
      });

      return { prevList };
    },
    onError: (_err, _vars, context) => {
      // Rollback jika request gagal
      context?.prevList?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.dashboardProgress });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: budgetKeys.all });

      const prevList = qc.getQueriesData({ queryKey: budgetKeys.all });

      qc.setQueriesData({ queryKey: budgetKeys.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter(b => b.id !== id);
      });

      return { prevList };
    },
    onError: (_err, _vars, context) => {
      context?.prevList?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.dashboardProgress });
    },
  });
}
