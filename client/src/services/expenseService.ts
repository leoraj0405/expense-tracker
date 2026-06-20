import { API_PATHS, apiRequest } from './apiClient';
import type { ExpenseRequest } from '../types/api';
import type { Expense, PaginationMeta } from '../types/entities';

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
  /** Legacy month filter YYYY-MM */
  month?: string;
  parentAuth?: boolean;
}

export const expenseService = {
  listByUser(userId: string, params: ExpenseListParams = {}) {
    const { parentAuth, ...queryParams } = params;
    const query = new URLSearchParams();
    if (queryParams.page) query.append('page', String(queryParams.page));
    if (queryParams.limit) query.append('limit', String(queryParams.limit));
    if (queryParams.startDate) query.append('startDate', queryParams.startDate);
    if (queryParams.endDate) query.append('endDate', queryParams.endDate);
    if (queryParams.month) query.append('date', queryParams.month);
    const qs = query.toString();
    return apiRequest<PaginationMeta, Expense>(
      `${API_PATHS.EXPENSE}/userexpense/${userId}${qs ? `?${qs}` : ''}`,
      parentAuth ? { auth: false, parentAuth: true } : undefined,
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
