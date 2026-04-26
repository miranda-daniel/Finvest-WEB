// src/routes/_authenticated/settings.tsx
//
// Settings route — reads URL hash to determine the active section.
// Hash changes update the active section without a full navigation.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SettingsPage } from '@/components/SettingsPage';
import { SettingsHash } from '@/components/SettingsPage/settingsHash';

const VALID_HASHES = Object.values(SettingsHash) as string[];

const resolveHash = (): SettingsHash => {
  const raw = window.location.hash.replace('#', '');
  return VALID_HASHES.includes(raw) ? (raw as SettingsHash) : SettingsHash.Profile;
};

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const [activeHash, setActiveHash] = useState<SettingsHash>(resolveHash);

  useEffect(() => {
    const handleHashChange = () => setActiveHash(resolveHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (hash: SettingsHash) => {
    window.location.hash = hash;
  };

  return <SettingsPage activeHash={activeHash} onNavigate={handleNavigate} />;
}
