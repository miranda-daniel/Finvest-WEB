# Settings Page — Design Spec

**Date:** 2026-04-07
**Status:** Approved

---

## Overview

A settings page at `/settings` for authenticated users. Uses a fixed sidebar on the left and a content area on the right (TradingView-style). Hash-based navigation controls which section is visible.

---

## Routing

- **Route:** `/settings` (single TanStack Router route under `_authenticated`)
- **Navigation:** Hash-based — `#profile`, `#active-sessions`, `#security`
- **Default:** If no hash or invalid hash → redirect to `#profile`
- **No sub-routes.** One route file reads `window.location.hash` on mount and on `hashchange` events.

The navbar UserMenu "Edit profile" item is replaced by "Settings" (gear icon), navigating to `/settings`.

---

## Layout

Mirrors the existing navbar shell:

- Page starts at `pt-14` (56px) to clear the fixed navbar
- Two-column flex layout: sidebar (fixed width) + content area (flex-1)
- Sidebar and content area fill the remaining viewport height

---

## Sidebar

- Width: `200px`, fixed height (full page minus navbar)
- Border-right separating it from the content area
- Section header label: "Settings" (muted, uppercase, small)
- Three navigation items:
  - 👤 Profile → `#profile`
  - 🖥️ Active Sessions → `#active-sessions`
  - 🔒 Security → `#security`
- Active item is visually highlighted (background + brighter text)
- Clicking an item updates `window.location.hash` and re-renders the content area

---

## Sections

### Profile (`#profile`)

Displays user information from the Zustand auth store. No API fetch needed.

Fields (all read-only):
- First name
- Last name
- Email

Rendered as labeled display fields (not form inputs). No save button.

### Active Sessions (`#active-sessions`)

Uses existing hooks:
- `useActiveSessions` — fetches the list of active sessions
- `useRevokeAllSessions` — revokes all sessions

Displays each session with:
- Device description (parsed from User-Agent via `ua-parser-js`, already used in DashboardPage)
- IP address
- Session start date

One "Revoke all devices" button at the top of the section. On success, calls `logout()` (same behavior as current DashboardPage implementation). No per-session revoke button.

### Security (`#security`)

Change password form using React Hook Form + Zod.

Fields:
- Current password
- New password
- Confirm new password

Validation:
- All fields required
- New password and confirm must match
- Minimum 8 characters on new password

**The change password API endpoint does not yet exist.** The submit button is disabled with a `title="Coming soon"` tooltip until the endpoint is implemented. The form renders fully but cannot be submitted.

---

## Component Structure

```
src/
  routes/
    _authenticated/
      settings.tsx                  ← route file, reads hash, renders SettingsPage
  components/
    SettingsPage/
      SettingsPage.tsx              ← layout shell: sidebar + content area
      SettingsSidebar.tsx           ← sidebar nav, receives activeHash + onNavigate
      sections/
        ProfileSection.tsx          ← read-only user info from Zustand
        ActiveSessionsSection.tsx   ← sessions list + revoke all
        SecuritySection.tsx         ← change password form (submit disabled)
```

### Props

**SettingsPage:**
```ts
interface SettingsPageProps {
  activeHash: string; // e.g. 'profile', 'active-sessions', 'security'
}
```

**SettingsSidebar:**
```ts
interface SettingsSidebarProps {
  activeHash: string;
  onNavigate: (hash: string) => void;
}
```

Sections receive no props (they read from Zustand or their own hooks directly).

---

## State

- `activeHash: string` — local `useState` in the route component. Initialized from `window.location.hash` (stripped of `#`). Updated on sidebar navigation and on `hashchange` event.
- User data (Profile section) — from Zustand `useAuthStore`, no extra fetch.
- Sessions data — from `useActiveSessions` hook (already exists).
- Password form state — React Hook Form local state in `SecuritySection`.

No global state additions needed.

---

## Navbar UserMenu change

In `src/components/Navbar/UserMenu.tsx`:
- Remove "Edit profile" item
- Add "Settings" item with a gear SVG icon, color `#94a3b8`
- On click: close dropdown, navigate to `/settings` via TanStack Router `useNavigate`

---

## Out of scope

- Change password API endpoint (backend not yet implemented — form renders but submit is disabled)
- Per-session revoke button
- Avatar upload
- Email change
- Notification preferences
- Mobile/responsive behavior
