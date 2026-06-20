import { API_PATHS, apiRequest } from './apiClient';
import type { ExpenseRequest } from '../types/api';
import type { Expense, PaginationMeta } from '../types/entities';

export const expenseService = {
  listByUser(userId: string, params: { page?: number; date?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.date) query.append('date', params.date);
    if (params.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiRequest<PaginationMeta, Expense>(
      `${API_PATHS.EXPENSE}/userexpense/${userId}${qs ? `?${qs}` : ''}`
    );
  },

  getById(id: string) {
    return apiRequest<Expense>(`${API_PATHS.EXPENSE}/${id}`);
  },

  create(data: ExpenseRequest) {
    return apiRequest<Expense>(API_PATHS.EXPENSE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: ExpenseRequest) {
    return apiRequest<Expense>(`${API_PATHS.EXPENSE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<Expense>(`${API_PATHS.EXPENSE}/${id}`, { method: 'DELETE' });
  },
};
