import { getToken, getParentToken } from '../utils/authStorage';
import type { ApiResponse } from '../types/api';

const BASE_URL = process.env.REACT_APP_FETCH_URL || 'http://localhost:1000';

export const API_PATHS = {
  USER: '/api/user',
  CATEGORY: '/api/category',
  EXPENSE: '/api/expense',
  GROUP: '/api/group',
  GROUP_MEMBER: '/api/groupmember',
  GROUP_EXPENSE: '/api/groupexpense',
} as const;

export const apiUrl = (path: string): string => `${BASE_URL}${path}`;

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
  parentAuth?: boolean;
  headers?: Record<string, string>;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, parentAuth = false, headers = {}, ...rest } = options;
  const requestHeaders: Record<string, string> = { ...headers };

  if (parentAuth) {
    const parentToken = getParentToken();
    if (parentToken) {
      requestHeaders.Authorization = `Bearer ${parentToken}`;
    }
  } else if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  return fetch(apiUrl(path), {
    ...rest,
    credentials: rest.credentials ?? (parentAuth ? 'include' : 'same-origin'),
    headers: requestHeaders,
  });
}

export async function apiRequest<TItem = unknown, TListItem = TItem>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<TItem, TListItem>> {
  const response = await apiFetch(path, options);
  let body: ApiResponse<TItem, TListItem>;

  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status, 'Invalid server response');
  }

  if (!response.ok || body.errorMessage) {
    throw new ApiError(
      body.statusCode || response.status,
      body.errorMessage || 'Request failed'
    );
  }

  return body;
}

export async function apiRequestVoid(
  path: string,
  options: ApiFetchOptions = {}
): Promise<void> {
  await apiRequest(path, options);
}
