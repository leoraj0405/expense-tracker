import type { SessionUser } from '../types/entities';

const STORAGE_KEY_USER = 'et_session_user';
const STORAGE_KEY_TOKEN = 'et_session_token';
const STORAGE_KEY_PARENT_TOKEN = 'et_parent_token';
const STORAGE_KEY_PARENT_CHILDREN = 'et_parent_children';
export const AUTH_CHANGED_EVENT = 'et-auth-changed';

const XOR_KEY = 'et-xor-key-2024';

function xorEncode(value: string): string {
  return value
    .split('')
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length))
    )
    .join('');
}

function encode(value: string): string {
  return btoa(xorEncode(value));
}

function decode(encoded: string): string {
  try {
    return xorEncode(atob(encoded));
  } catch {
    return '';
  }
}

function dispatchAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export interface AuthSessionInput {
  user: SessionUser | Record<string, unknown>;
  token: string;
}

export interface ParentSessionInput {
  token: string;
  children: SessionUser[] | Record<string, unknown>[];
}

export function saveAuthSession({ user, token }: AuthSessionInput): void {
  localStorage.setItem(STORAGE_KEY_USER, encode(JSON.stringify(user)));
  localStorage.setItem(STORAGE_KEY_TOKEN, encode(token));
  dispatchAuthChanged();
}

export function saveParentSession({ token, children }: ParentSessionInput): void {
  localStorage.setItem(STORAGE_KEY_PARENT_TOKEN, encode(token));
  localStorage.setItem(STORAGE_KEY_PARENT_CHILDREN, encode(JSON.stringify(children)));
}

export function getLoggedUser<T = Record<string, unknown>>(): T | null {
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(decode(raw)) as T;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (!raw) return null;
  return decode(raw) || null;
}

export function getParentToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEY_PARENT_TOKEN);
  if (!raw) return null;
  return decode(raw) || null;
}

export function getParentChildren<T = Record<string, unknown>>(): T[] {
  const raw = localStorage.getItem(STORAGE_KEY_PARENT_CHILDREN);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decode(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isParentAuthenticated(): boolean {
  return Boolean(getParentToken());
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  dispatchAuthChanged();
}

export function clearParentSession(): void {
  localStorage.removeItem(STORAGE_KEY_PARENT_TOKEN);
  localStorage.removeItem(STORAGE_KEY_PARENT_CHILDREN);
}
