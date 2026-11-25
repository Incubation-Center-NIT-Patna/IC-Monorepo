import axios from 'axios';
import { getApiBaseUrl } from './env';

/**
 * Centralized Axios instance for Admin Portal
 * Connects to Fastify API with session cookie credentials
 */
const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Session token is passed via HttpOnly cookies (withCredentials: true)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error formatting and session expiration
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorResponse = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      data: error.response?.data || null,
    };

    // If 401 Unauthorized occurs on protected routes (session expired)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        console.warn('[API Client] Unauthorized request. Session may be expired.');
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default apiClient;

