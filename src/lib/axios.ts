import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Create axios instance
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try localStorage first (for client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Also check cookies as fallback
    const cookieToken = Cookies.get('auth_token');
    if (cookieToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${cookieToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        Cookies.remove('auth_token');
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;