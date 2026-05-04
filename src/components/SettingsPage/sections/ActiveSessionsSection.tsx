import { UAParser } from 'ua-parser-js';
import { SmartphoneIcon, MonitorIcon, LucideIcon } from 'lucide-react';
import { useActiveSessions } from '@/api/hooks/auth/useActiveSessions';
import { useRevokeAllSessions } from '@/api/hooks/auth/useRevokeAllSessions';

enum DeviceType {
  Desktop = 'Desktop',
  Mobile = 'Mobile',
  Tablet = 'Tablet',
  Unknown = 'Unknown',
}

interface ParsedUA {
  browser: string;
  os: string;
  deviceType: DeviceType;
}

const parseUserAgent = (ua: string | null): ParsedUA => {
  if (!ua) return { browser: 'Unknown browser', os: 'Unknown OS', deviceType: DeviceType.Unknown };

  const parser = new UAParser(ua);
  const browser = parser.getBrowser().name ?? 'Unknown browser';
  const os = parser.getOS().name ?? 'Unknown OS';
  const rawType = parser.getDevice().type;

  const deviceType =
    rawType === 'mobile' ? DeviceType.Mobile :
    rawType === 'tablet' ? DeviceType.Tablet :
    !rawType ? DeviceType.Desktop : DeviceType.Unknown;

  return { browser, os, deviceType };
};

const deviceIcon = (type: DeviceType): LucideIcon => {
  if (type === DeviceType.Mobile || type === DeviceType.Tablet) return SmartphoneIcon;
  return MonitorIcon;
};

export const ActiveSessionsSection = () => {
  const { sessions, loading: sessionsLoading, error: sessionsError } = useActiveSessions();
  const { revokeAll, loading: revoking } = useRevokeAllSessions();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-heading-2">Active Sessions</h2>
        <button
          onClick={() => revokeAll()}
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
          {sessions.map((session) => {
            const { browser, os, deviceType } = parseUserAgent(session.userAgent);
            const now = new Date();
            const expires = new Date(session.expires);
            const daysLeft = Math.max(
              0,
              Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            );
            const DeviceIcon = deviceIcon(deviceType);

            return (
              <li
                key={session.id}
                className="rounded-xl border border-white/6 bg-white/3 px-4 py-3.5 flex gap-3.5 items-start"
              >
                <DeviceIcon size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-slate-200">{browser}</span>
                    <span className="text-[11px] text-slate-500">·</span>
                    <span className="text-[12px] text-slate-400">{os}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500">
                      {deviceType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] text-slate-500">IP: {session.createdByIp}</span>
                    <span className="text-[11px] text-slate-600">·</span>
                    <span className="text-[11px] text-slate-500">
                      Since{' '}
                      {new Date(session.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-600">·</span>
                    <span className="text-[11px] text-slate-500">
                      {daysLeft === 0 ? 'Expired' : `Expires in ${daysLeft}d`}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
