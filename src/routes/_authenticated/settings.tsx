// src/routes/_authenticated/settings.tsx
//
// Settings route — reads URL hash to determine the active section.
// Hash changes update the active section without a full navigation.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SettingsPage } from '@/components/SettingsPage';

const VALID_HASHES = ['profile', 'active-sessions', 'security'];

const resolveHash = (): string => {
  const raw = window.location.hash.replace('#', '');
  return VALID_HASHES.includes(raw) ? raw : 'profile';
};

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const [activeHash, setActiveHash] = useState<string>(resolveHash);

  useEffect(() => {
    const handleHashChange = () => setActiveHash(resolveHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  return <SettingsPage activeHash={activeHash} onNavigate={handleNavigate} />;
}
