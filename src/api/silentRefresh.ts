// Singleton that serializes refresh-token calls across the app.
//
// Problem: both the route guard (_authenticated.tsx) and the Apollo error link
// (graphql/client.ts) can trigger a silent refresh independently. If they fire
// at the same time they each use the same cookie, create two new sessions, and
// leave one orphaned (not revoked).
//
// Solution: share one in-flight promise. Any caller that arrives while a refresh
// is already running waits for the same promise instead of starting a new request.

import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

let inFlight: Promise<string> | null = null;

export const silentRefresh = (): Promise<string> => {
  if (inFlight) return inFlight;

  inFlight = apiClient
    .post<{ jwtToken: string }>('/session/refresh-token')
    .then(({ data }) => {
      useAuthStore.getState().setToken(data.jwtToken);
      return data.jwtToken;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
