# Auth + Onboarding Flow — Design

**Date:** 2026-06-15
**Status:** Approved (design), pending implementation plan
**Project:** loop_eng (Next.js + Tailwind chat app)

## Purpose

Add a complete, mock authentication experience in front of the existing chat
app: **login, signup (register), forgot-password, and a guided onboarding
process**. The chat page becomes the auth-gated homepage. "Mock sign-in" is
backed by a global store, so accounts and sessions behave realistically without
a backend.

## Goals

- A user can register, get onboarded, and land in the chat — end to end.
- Returning users can log in; sessions survive page reload.
- A forgot-password screen with a realistic (mock) "reset link sent" flow.
- Chat is protected: unauthenticated visitors are redirected to login.
- The existing chat feature and its tests keep working.

## Non-goals (YAGNI)

- No real backend, email, JWT, or password hashing — this is a mock demo.
- No OAuth / social login.
- No password-reset *completion* page (the mock ends at "link sent").
- No multi-device session sync.

## Routing

| Route | Purpose | Guard |
|-------|---------|-------|
| `/` | Chat (homepage) | Requires auth + completed onboarding |
| `/login` | Sign in | Guest-only (redirect to `/` if already authed) |
| `/signup` | Register | Guest-only |
| `/forgot-password` | Request reset link (mock) | Guest-only |
| `/onboarding` | 3-step guided setup | Requires auth; redirect to `/` if already onboarded |

**Guard behavior (`RouteGuard`):**
- `mode="protected"`: not authed → `/login`; authed but not onboarded → `/onboarding`.
- `mode="guest"`: already authed + onboarded → `/`.
- `mode="onboarding"`: not authed → `/login`; already onboarded → `/`.
- While the persisted store rehydrates, render a lightweight splash to avoid a
  redirect flash on first paint.

## State: `useAuthStore` (Zustand + persist → localStorage)

```
Account {
  id, name, email, password (mock, plaintext),
  avatarColor, status?, interests[], onboarded
}

state: { accounts: Account[], currentUserId: string | null, hydrated: boolean }

actions:
  signup({name, email, password}) -> { ok, error? }   // rejects duplicate email
  login(email, password)          -> { ok, error? }   // validates against accounts
  logout()
  completeOnboarding({avatarColor, status, interests})
  updateProfile(patch)

selectors: selectCurrentAccount, selectIsAuthenticated
```

- Persist key `loop-eng-auth`; `partialize` stores `accounts` + `currentUserId`.
- `hydrated` is flipped via `onRehydrateStorage` so guards wait for localStorage.

## Screens

**Login / Signup** — split-screen: left brand panel (gradient + product
tagline, consistent with chat's violet/blue), right form card.
- Login: email, password, "Forgot password?" link, link to signup. Invalid
  credentials show an inline error.
- Signup: name, email, password, confirm password. Inline validation
  (required fields, email format, password length ≥ 6, passwords match,
  duplicate email). On success → `/onboarding`.

**Forgot password** — centered card: email input → on submit, swap to a
success state ("If an account exists, a reset link has been sent"). Link back
to login.

**Onboarding** — centered stepper, 3 steps with a progress indicator:
1. Profile: confirm display name + pick an avatar color (palette).
2. Interests/status: multi-select interests + a status.
3. Welcome: summary + "Enter chat" → `completeOnboarding()` → `/`.
Back/Next navigation; state held locally until the final commit to the store.

## Chat integration

- `NavSidebar` top avatar reflects the signed-in user (name + chosen color).
- Add a **logout** control (icon button near settings) → `logout()` → `/login`.
- Chat's existing `useChatStore` is unchanged; the signed-in identity comes from
  `useAuthStore`. The two stores stay separate (auth vs chat data).

## Reusable components

`AuthShell` (split-screen layout), `Field` (labeled input + error), `Stepper`
(onboarding progress), plus reuse of the existing `Avatar`.

## Error handling

- Form-level inline errors (no toasts needed): required, email format, password
  length, password mismatch, duplicate email, invalid login.
- Guard splash prevents redirect flicker during rehydration.

## Testing (Playwright — the loop's functional gate)

- Route protection: visiting `/` unauthenticated redirects to `/login`.
- Signup → onboarding (3 steps) → lands on chat.
- Logout → `/login`; login with the same credentials → back to chat.
- Login with wrong credentials shows an error.
- Forgot-password submit shows the success state.
- **Existing chat tests:** add a `seedAuth(page)` helper (via
  `addInitScript` writing the persisted `loop-eng-auth` localStorage value) so
  `feature.spec.ts` renders chat directly without going through the UI.

## Verification (both halves of the goal)

- Functional: `npm run verify` — all auth + chat Playwright tests green, no
  console errors.
- Visual: capture each new screen with `npm run shot` and confirm it matches
  the chat app's visual language (violet/blue, rounded, soft shadows).
