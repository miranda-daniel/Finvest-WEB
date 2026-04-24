// Response interceptor — silent JWT renewal on 401.
//
// Flow:
//   1. Request fails with 401
//   2. If the failing request is already a retry or the refresh endpoint itself → reject (no loop)
//   3. Otherwise → call silentRefresh(), which serializes all concurrent refresh attempts
//      into a single HTTP request (see src/api/silentRefresh.ts)
//      - Success: retry original request with new token
//      - Failure: clear auth state, redirect to /login
import { isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { silentRefresh } from '@/api/silentRefresh';

export const applyResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const isRefreshEndpoint = originalRequest.url?.includes('/session/refresh-token');

      if (error.response?.status !== 401 || originalRequest._retry || isRefreshEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newJwtToken = await silentRefresh();
        originalRequest.headers['Authorization'] = `Bearer ${newJwtToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    },
  );
};
