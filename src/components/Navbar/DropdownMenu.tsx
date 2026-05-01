import { Menu } from '@base-ui/react/menu';
import { useNavigate } from '@tanstack/react-router';
import { useLogout } from '@/api/hooks/auth/useLogout';
import { Settings as IconSettings, LogOut as IconLogout } from 'lucide-react';

interface DropdownMenuProps {
  firstName: string;
  lastName: string;
  email: string;
}

export const DropdownMenu = ({ firstName, lastName, email }: DropdownMenuProps) => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  return (
    <>
      {/* Header: name + email */}
      <div className="mb-1 border-b border-white/6 px-3 pb-2 pt-2.5">
        <p className="text-[13px] font-medium text-slate-200">
          {firstName} {lastName}
        </p>
        <p className="mt-0.5 text-[12px] text-slate-400">{email}</p>
      </div>

      {/* Settings */}
      <Menu.Item
        onClick={() => void navigate({ to: '/settings' })}
        className="flex w-full cursor-pointer items-center gap-2.25 rounded-md px-3 py-2 text-[13px] text-slate-400 outline-none transition-colors duration-100 hover:bg-white/4 data-highlighted:bg-white/4"
      >
        <IconSettings size={14} />
        Settings
      </Menu.Item>

      {/* Separator */}
      <div className="mx-1 my-0.75 h-px bg-white/6" />

      {/* Sign out */}
      <Menu.Item
        onClick={() => logout()}
        className="flex w-full cursor-pointer items-center gap-2.25 rounded-md px-3 py-2 text-[13px] text-rose-400 outline-none transition-colors duration-100 hover:bg-white/4 data-highlighted:bg-white/4"
      >
        <IconLogout size={14} />
        Sign out
      </Menu.Item>
    </>
  );
};
