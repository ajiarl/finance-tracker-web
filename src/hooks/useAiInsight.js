import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useAiInsight = (filters) => {
  return useQuery({
    queryKey: ['ai-insight', filters],
    queryFn: async () => {
      const { data } = await api.get('/ai-insight', { params: filters });
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — avoid spamming Gemini
    refetchOnWindowFocus: false,
    retry: 1, // Only 1 retry — Gemini free tier has tight rate limits
  });
};
