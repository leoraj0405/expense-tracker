export function mongoId(id: string) {
  return { _id: id };
}

export function formatUserRef(user: {
  id: string;
  name?: string | null;
  email?: string | null;
}) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function formatCategoryRef(category: { id: string; name?: string }) {
  return {
    _id: category.id,
    name: category.name,
  };
}

export function formatGroupRef(group: { id: string; name?: string }) {
  return {
    _id: group.id,
    name: group.name,
  };
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'driverError' in error &&
    (error as { driverError?: { errno?: number } }).driverError?.errno === 1062
  );
}
