import { API_PATHS, apiRequest } from './apiClient';
import type { GroupRequest } from '@/types/api';
import type { Group } from '@/types/entities';

export const groupService = {
  listByUser(userId: string) {
    return apiRequest<null, Group>(`${API_PATHS.GROUP}/usergroups/${userId}`);
  },

  getById(id: string) {
    return apiRequest<Group>(`${API_PATHS.GROUP}/${id}`);
  },

  create(data: GroupRequest) {
    return apiRequest<Group>(API_PATHS.GROUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: GroupRequest) {
    return apiRequest<Group>(`${API_PATHS.GROUP}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<Group>(`${API_PATHS.GROUP}/${id}`, { method: 'DELETE' });
  },
};
