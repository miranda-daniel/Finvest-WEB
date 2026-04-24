// Dropdown menu that appears below the avatar button.
// Receives user info, a close callback, and action handlers from UserMenu.

import { useNavigate } from '@tanstack/react-router';
import { useLogout } from '@/api/hooks/auth/useLogout';
import { IconSettings, IconLogout } from '@/components/ui/icons';

interface DropdownMenuProps {
  firstName: string;
  lastName: string;
  email: string;
  onClose: () => void;
}

export const DropdownMenu = ({ firstName, lastName, email, onClose }: DropdownMenuProps) => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  return (
    <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute right-0 top-[calc(100%+8px)] z-50 w-52.5 rounded-[10px] border border-white/9 bg-surface-overlay p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] duration-150">
      {/* Header: name + email */}
      <div className="mb-1 border-b border-white/6 px-3 pb-2 pt-2.5">
        <p className="text-[13px] font-medium text-slate-200">
          {firstName} {lastName}
        </p>
        <p className="mt-0.5 text-[12px] text-slate-400">{email}</p>
      </div>

      {/* Settings */}
      <button
        onClick={() => {
          onClose();
          void navigate({ to: '/settings' });
        }}
        className="flex w-full items-center gap-2.25 rounded-md border-none bg-transparent px-3 py-2 text-[13px] text-slate-400 transition-colors duration-100 hover:bg-white/4"
      >
        <IconSettings size={14} />
        Settings
      </button>

      {/* Separator */}
      <div className="mx-1 my-0.75 h-px bg-white/6" />

      {/* Sign out */}
      <button
        onClick={() => {
          onClose();
          logout();
        }}
        className="flex w-full items-center gap-2.25 rounded-md border-none bg-transparent px-3 py-2 text-[13px] text-rose-400 transition-colors duration-100 hover:bg-white/4"
      >
        <IconLogout size={14} />
        Sign out
      </button>
    </div>
  );
};
