// src/components/SettingsPage/sections/ActiveSessionsSection.tsx
//
// Lists active sessions and provides a "Revoke all devices" button.
// On revoke success, logs the user out (the current session is also revoked).

import { UAParser } from 'ua-parser-js';
import { useActiveSessions } from '@/api/hooks/auth/useActiveSessions';
import { useRevokeAllSessions } from '@/api/hooks/auth/useRevokeAllSessions';
import { useLogout } from '@/api/hooks/auth/useLogout';

// Parses a User-Agent string into a human-readable device description.
// Returns "Unknown device" if the UA string is null or unparseable.
const parseUserAgent = (ua: string | null): string => {
  if (!ua) return 'Unknown device';
  const parser = new UAParser(ua);
  const os = parser.getOS().name ?? 'Unknown OS';
  const browser = parser.getBrowser().name ?? 'Unknown browser';
  return `${browser} on ${os}`;
};

export const ActiveSessionsSection = () => {
  const { sessions, loading: sessionsLoading, error: sessionsError } = useActiveSessions();
  const { revokeAll, loading: revoking } = useRevokeAllSessions();
  const { logout } = useLogout();

  const handleRevokeAll = () => {
    revokeAll(undefined, {
      onSuccess: () => logout(),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-heading-2">Active Sessions</h2>
        <button
          onClick={handleRevokeAll}
          disabled={revoking || sessionsLoading}
          className="text-sm text-rose-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {revoking ? 'Revoking...' : 'Revoke all devices'}
        </button>
      </div>
      <p className="text-subtle mb-6">Devices currently logged into your account.</p>

      {sessionsLoading && <p className="text-[13px] text-slate-400">Loading sessions...</p>}

      {sessionsError && <p className="text-[13px] text-rose-400">{sessionsError}</p>}

      {!sessionsLoading && !sessionsError && sessions.length === 0 && (
        <p className="text-[13px] text-slate-400">No active sessions.</p>
      )}

      {sessions.length > 0 && (
        <ul className="flex flex-col gap-2 max-w-lg">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
              <p className="text-[13px] text-slate-200">{parseUserAgent(session.userAgent)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">IP: {session.createdByIp}</p>
              <p className="text-[11px] text-slate-500">
                Since: {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
