import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryApi from '../api/categories';

export const categoryKeys = {
  all: ['categories'],
  lists: () => ['categories', 'list'],
  byType: (type) => ['categories', 'list', { type }],
  detail: (id) => ['categories', 'detail', id],
};

// Helper: Identify system categories defensively (null user_id)
export const isSystemCategory = (category) => category?.user_id === null;

export function useCategories(type = null) {
  return useQuery({
    queryKey: type ? categoryKeys.byType(type) : categoryKeys.all,
    queryFn: () => categoryApi.fetchCategories(type ? { type } : {}),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.updateCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: categoryKeys.all });
      const prev = qc.getQueryData(categoryKeys.all);

      qc.setQueryData(categoryKeys.all, (old) => 
        Array.isArray(old) ? old.filter(c => c.id !== id) : old
      );

      return { prev };
    },
    onError: (error, id, context) => {
      if (context?.prev) {
        qc.setQueryData(categoryKeys.all, context.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
