'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from './useAuth';
import type { SessionUser } from '@/types/entities';

export function useRequireAuth(redirectTo = '/login'): SessionUser | null {
  const { loginUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loginUser) {
      router.push(redirectTo);
    }
  }, [loginUser, router, redirectTo]);

  return loginUser;
}
