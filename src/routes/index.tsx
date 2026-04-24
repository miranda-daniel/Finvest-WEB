import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { silentRefresh } from '@/api/silentRefresh';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const store = useAuthStore.getState();

    if (store.token) {
      throw redirect({ to: '/dashboard' });
    }

    try {
      await silentRefresh();
      throw redirect({ to: '/dashboard' });
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: '/login' });
    }
  },
});
