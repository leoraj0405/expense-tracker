export function resolveProfileUrl(
  profileImage: string | null | undefined,
): string | null {
  if (!profileImage || profileImage === 'null') return null;
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  return `/uploads/${profileImage}`;
}

export function isBlobUrl(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith('https://') || value?.startsWith('http://'));
}
