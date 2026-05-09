import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axios';

export const useAnalytics = (filters) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics', { params: filters });
      return data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
