// Fixed top navigation bar — appears on all authenticated routes.
// Height: 56px. Uses backdrop-blur glass effect.
// Page content must have pt-20 (80px) to not be hidden beneath it.

import { FinvestLogo } from '@/components/ui/FinvestLogo';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.07] bg-surface-base/85 px-6 backdrop-blur-xl">
      <FinvestLogo size={28} />
      <UserMenu />
    </header>
  );
};
