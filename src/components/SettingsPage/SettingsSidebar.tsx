// src/components/SettingsPage/SettingsSidebar.tsx
//
// Sidebar navigation for the Settings page.
// Renders three items (Profile, Active Sessions, Security).
// Highlights the active item based on the current hash.

interface SettingsSidebarProps {
  activeHash: string;
  onNavigate: (hash: string) => void;
}

interface SidebarItem {
  hash: string;
  label: string;
  icon: string;
}

const items: SidebarItem[] = [
  { hash: 'profile', label: 'Profile', icon: '👤' },
  { hash: 'active-sessions', label: 'Active Sessions', icon: '🖥️' },
  { hash: 'security', label: 'Security', icon: '🔒' },
];

export const SettingsSidebar = ({ activeHash, onNavigate }: SettingsSidebarProps) => {
  return (
    <aside className="w-48 flex-shrink-0 border-r border-white/[0.06] px-3 py-5">
      <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Settings
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = activeHash === item.hash;
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
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
