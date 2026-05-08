import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

// ─── Query Keys ───────────────────────────────────────────────
export const accountKeys = {
  all: ['accounts'],
  lists: () => ['accounts'],
  detail: (id) => ['accounts', id],
};

// ─── API Functions ────────────────────────────────────────────
const fetchAccounts    = () => api.get('/accounts').then(r => r.data.data);
const fetchAccountById = (id) => api.get(`/accounts/${id}`).then(r => r.data.data);
const createAccount    = (payload) => api.post('/accounts', payload).then(r => r.data.data);
const updateAccount    = ({ id, ...payload }) => api.put(`/accounts/${id}`, payload).then(r => r.data.data);
const deleteAccount    = (id) => api.delete(`/accounts/${id}`);
const reconcileAccount = ({ id, ...payload }) => api.post(`/accounts/${id}/reconcile`, payload).then(r => r.data);

// ─── Query Hooks ──────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: fetchAccounts,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useAccountDetail(id) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => fetchAccountById(id),
    enabled: !!id,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: accountKeys.lists() });
      const prevAccounts = qc.getQueryData(accountKeys.lists());

      // Optimistic delete
      qc.setQueryData(accountKeys.lists(), (old) =>
        Array.isArray(old) ? old.filter(a => a.id !== id) : old
      );

      return { prevAccounts };
    },
    onError: (_err, _id, context) => {
      if (context?.prevAccounts) {
        qc.setQueryData(accountKeys.lists(), context.prevAccounts);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      // Invalidate transactions because cascade delete will remove them!
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['budgets'] }); // Just in case budgets were affected
    },
  });
}

export function useReconcileAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reconcileAccount,
    onSuccess: (data, variables) => {
      // Triple Invalidation as requested + budgets just in case
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
