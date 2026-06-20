import { API_PATHS, apiRequest } from './apiClient';
import type { GroupMemberRequest } from '../types/api';
import type { GroupMember } from '../types/entities';

export const groupMemberService = {
  listByGroup(groupId: string) {
    return apiRequest<null, GroupMember>(`${API_PATHS.GROUP_MEMBER}/onegroup/${groupId}`);
  },

  create(data: GroupMemberRequest) {
    return apiRequest<GroupMember | { message: string }>(API_PATHS.GROUP_MEMBER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<GroupMember>(`${API_PATHS.GROUP_MEMBER}/${id}`, { method: 'DELETE' });
  },
};
