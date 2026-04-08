// src/components/SettingsPage/SettingsPage.tsx
//
// Layout shell for the Settings page.
// Renders the sidebar and the active section based on activeHash.

import { SettingsSidebar } from './SettingsSidebar';
import { ProfileSection } from './sections/ProfileSection';
import { ActiveSessionsSection } from './sections/ActiveSessionsSection';
import { SecuritySection } from './sections/SecuritySection';

interface SettingsPageProps {
  activeHash: string;
  onNavigate: (hash: string) => void;
}

const renderSection = (hash: string) => {
  switch (hash) {
    case 'active-sessions':
      return <ActiveSessionsSection />;
    case 'security':
      return <SecuritySection />;
    default:
      return <ProfileSection />;
  }
};

export const SettingsPage = ({ activeHash, onNavigate }: SettingsPageProps) => {
  return (
    <div className="flex h-[calc(100vh-56px)] mt-14">
      <SettingsSidebar activeHash={activeHash} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto px-10 py-8">{renderSection(activeHash)}</main>
    </div>
  );
};
