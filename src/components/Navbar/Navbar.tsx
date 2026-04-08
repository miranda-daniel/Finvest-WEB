// Fixed top navigation bar — appears on all authenticated routes.
// Height: 56px. Uses backdrop-blur glass effect.
// Page content must have pt-20 (80px) to not be hidden beneath it.

import { FinvestLogo } from '@/components/ui/FinvestLogo';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(10,11,16,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        zIndex: 40,
      }}
    >
      <FinvestLogo size={28} />
      <UserMenu />
    </header>
  );
};
