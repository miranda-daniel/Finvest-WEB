// src/components/SettingsPage/sections/ProfileSection.tsx
//
// Displays the user's profile information (read-only).
// Data comes from the Zustand auth store — no API fetch needed.

import { useAuthStore } from '@/stores/auth.store';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-[14px] text-slate-200">{value}</span>
  </div>
);

export const ProfileSection = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Profile</h2>
      <p className="text-sm text-slate-400 mb-6">Your personal information.</p>

      <div className="flex flex-col gap-5 max-w-sm">
        <ReadOnlyField label="First name" value={user.firstName} />
        <ReadOnlyField label="Last name" value={user.lastName} />
        <ReadOnlyField label="Email" value={user.email} />
      </div>
    </div>
  );
};
