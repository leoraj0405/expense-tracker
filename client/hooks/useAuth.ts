'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getLoggedUser,
  clearAuthSession,
  AUTH_CHANGED_EVENT,
} from '@/utils/authStorage';
import { getUserId } from '@/utils/entity';
import type { SessionUser } from '@/types/entities';

export function useAuth() {
  const [loginUser, setLoginUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setLoginUser(getLoggedUser<SessionUser>());
    const refresh = () => setLoginUser(getLoggedUser<SessionUser>());
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setLoginUser(null);
  }, []);

  return {
    loginUser,
    user: loginUser,
    isAuthenticated: !!loginUser,
    logout,
    getUserId: () => getUserId(loginUser),
  };
}
