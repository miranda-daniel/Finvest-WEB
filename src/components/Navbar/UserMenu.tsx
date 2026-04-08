// Avatar button that toggles a dropdown menu.
// Reads user data from Zustand. Closes on outside click.

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/api/hooks/auth/useLogout';

// Returns the user's initials from firstName + lastName (e.g. "Daniel Miranda" → "DM").
// Falls back to "?" if user data is not available.
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
};

export const UserMenu = () => {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component.
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: isOpen ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
          border: `1.5px solid ${isOpen ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.45)'}`,
          color: '#a5b4fc',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 210,
            background: '#0f131b',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: 4,
            zIndex: 50,
          }}
        >
          {/* Header: name + email */}
          <div
            style={{
              padding: '10px 12px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 4,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', margin: 0 }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{user.email}</p>
          </div>

          {/* Edit profile */}
          <button
            onClick={() => setIsOpen(false)}
            style={menuItemStyle()}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <IconUser />
            Edit profile
          </button>

          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '3px 4px' }} />

          {/* Sign out */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            style={menuItemStyle('#f87171')}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <IconLogout />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

// Shared style factory for dropdown items.
const menuItemStyle = (color = '#94a3b8'): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  background: 'transparent',
  border: 'none',
  color,
  fontSize: 13,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.1s',
});

const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLogout = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
