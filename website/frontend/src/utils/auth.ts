export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'currentUser';
export const AUTH_CHANGED_EVENT = 'festivo-auth-changed';

export type AuthUser = {
  username: string;
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  profileImage?: string;
  preferences?: string[];
};

const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payloadPart = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadPart + '='.repeat((4 - (payloadPart.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const emitAuthChanged = (): void => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, partialUser?: Partial<AuthUser>): void => {
  const payload = decodeJwtPayload(token);
  const payloadUsername = typeof payload?.username === 'string' ? payload.username : undefined;

  const currentUser: AuthUser = {
    username: partialUser?.username || payloadUsername || 'user',
    name: partialUser?.name || (typeof payload?.name === 'string' ? payload.name : undefined),
    email: partialUser?.email || (typeof payload?.email === 'string' ? payload.email : undefined),
    role: partialUser?.role || (typeof payload?.role === 'string' ? payload.role : undefined),
    password: partialUser?.password,
    profileImage: partialUser?.profileImage,
    preferences: partialUser?.preferences,
  };

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
  emitAuthChanged();
};

export const loginWithCredentialFallback = (token: string, credential: string): void => {
  const userData: Partial<AuthUser> = isEmail(credential)
    ? { email: credential }
    : { username: credential };

  setAuthSession(token, userData);
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  emitAuthChanged();
};

export const updateStoredUser = (updates: Partial<AuthUser>): AuthUser | null => {
  const existing = getStoredUser();

  if (!existing) {
    return null;
  }

  const nextUser: AuthUser = {
    ...existing,
    ...updates,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  emitAuthChanged();

  return nextUser;
};