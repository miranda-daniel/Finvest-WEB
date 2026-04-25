import { UserIcon, MonitorIcon, ShieldIcon, LucideIcon } from 'lucide-react';

interface SettingsSidebarProps {
  activeHash: string;
  onNavigate: (hash: string) => void;
}

interface SidebarItem {
  hash: string;
  label: string;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  { hash: 'profile', label: 'Profile', icon: UserIcon },
  { hash: 'active-sessions', label: 'Active Sessions', icon: MonitorIcon },
  { hash: 'security', label: 'Security', icon: ShieldIcon },
];

export const SettingsSidebar = ({ activeHash, onNavigate }: SettingsSidebarProps) => {
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
                  ? 'bg-white/[0.06] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
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
