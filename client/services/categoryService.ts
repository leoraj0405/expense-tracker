import { API_PATHS, apiRequest } from './apiClient';
import type { CategoryRequest } from '@/types/api';
import type { Category, PaginationMeta } from '@/types/entities';

export const categoryService = {
  list(page = 1, limit = 10) {
    return apiRequest<PaginationMeta, Category>(
      `${API_PATHS.CATEGORY}?page=${page}&limit=${limit}`
    );
  },

  getById(id: string) {
    return apiRequest<Category>(`${API_PATHS.CATEGORY}/${id}`);
  },

  create(data: CategoryRequest) {
    return apiRequest<Category>(API_PATHS.CATEGORY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: CategoryRequest) {
    return apiRequest<Category>(`${API_PATHS.CATEGORY}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<Category>(`${API_PATHS.CATEGORY}/${id}`, { method: 'DELETE' });
  },
};
