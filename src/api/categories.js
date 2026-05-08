import api from './axios';

export const fetchCategories = (params) => 
  api.get('/categories', { params }).then(res => res.data.data);

export const createCategory = (payload) => 
  api.post('/categories', payload).then(res => res.data.data);

export const updateCategory = ({ id, ...payload }) => 
  api.patch(`/categories/${id}`, payload).then(res => res.data.data);

export const deleteCategory = (id) => 
  api.delete(`/categories/${id}`);
