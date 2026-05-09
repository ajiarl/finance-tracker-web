import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useUploadCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, hasHeader }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('has_header', hasHeader ? '1' : '0');

      const response = await api.post('/imports/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['import', data.import_id], data);
    },
  });
};
