// Axios instance — shared HTTP client for all REST requests.
//
// All REST calls must go through this instance (never import axios directly).
// Interceptors are registered in src/api/interceptors/ and applied here.
//
// GraphQL requests go through Apollo Client (src/graphql/client.ts), not this.
import axios, { isAxiosError } from 'axios';
import { applyRequestInterceptor } from '@/api/interceptors/request.interceptor';
import { applyResponseInterceptor } from '@/api/interceptors/response.interceptor';

export const apiClient = axios.create({
  withCredentials: true, // required for HTTP-only cookies to be sent cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

applyRequestInterceptor(apiClient);
applyResponseInterceptor(apiClient);

// Helper to extract the error message from an Axios response.
// Returns null if error is null/undefined — allows calling without a ternary guard.
export const getApiError = (error: unknown, fallback = 'Something went wrong.'): string | null => {
  if (!error) return null;
  return (isAxiosError(error) ? error.response?.data?.description : null) ?? fallback;
};
