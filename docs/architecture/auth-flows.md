# Authentication Flows

## Overview

Finvest uses a two-token auth strategy:

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| **JWT** | Zustand (memory only) | 5 minutes | Authorizes API/GraphQL requests |
| **Refresh token** | HTTP-only cookie (`Path=/`) | 7 days | Obtains a new JWT without re-entering credentials |

The JWT is never written to `localStorage` or `sessionStorage` — this eliminates XSS exposure. On every page reload the JWT is gone from memory and must be recovered via the refresh token cookie.

---

## 1. Login

```
Browser                     _guest.tsx            API
  │                              │                  │
  │  Navigate to /login          │                  │
  │─────────────────────────────>│                  │
  │                         beforeLoad              │
  │                         token in memory? ──Yes──> redirect /dashboard
  │                              │                  │
  │                         silentRefresh()         │
  │                              │  POST /api/session/refresh-token
  │                              │─────────────────>│
  │                              │    cookie valid? ─No──> 401
  │                              │<─────────────────│
  │                         refresh failed          │
  │                         show login page         │
  │                              │                  │
  │  Submit credentials          │                  │
  │─────────────────────────────────────────────────>
  │                                   POST /api/session/login
  │                                                 │
  │<─────────────────────────────────────────────────
  │  { jwtToken, user }                             │
  │  Set-Cookie: refreshToken=<token>; HttpOnly; Path=/
  │                                                 │
  │  Store JWT in Zustand                           │
  │  Navigate to /dashboard                         │
```

---

## 2. Page Reload (F5)

The JWT is lost from memory on every reload. The refresh token cookie persists.

```
Browser                 _authenticated.tsx          API
  │                              │                  │
  │  Reload /dashboard           │                  │
  │─────────────────────────────>│                  │
  │                         beforeLoad              │
  │                         token in memory? ──Yes──> skip (already set)
  │                              │                  │
  │                         token = null            │
  │                         silentRefresh()         │
  │                              │  POST /api/session/refresh-token
  │                              │─────────────────>│
  │                              │  hash cookie token│
  │                              │  find in DB      │
  │                              │  already revoked?──Yes──> revokeAllForUser → 401
  │                              │  expired? ────────Yes──> 401
  │                              │                  │
  │                              │  rotate:         │
  │                              │  • create new token│
  │                              │  • revoke old    │
  │                              │  (atomic tx)     │
  │                              │<─────────────────│
  │                              │  { jwtToken }    │
  │                              │  Set-Cookie: refreshToken=<new>
  │                         Store JWT in Zustand    │
  │                         page renders normally   │
  │                              │                  │
```

If the refresh token cookie is missing or expired → redirect to `/login`.

---

## 3. Logout

```
Browser               useLogout hook               API
  │                        │                        │
  │  Click "Sign out"      │                        │
  │───────────────────────>│                        │
  │                        │  POST /api/session/logout
  │                        │────────────────────────>
  │                        │  read cookie           │
  │                        │  revoke token in DB    │
  │                        │  Set-Cookie: refreshToken=; Max-Age=0
  │                        │<────────────────────────
  │                        │  (onSettled — always runs)
  │                        │  clearAuth() → JWT=null, user=null
  │                        │  apolloClient.clearStore()
  │                        │  navigate /login       │
  │<───────────────────────│                        │
```

`onSettled` is used instead of `onSuccess` — auth state is always cleared regardless of whether the logout request succeeded.

---

## 4. Silent Refresh on Expired JWT (REST)

When a REST request fails with 401, the Axios response interceptor recovers automatically.

```
Browser            Axios interceptor           silentRefresh()        API
  │                      │                           │                 │
  │  GET /api/session    │                           │                 │
  │─────────────────────>│                           │                 │
  │                      │──────────────────────────────────────────> │
  │                      │                           │   401 (JWT expired)
  │                      │<──────────────────────────────────────────  │
  │                      │  status 401?              │                 │
  │                      │  already retried? ──Yes──> reject           │
  │                      │  refresh endpoint? ─Yes──> reject           │
  │                      │                           │                 │
  │                      │  silentRefresh()          │                 │
  │                      │─────────────────────────> │                 │
  │                      │            inFlight already? ──Yes──> wait  │
  │                      │                           │  POST /api/session/refresh-token
  │                      │                           │────────────────>│
  │                      │                           │<────────────────│
  │                      │                           │  { jwtToken }   │
  │                      │<─────────────────────────ー│                 │
  │                      │  set new JWT in Zustand   │                 │
  │                      │  retry original request   │                 │
  │                      │──────────────────────────────────────────> │
  │                      │<──────────────────────────────────────────  │
  │<─────────────────────│  200 OK                   │                 │
```

---

## 5. Silent Refresh on Expired JWT (GraphQL)

When a GraphQL request returns a `TOKEN_EXPIRED` error, the Apollo error link recovers automatically.

```
Browser          Apollo refreshLink          silentRefresh()          API
  │                    │                           │                   │
  │  GraphQL query     │                           │                   │
  │───────────────────>│                           │                   │
  │                    │─────────────────────────────────────────────>│
  │                    │                           │  { errors: [{ extensions: { code: 'TOKEN_EXPIRED' } }] }
  │                    │<─────────────────────────────────────────────│
  │                    │  TOKEN_EXPIRED?            │                   │
  │                    │                           │                   │
  │                    │  silentRefresh()          │                   │
  │                    │─────────────────────────> │                   │
  │                    │            inFlight already? ──Yes──> wait    │
  │                    │                           │  POST /api/session/refresh-token
  │                    │                           │──────────────────>│
  │                    │                           │<──────────────────│
  │                    │<─────────────────────────ー│                   │
  │                    │  retry with new JWT        │                   │
  │                    │─────────────────────────────────────────────>│
  │                    │<─────────────────────────────────────────────│
  │<───────────────────│  data                     │                   │
```

---

## 6. Refresh Token Theft Detection

If a refresh token that was already rotated (revoked) is used again, the backend assumes theft and invalidates all sessions for that user.

```
API
 │
 │  POST /session/refresh-token (with old, already-revoked token)
 │
 │  findByToken → found
 │  stored.revoked !== null ──> revokeAllForUser(userId)
 │  throw INVALID_REFRESH_TOKEN (401)
 │
 │  All sessions for this user are now revoked.
 │  User must log in again on all devices.
```

---

## Concurrency: the `silentRefresh` singleton

Multiple triggers (route guard, Axios interceptor, Apollo error link) can all call `silentRefresh()` at the same time — for example on a page reload where several GraphQL queries fire simultaneously.

`silentRefresh` (in `src/api/silentRefresh.ts`) uses a shared in-flight promise to ensure only **one** HTTP request is made regardless of how many callers arrive concurrently:

```
Caller A ──> silentRefresh() ──> starts POST /session/refresh-token ──> resolves → new JWT
Caller B ──> silentRefresh() ──> inFlight exists → waits ─────────────────────────> same JWT
Caller C ──> silentRefresh() ──> inFlight exists → waits ─────────────────────────> same JWT
```

Without this, each concurrent caller would send its own refresh request, each creating a new session and leaving the others orphaned (not revoked).

---

## Cookie details

| Attribute | Value | Reason |
|---|---|---|
| `HttpOnly` | ✓ | JavaScript cannot read it — eliminates XSS theft |
| `SameSite=Lax` | ✓ | Sent on same-site navigations, blocked on cross-site requests — prevents CSRF |
| `Path=/` | `/` | Sent for all paths. Needed because the Vite proxy prefixes requests with `/api/`, which would break a more restrictive path like `/session` |
| `Secure` | production only | Requires HTTPS — omitted in development |
| `Max-Age` | 7 days (604800s) | Persists across browser restarts |
