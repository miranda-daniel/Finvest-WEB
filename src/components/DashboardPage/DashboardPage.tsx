import { UAParser } from 'ua-parser-js';
import { useAuthStore } from '@/stores/auth.store';
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios';
import { useLogout } from '@/api/hooks/auth/useLogout';
import { useActiveSessions } from '@/api/hooks/auth/useActiveSessions';
import { useRevokeAllSessions } from '@/api/hooks/auth/useRevokeAllSessions';

// Parses a User-Agent string into a human-readable device description.
// Returns "Unknown device" if the UA string is null or unparseable.
const parseUserAgent = (ua: string | null): string => {
  if (!ua) return 'Unknown device';

  const parser = new UAParser(ua);
  const os = parser.getOS().name ?? 'Unknown OS';
  const browser = parser.getBrowser().name ?? 'Unknown browser';

  return `${browser} on ${os}`;
};

// DashboardPage — the main authenticated page.
//
// Reads user data from Zustand (available immediately after login, no extra request).
// Fetches the user's portfolios via GraphQL using usePortfolios().
// Fetches the user's active sessions via REST using useActiveSessions().
// Provides a "Revoke all devices" button that revokes all sessions then logs out.
export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();
  const { sessions, loading: sessionsLoading, error: sessionsError } = useActiveSessions();
  const { revokeAll, loading: revoking } = useRevokeAllSessions();

  // Revoke all sessions then immediately log out, because the current session
  // is also revoked and can no longer be used.
  const handleRevokeAll = () => {
    revokeAll(undefined, {
      onSuccess: () => logout(),
    });
  };

  return (
    <div className="pt-20 px-8 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mt-1">
              {user.firstName} {user.lastName} · {user.email}
            </p>
          )}
        </div>
        <button onClick={() => logout()}>Sign out</button>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Portfolios</h2>

        {portfoliosLoading && <p className="text-gray-500">Loading portfolios...</p>}

        {portfoliosError && <p className="text-red-500">Error: {portfoliosError.message}</p>}

        {!portfoliosLoading && !portfoliosError && portfolios.length === 0 && (
          <p className="text-gray-400">No portfolios yet.</p>
        )}

        {portfolios.length > 0 && (
          <ul className="space-y-2">
            {portfolios.map((portfolio) => (
              <li key={portfolio.id} className="border rounded p-3">
                <span className="font-medium">{portfolio.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          <button onClick={handleRevokeAll} disabled={revoking || sessionsLoading}>
            {revoking ? 'Revoking...' : 'Revoke all devices'}
          </button>
        </div>

        {sessionsLoading && <p className="text-gray-500">Loading sessions...</p>}

        {sessionsError && <p className="text-red-500">Error: {sessionsError}</p>}

        {!sessionsLoading && !sessionsError && sessions.length === 0 && (
          <p className="text-gray-400">No active sessions.</p>
        )}

        {sessions.length > 0 && (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id} className="border rounded p-3">
                <p className="font-medium">{parseUserAgent(session.userAgent)}</p>
                <p className="text-sm text-gray-500">IP: {session.createdByIp}</p>
                <p className="text-sm text-gray-500">
                  Since: {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
