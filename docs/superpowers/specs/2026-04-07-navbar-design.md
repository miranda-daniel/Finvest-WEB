# Navbar — Design Spec

**Date:** 2026-04-07
**Status:** Approved

---

## Overview

A fixed top navigation bar for all authenticated routes in Finvest. It provides app identity (logo) and user context (avatar + dropdown menu).

---

## Layout

- **Position:** `fixed` top, full width, `z-index` above page content.
- **Height:** 56px.
- **Background:** `rgba(10,11,16,0.85)` with `backdrop-filter: blur(12px)` — glass effect that lets page content scroll beneath it.
- **Border:** 1px bottom border at `rgba(255,255,255,0.07)`.
- **Padding:** 0 24px horizontal.
- **Structure:** flex row, `space-between`. Logo on the left, avatar on the right.

---

## Logo (left side)

An inline SVG icon + "Finvest" text rendered in the site's font (Geist Variable).

**SVG icon spec:**
- ViewBox: `0 0 100 100`
- Rendered size in navbar: 28×28px
- Circle ring: `stroke-dasharray="58 12 58 12 58 12 58 12"` (4 arcs with gaps), stroke-width 6
  - Ring gradient (darker): linear, bottom-left → top-right, `#10b981` → `#06b6d4`
- 4 vertical bars of ascending height (22→34→46→58 x-positions), clipped to the circle
  - Bars gradient (lighter): linear, top-left → bottom-right, `#6ee7b7` → `#a5f3fc`
- Small dot at `cx=26 cy=48 r=4.5`, same lighter gradient
- No background fill on the circle

**Text:** "Finvest", `font-weight: 600`, `letter-spacing: -0.03em`, `font-size: ~16-17px`, `color: #f1f5f9`.

The SVG is stored as a React component at `src/components/ui/FinvestLogo.tsx` and exported for reuse (favicon, etc.).

---

## Avatar button (right side)

A circular button showing the user's initials, sourced from Zustand auth store (`firstName + lastName`).

- **Size:** 34×34px, `border-radius: 50%`
- **Background:** `rgba(99,102,241,0.15)`
- **Border:** `1.5px solid rgba(99,102,241,0.45)` — indigo accent
- **Text:** initials (e.g. "DM"), `font-size: 12px`, `font-weight: 600`, `color: #a5b4fc`
- **Active state (dropdown open):** border brightens to `rgba(99,102,241,0.8)`, background to `rgba(99,102,241,0.25)`
- **Cursor:** pointer

Clicking the avatar toggles the dropdown. Clicking outside closes it.

---

## Dropdown menu

Appears below the avatar, right-aligned. Toggled by clicking the avatar button.

**Container:**
- `position: absolute`, anchored to the avatar
- `width: 210px`
- Background: `#0f131b`
- Border: `1px solid rgba(255,255,255,0.09)`
- `border-radius: 10px`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.5)`

**Header section** (non-interactive):
- Full name: `font-size: 13px`, `color: #e2e8f0`, `font-weight: 500`
- Email: `font-size: 11px`, `color: #64748b`
- Separated from items by a 1px border

**Menu items:**
| Item | Icon | Action |
|---|---|---|
| Edit profile | user icon | navigates to `/profile` (page TBD) |
| Sign out | logout icon | calls `useLogout()` |

- Separator (`1px`, `rgba(255,255,255,0.06)`) between Edit profile and Sign out
- Sign out styled in `#f87171` (destructive red)
- Hover state: `rgba(255,255,255,0.04)` background on item

**Dismiss behavior:** clicking anywhere outside the dropdown closes it (`mousedown` listener on `document`).

---

## Component structure

```
src/
  components/
    ui/
      FinvestLogo.tsx       ← SVG logo as a React component (accepts size prop)
    Navbar/
      Navbar.tsx            ← main component
      UserMenu.tsx          ← avatar button + dropdown (state: open/closed)
      index.ts              ← re-export
```

**Navbar.tsx** is rendered inside `_authenticated.tsx` so it appears on all protected routes automatically.

---

## State

- `isOpen: boolean` — local `useState` in `UserMenu.tsx`. No global state needed.
- User data (name, email) read from Zustand auth store via `useAuthStore`.

---

## Out of scope

- Edit profile page (navigates to `/profile`, page not yet implemented)
- Active sessions management (planned for a future spec)
- Mobile/responsive behavior (single-user desktop app for now)
- Animations/transitions on dropdown open/close (can be added later)
