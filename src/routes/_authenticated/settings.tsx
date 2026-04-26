// Settings route — uses the URL hash to track the active section (e.g. /settings#security).
// Hash changes update the active section without a full navigation or page reload.
// TanStack Router's useLocation() provides the hash reactively, so no useEffect is needed.

import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import { SettingsPage } from '@/components/SettingsPage';
import { SettingsHash } from '@/components/SettingsPage/settingsHash';

// Strips the leading '#' and validates against known sections; falls back to Profile.
const resolveHash = (hash: string): SettingsHash => {
  const raw = hash.replace('#', '') as SettingsHash;
  return Object.values(SettingsHash).includes(raw) ? raw : SettingsHash.Profile;
};

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  const activeHash = resolveHash(hash);

  const handleNavigate = (section: SettingsHash) => {
    void navigate({ hash: section });
  };

  return <SettingsPage activeHash={activeHash} onNavigate={handleNavigate} />;
}
