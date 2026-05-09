import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { accountKeys } from './useAccounts';
import { budgetKeys } from './useBudgets';
import { categoryKeys } from './useCategories';

export const useExecuteImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ importId, accountId, columnMappings, dateFormat }) => {
      const { data } = await api.post(`/imports/${importId}/map`, {
        account_id: accountId,
        column_mappings: columnMappings,
        date_format: dateFormat || undefined,
      });
      return data.data;
    },
    onSuccess: (data, variables) => {
      // 1. Transactions list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // 2. Account balance mutated
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });

      // 3. Dashboard aggregates
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // 4. Budget progress
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.dashboardProgress });

      // 5. Category summaries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
