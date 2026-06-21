import type { CategoryRef, EntityRef, SessionUser, User } from '@/types/entities';

export function getEntityId(entity?: EntityRef | null): string | null {
  if (!entity) return null;
  return entity.id || entity._id || null;
}

export function getUserId(user?: SessionUser | null): string | null {
  if (!user) return null;
  return user.data?.id || user.data?._id || user.id || user._id || null;
}

export function normalizeUser(userData?: User | null): SessionUser | null {
  if (!userData) return null;
  const id = userData.id || userData._id;
  const normalized: User = {
    ...userData,
    id: id!,
    _id: id,
  };
  return {
    ...normalized,
    data: normalized,
  };
}

export function getCategoryName(category?: CategoryRef | CategoryRef[] | null): string {
  if (!category) return '-';
  if (Array.isArray(category)) return category[0]?.name || '-';
  return category.name || '-';
}

export function getCategoryId(category?: CategoryRef | CategoryRef[] | null): string {
  if (!category) return '';
  if (Array.isArray(category)) return getEntityId(category[0]) || '';
  return getEntityId(category) || '';
}
