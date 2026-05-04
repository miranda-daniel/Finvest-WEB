// src/components/SettingsPage/SettingsPage.tsx
//
// Layout shell for the Settings page.
// Renders the sidebar and the active section based on activeHash.

import { SettingsSidebar } from './SettingsSidebar';
import { ProfileSection } from './sections/ProfileSection';
import { ActiveSessionsSection } from './sections/ActiveSessionsSection';
import { SecuritySection } from './sections/SecuritySection';
import { DocumentsSection } from './sections/DocumentsSection';
import { SettingsHash } from './settingsHash';

interface SettingsPageProps {
  activeHash: SettingsHash;
  onNavigate: (hash: SettingsHash) => void;
}

const renderSection = (hash: SettingsHash) => {
  switch (hash) {
    case SettingsHash.ActiveSessions:
      return <ActiveSessionsSection />;
    case SettingsHash.Security:
      return <SecuritySection />;
    case SettingsHash.Documents:
      return <DocumentsSection />;
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
