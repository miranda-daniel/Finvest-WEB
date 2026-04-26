import { Menu } from '@base-ui/react/menu';
import { useAuthStore } from '@/stores/auth.store';
import { DropdownMenu } from './DropdownMenu';

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
};

export const UserMenu = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="User menu"
        className="flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full border-[1.5px] text-[12px] font-semibold text-indigo-300 transition-[background,border-color] duration-150 border-indigo-500/45 bg-indigo-500/15 data-popup-open:border-indigo-500/80 data-popup-open:bg-indigo-500/25"
      >
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className="z-50 w-52.5 rounded-[10px] border border-white/9 bg-surface-overlay p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] focus:outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-top-2 data-open:duration-150 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-top-2 data-closed:duration-100">
            <DropdownMenu
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
