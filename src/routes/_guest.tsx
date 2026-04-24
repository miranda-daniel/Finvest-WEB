// Guest-only layout route — wraps /login and /sign-up.
// If the user is already authenticated (token in memory or valid refresh cookie),
// they are redirected to /dashboard. This mirrors the _authenticated layout,
// which redirects unauthenticated users to /login.
import { createFileRoute, redirect, isRedirect, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/api/client';

export const Route = createFileRoute('/_guest')({
  beforeLoad: async () => {
    const store = useAuthStore.getState();

    if (store.token) {
      throw redirect({ to: '/dashboard' });
    }

    // No token in memory — check if a valid refresh cookie exists.
    // If silent refresh succeeds, the user is still logged in → redirect to dashboard.
    // If it fails, the user is truly unauthenticated → allow access to the guest page.
    try {
      const { data } = await apiClient.post<{ jwtToken: string }>('/session/refresh-token');
      store.setToken(data.jwtToken);

      throw redirect({ to: '/dashboard' });
    } catch (err) {
      if (isRedirect(err)) throw err;
      // Refresh failed → not authenticated, proceed to login/sign-up
    }
  },
  component: Outlet,
});
