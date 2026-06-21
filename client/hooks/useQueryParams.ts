'use client';

import { useSearchParams } from 'next/navigation';

/** Safe wrapper — Next.js may return null during prerender. */
export function useQueryParams() {
  return useSearchParams() ?? new URLSearchParams();
}
