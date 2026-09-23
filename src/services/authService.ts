import api from '@/lib/axios';
import { setAuthToken, clearAuthToken, LOGIN_CREDENTIALS } from '@/lib/auth';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials);

  if (response.data.accessToken) {
    setAuthToken(response.data.accessToken);
  }

  return response.data;
}

export async function logout(): Promise<void> {
  clearAuthToken();
  // Redirect to login on client side
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username === LOGIN_CREDENTIALS.username &&
    password === LOGIN_CREDENTIALS.password
  );
}