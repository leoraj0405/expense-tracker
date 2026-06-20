import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { SessionUser } from '../types/entities';

export function useRequireAuth(redirectTo = '/login'): SessionUser | null {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loginUser) {
      navigate(redirectTo);
    }
  }, [loginUser, navigate, redirectTo]);

  return loginUser;
}
