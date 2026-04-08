// Avatar button that toggles a dropdown menu.
// Reads user data from Zustand. Closes on outside click.

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { DropdownMenu } from './DropdownMenu';

// Returns the user's initials from firstName + lastName (e.g. "Daniel Miranda" → "DM").
// Falls back to "?" if user data is not available.
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
};

export const UserMenu = () => {
  const user = useAuthStore((s) => s.user);
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
    <div ref={containerRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full border-[1.5px] text-[12px] font-semibold text-indigo-300 transition-[background,border-color] duration-150 ${
          isOpen
            ? 'border-indigo-500/80 bg-indigo-500/25'
            : 'border-indigo-500/45 bg-indigo-500/15'
        }`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {isOpen && (
        <DropdownMenu
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
