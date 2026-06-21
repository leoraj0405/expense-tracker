import { API_PATHS, apiRequest } from './apiClient';
import type { GroupExpenseRequest } from '@/types/api';
import type { GroupExpense } from '@/types/entities';

export const groupExpenseService = {
  listByGroup(groupId: string) {
    return apiRequest<null, GroupExpense>(`${API_PATHS.GROUP_EXPENSE}/onegroup/${groupId}`);
  },

  getById(id: string) {
    return apiRequest<GroupExpense>(`${API_PATHS.GROUP_EXPENSE}/${id}`);
  },

  create(data: GroupExpenseRequest) {
    return apiRequest<GroupExpense>(API_PATHS.GROUP_EXPENSE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: GroupExpenseRequest) {
    return apiRequest<GroupExpense>(`${API_PATHS.GROUP_EXPENSE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<GroupExpense>(`${API_PATHS.GROUP_EXPENSE}/${id}`, { method: 'DELETE' });
  },
};
