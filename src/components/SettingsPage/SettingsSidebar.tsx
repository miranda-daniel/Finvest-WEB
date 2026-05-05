import { UserIcon, MonitorIcon, ShieldIcon, FileTextIcon, LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { SettingsHash } from './settingsHash';

const OWNER_EMAIL = 'miranda.daniel.edu@gmail.com';

interface SettingsSidebarProps {
  activeHash: SettingsHash;
  onNavigate: (hash: SettingsHash) => void;
}

interface SidebarItem {
  hash: SettingsHash;
  label: string;
  icon: LucideIcon;
}

const BASE_ITEMS: SidebarItem[] = [
  { hash: SettingsHash.Profile, label: 'Profile', icon: UserIcon },
  { hash: SettingsHash.ActiveSessions, label: 'Active Sessions', icon: MonitorIcon },
  { hash: SettingsHash.Security, label: 'Security', icon: ShieldIcon },
];

const DOCUMENTS_ITEM: SidebarItem = {
  hash: SettingsHash.Documents,
  label: 'Documents',
  icon: FileTextIcon,
};

export const SettingsSidebar = ({ activeHash, onNavigate }: SettingsSidebarProps) => {
  const user = useAuthStore((s) => s.user);
  const items = user?.email === OWNER_EMAIL ? [...BASE_ITEMS, DOCUMENTS_ITEM] : BASE_ITEMS;

  return (
    <aside className="w-48 shrink-0 border-r border-white/6 px-3 py-5">
      <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Settings
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = activeHash === item.hash;
          const Icon = item.icon;

          return (
            <button
              key={item.hash}
              onClick={() => onNavigate(item.hash)}
              className={`flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                isActive
                  ? 'bg-white/6 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/3'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
