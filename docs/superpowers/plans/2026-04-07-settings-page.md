# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TradingView-style Settings page at `/settings` with a fixed sidebar (Profile, Active Sessions, Security) and hash-based section navigation, and update the navbar dropdown to link to it.

**Architecture:** Single TanStack Router route at `/_authenticated/settings`. Hash in the URL (`#profile`, `#active-sessions`, `#security`) controls which section renders. `SettingsPage` is the layout shell; each section is an isolated component. `SettingsSidebar` receives the active hash and an `onNavigate` callback. No global state additions — data comes from Zustand (Profile) or existing REST hooks (Active Sessions). Security section renders a form but submit is disabled (API not yet implemented).

**Tech Stack:** React 19, TanStack Router, Zustand, Tailwind CSS v4, React Hook Form, Zod, ua-parser-js

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/SettingsPage/SettingsSidebar.tsx` | Create | Sidebar nav — 3 items, highlights active, calls onNavigate |
| `src/components/SettingsPage/sections/ProfileSection.tsx` | Create | Read-only user info from Zustand |
| `src/components/SettingsPage/sections/ActiveSessionsSection.tsx` | Create | Sessions list + revoke all |
| `src/components/SettingsPage/sections/SecuritySection.tsx` | Create | Change password form (submit disabled) |
| `src/components/SettingsPage/SettingsPage.tsx` | Create | Layout shell: sidebar + content area |
| `src/components/SettingsPage/index.ts` | Create | Re-export SettingsPage |
| `src/routes/_authenticated/settings.tsx` | Create | Route file — reads/manages hash, renders SettingsPage |
| `src/components/Navbar/UserMenu.tsx` | Modify | Replace "Edit profile" with "Settings" → navigates to /settings |

---

## Task 1: SettingsSidebar component

**Files:**
- Create: `src/components/SettingsPage/SettingsSidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPage/SettingsSidebar.tsx
git commit -m "feat(settings): add SettingsSidebar component"
```

---

## Task 2: ProfileSection component

**Files:**
- Create: `src/components/SettingsPage/sections/ProfileSection.tsx`

- [ ] **Step 1: Create the component**

Reads user data from Zustand. Displays firstName, lastName, email as read-only labeled fields.

```tsx
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
    <span className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</span>
    <span className="text-[14px] text-slate-200">{value}</span>
  </div>
);

export const ProfileSection = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Profile</h2>
      <p className="text-[12px] text-slate-500 mb-6">Your personal information.</p>

      <div className="flex flex-col gap-5 max-w-sm">
        <ReadOnlyField label="First name" value={user.firstName} />
        <ReadOnlyField label="Last name" value={user.lastName} />
        <ReadOnlyField label="Email" value={user.email} />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPage/sections/ProfileSection.tsx
git commit -m "feat(settings): add ProfileSection component"
```

---

## Task 3: ActiveSessionsSection component

**Files:**
- Create: `src/components/SettingsPage/sections/ActiveSessionsSection.tsx`

- [ ] **Step 1: Create the component**

Uses `useActiveSessions`, `useRevokeAllSessions`, and `useLogout`. Parses user-agent strings with `ua-parser-js` (same approach as DashboardPage). Revoke all → logout.

```tsx
// src/components/SettingsPage/sections/ActiveSessionsSection.tsx
//
// Lists active sessions and provides a "Revoke all devices" button.
// On revoke success, logs the user out (the current session is also revoked).

import { UAParser } from 'ua-parser-js';
import { useActiveSessions } from '@/api/hooks/auth/useActiveSessions';
import { useRevokeAllSessions } from '@/api/hooks/auth/useRevokeAllSessions';
import { useLogout } from '@/api/hooks/auth/useLogout';

// Parses a User-Agent string into a human-readable device description.
// Returns "Unknown device" if the UA string is null or unparseable.
const parseUserAgent = (ua: string | null): string => {
  if (!ua) return 'Unknown device';
  const parser = new UAParser(ua);
  const os = parser.getOS().name ?? 'Unknown OS';
  const browser = parser.getBrowser().name ?? 'Unknown browser';
  return `${browser} on ${os}`;
};

export const ActiveSessionsSection = () => {
  const { sessions, loading: sessionsLoading, error: sessionsError } = useActiveSessions();
  const { revokeAll, loading: revoking } = useRevokeAllSessions();
  const { logout } = useLogout();

  const handleRevokeAll = () => {
    revokeAll(undefined, {
      onSuccess: () => logout(),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-slate-100">Active Sessions</h2>
        <button
          onClick={handleRevokeAll}
          disabled={revoking || sessionsLoading}
          className="text-[13px] text-rose-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {revoking ? 'Revoking...' : 'Revoke all devices'}
        </button>
      </div>
      <p className="text-[12px] text-slate-500 mb-6">Devices currently logged into your account.</p>

      {sessionsLoading && <p className="text-[13px] text-slate-400">Loading sessions...</p>}

      {sessionsError && <p className="text-[13px] text-rose-400">{sessionsError}</p>}

      {!sessionsLoading && !sessionsError && sessions.length === 0 && (
        <p className="text-[13px] text-slate-400">No active sessions.</p>
      )}

      {sessions.length > 0 && (
        <ul className="flex flex-col gap-2 max-w-lg">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-[13px] text-slate-200">{parseUserAgent(session.userAgent)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">IP: {session.createdByIp}</p>
              <p className="text-[11px] text-slate-500">
                Since: {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPage/sections/ActiveSessionsSection.tsx
git commit -m "feat(settings): add ActiveSessionsSection component"
```

---

## Task 4: SecuritySection component

**Files:**
- Create: `src/components/SettingsPage/sections/SecuritySection.tsx`

- [ ] **Step 1: Install zod (if not already installed)**

Check if zod is already a dependency:

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB && grep '"zod"' package.json
```

If not found, install it:

```bash
npm install zod
```

Then check react-hook-form:

```bash
grep '"react-hook-form"' package.json
```

If not found:

```bash
npm install react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Create the component**

Change password form. Submit button is disabled with `title="Coming soon"` — the API endpoint does not yet exist.

```tsx
// src/components/SettingsPage/sections/SecuritySection.tsx
//
// Change password form.
// The submit button is disabled — the API endpoint does not yet exist.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface FormFieldProps {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

const FormField = ({ label, error, inputProps }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</label>
    <input
      {...inputProps}
      className={`h-9 rounded-lg border bg-white/[0.05] px-3 text-[13px] text-slate-200 outline-none focus:ring-1 transition-colors ${
        error
          ? 'border-rose-500/60 focus:ring-rose-500/40'
          : 'border-white/10 focus:ring-white/20'
      }`}
    />
    {error && <span className="text-[11px] text-rose-400">{error}</span>}
  </div>
);

export const SecuritySection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Submit handler is a no-op — the endpoint is not yet implemented.
  const onSubmit = (_values: ChangePasswordFormValues) => {
    // intentional no-op: API endpoint not yet available
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Security</h2>
      <p className="text-[12px] text-slate-500 mb-6">Change your account password.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
          inputProps={{ type: 'password', ...register('currentPassword') }}
        />
        <FormField
          label="New password"
          error={errors.newPassword?.message}
          inputProps={{ type: 'password', ...register('newPassword') }}
        />
        <FormField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          inputProps={{ type: 'password', ...register('confirmPassword') }}
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled
            title="Coming soon — API endpoint not yet implemented"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-[13px] text-slate-400 cursor-not-allowed opacity-50"
          >
            Change password
          </button>
        </div>
      </form>
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPage/sections/SecuritySection.tsx
git commit -m "feat(settings): add SecuritySection component with disabled change-password form"
```

---

## Task 5: SettingsPage layout shell + index

**Files:**
- Create: `src/components/SettingsPage/SettingsPage.tsx`
- Create: `src/components/SettingsPage/index.ts`

- [ ] **Step 1: Create SettingsPage.tsx**

Layout shell: full-height flex row, sidebar on left, content on right. Receives `activeHash` and renders the matching section.

```tsx
// src/components/SettingsPage/SettingsPage.tsx
//
// Layout shell for the Settings page.
// Renders the sidebar and the active section based on activeHash.

import { SettingsSidebar } from './SettingsSidebar';
import { ProfileSection } from './sections/ProfileSection';
import { ActiveSessionsSection } from './sections/ActiveSessionsSection';
import { SecuritySection } from './sections/SecuritySection';

interface SettingsPageProps {
  activeHash: string;
  onNavigate: (hash: string) => void;
}

const renderSection = (hash: string) => {
  switch (hash) {
    case 'active-sessions':
      return <ActiveSessionsSection />;
    case 'security':
      return <SecuritySection />;
    default:
      return <ProfileSection />;
  }
};

export const SettingsPage = ({ activeHash, onNavigate }: SettingsPageProps) => {
  return (
    <div className="flex h-[calc(100vh-56px)] mt-14">
      <SettingsSidebar activeHash={activeHash} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto px-10 py-8">{renderSection(activeHash)}</main>
    </div>
  );
};
```

- [ ] **Step 2: Create index.ts**

```ts
// src/components/SettingsPage/index.ts
export { SettingsPage } from './SettingsPage';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPage/SettingsPage.tsx src/components/SettingsPage/index.ts
git commit -m "feat(settings): add SettingsPage layout shell"
```

---

## Task 6: Settings route file

**Files:**
- Create: `src/routes/_authenticated/settings.tsx`

- [ ] **Step 1: Create the route file**

Reads the hash from `window.location.hash` on mount. Listens for `hashchange` events so the browser back/forward buttons work. Defaults to `'profile'` if hash is empty or invalid.

```tsx
// src/routes/_authenticated/settings.tsx
//
// Settings route — reads URL hash to determine the active section.
// Hash changes update the active section without a full navigation.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SettingsPage } from '@/components/SettingsPage';

const VALID_HASHES = ['profile', 'active-sessions', 'security'];

const resolveHash = (): string => {
  const raw = window.location.hash.replace('#', '');
  return VALID_HASHES.includes(raw) ? raw : 'profile';
};

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const [activeHash, setActiveHash] = useState<string>(resolveHash);

  useEffect(() => {
    const handleHashChange = () => setActiveHash(resolveHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  return <SettingsPage activeHash={activeHash} onNavigate={handleNavigate} />;
}
```

- [ ] **Step 2: Verify the route registers correctly**

Start the dev server and navigate to `/settings`. The page should render with the sidebar and default to the Profile section.

```bash
npm run dev
```

- Navigate to `http://localhost:5173/settings`
- Sidebar should show Profile, Active Sessions, Security
- Profile section should display read-only name and email
- Clicking "Active Sessions" in sidebar → URL becomes `/settings#active-sessions` → sessions list appears
- Clicking "Security" → URL becomes `/settings#security` → password form appears
- Browser back button should navigate between sections

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/settings.tsx
git commit -m "feat(settings): add settings route with hash-based navigation"
```

---

## Task 7: Update UserMenu — replace "Edit profile" with "Settings"

**Files:**
- Modify: `src/components/Navbar/UserMenu.tsx`

- [ ] **Step 1: Update UserMenu.tsx**

Replace the `IconUser` + "Edit profile" button with an `IconSettings` + "Settings" button that navigates to `/settings`.

Open `src/components/Navbar/UserMenu.tsx` and make these changes:

1. Add `useNavigate` import from TanStack Router at the top:

```tsx
import { useNavigate } from '@tanstack/react-router';
```

2. Inside the `UserMenu` component body (after the `const initials = ...` line), add:

```tsx
const navigate = useNavigate();
```

3. Replace the entire "Edit profile" button block (lines 92–104) with:

```tsx
{/* Settings */}
<button
  onClick={() => {
    setIsOpen(false);
    void navigate({ to: '/settings' });
  }}
  style={menuItemStyle()}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
  }}
>
  <IconSettings />
  Settings
</button>
```

4. Replace the `IconUser` component (the entire const) with `IconSettings`:

```tsx
const IconSettings = () => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

- Click the avatar in the navbar → dropdown opens
- "Settings" item appears with gear icon
- Clicking "Settings" closes the dropdown and navigates to `/settings`

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar/UserMenu.tsx
git commit -m "feat(settings): update UserMenu — replace Edit profile with Settings link"
```
