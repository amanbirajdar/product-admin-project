import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  // Also set in cookies for middleware access
  Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/' });
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;
  }
  // Fallback to cookies
  return Cookies.get(TOKEN_KEY) || null;
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Login credentials
export const LOGIN_CREDENTIALS = {
  username: 'emilys',
  password: 'emilyspass',
};