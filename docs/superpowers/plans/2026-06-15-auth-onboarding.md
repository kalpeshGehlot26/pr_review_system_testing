# Auth + Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mock login / signup / forgot-password / 3-step onboarding in front of the existing chat app, with chat as the auth-gated homepage and sessions persisted to localStorage.

**Architecture:** A dedicated `useAuthStore` (Zustand + persist middleware) holds accounts and the current session in localStorage, separate from the existing chat store. A `RouteGuard` client component enforces redirects per route. Auth screens reuse the chat app's visual language via shared `AuthShell` / `Field` components. Verification is Playwright (functional) + screenshot compare (visual).

**Tech Stack:** Next.js 14 (app router), React 18, TypeScript, Tailwind, Zustand (`persist`), lucide-react, Playwright.

**Environment note:** Repo is not git-initialized — "Checkpoint" steps run the verify gate instead of committing. Run all node commands after `nvm use 20`.

---

## File Structure

| File | Responsibility | Status |
|------|----------------|--------|
| `lib/avatarColors.ts` | Avatar palette + interest/status options | ✅ exists |
| `lib/authStore.ts` | Accounts, session, signup/login/logout/onboarding (persisted) | create |
| `components/RouteGuard.tsx` | Per-route redirect enforcement + hydration splash | create |
| `components/auth/AuthShell.tsx` | Split-screen brand+form layout | create |
| `components/auth/Field.tsx` | Labeled input with inline error | create |
| `components/auth/Stepper.tsx` | Onboarding progress indicator | create |
| `app/login/page.tsx` | Login screen | create |
| `app/signup/page.tsx` | Register screen | create |
| `app/forgot-password/page.tsx` | Mock reset-link request | create |
| `app/onboarding/page.tsx` | 3-step guided setup | create |
| `app/page.tsx` | Chat homepage, wrapped in protected guard | modify |
| `components/NavSidebar.tsx` | Show signed-in user + logout control | modify |
| `tests/helpers.ts` | `seedAuth(page)` for chat tests | create |
| `tests/feature.spec.ts` | Add seeded auth in beforeEach | modify |
| `tests/auth.spec.ts` | Auth + onboarding + guard tests | create |

---

## Task 1: Auth store

**Files:**
- Create: `lib/authStore.ts`

- [ ] **Step 1: Write the store**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_AVATAR_COLOR } from "./avatarColors";

export interface Account {
  id: string;
  name: string;
  email: string;
  password: string; // mock only — plaintext, demo use
  avatarColor: string;
  status: string;
  interests: string[];
  onboarded: boolean;
}

interface Result {
  ok: boolean;
  error?: string;
}

interface AuthState {
  accounts: Account[];
  currentUserId: string | null;
  hydrated: boolean;
  setHydrated: () => void;
  signup: (data: { name: string; email: string; password: string }) => Result;
  login: (email: string, password: string) => Result;
  logout: () => void;
  completeOnboarding: (data: {
    avatarColor: string;
    status: string;
    interests: string[];
  }) => void;
  updateProfile: (patch: Partial<Account>) => void;
}

let seq = 1;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: [],
      currentUserId: null,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      signup: ({ name, email, password }) => {
        const normalized = email.trim().toLowerCase();
        if (get().accounts.some((a) => a.email === normalized)) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const account: Account = {
          id: `u-${Date.now()}-${seq++}`,
          name: name.trim(),
          email: normalized,
          password,
          avatarColor: DEFAULT_AVATAR_COLOR,
          status: "Available",
          interests: [],
          onboarded: false,
        };
        set({ accounts: [...get().accounts, account], currentUserId: account.id });
        return { ok: true };
      },

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const account = get().accounts.find((a) => a.email === normalized);
        if (!account || account.password !== password) {
          return { ok: false, error: "Invalid email or password." };
        }
        set({ currentUserId: account.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      completeOnboarding: ({ avatarColor, status, interests }) => {
        const id = get().currentUserId;
        if (!id) return;
        set({
          accounts: get().accounts.map((a) =>
            a.id === id ? { ...a, avatarColor, status, interests, onboarded: true } : a
          ),
        });
      },

      updateProfile: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        });
      },
    }),
    {
      name: "loop-eng-auth",
      partialize: (s) => ({ accounts: s.accounts, currentUserId: s.currentUserId }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export const selectCurrentAccount = (s: AuthState): Account | null =>
  s.accounts.find((a) => a.id === s.currentUserId) ?? null;

export const selectIsAuthenticated = (s: AuthState): boolean => s.currentUserId !== null;
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: `✓ Compiled successfully` (store is unused so far — no runtime, just types).

---

## Task 2: RouteGuard

**Files:**
- Create: `components/RouteGuard.tsx`

- [ ] **Step 1: Write the guard**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  selectCurrentAccount,
  selectIsAuthenticated,
  useAuthStore,
} from "@/lib/authStore";

type Mode = "protected" | "guest" | "onboarding";

function Splash() {
  return (
    <div
      data-testid="auth-splash"
      className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
    </div>
  );
}

export default function RouteGuard({
  mode,
  children,
}: {
  mode: Mode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const authed = useAuthStore(selectIsAuthenticated);
  const account = useAuthStore(selectCurrentAccount);
  const onboarded = account?.onboarded ?? false;

  useEffect(() => {
    if (!hydrated) return;
    if (mode === "protected") {
      if (!authed) router.replace("/login");
      else if (!onboarded) router.replace("/onboarding");
    } else if (mode === "guest") {
      if (authed && onboarded) router.replace("/");
    } else if (mode === "onboarding") {
      if (!authed) router.replace("/login");
      else if (onboarded) router.replace("/");
    }
  }, [hydrated, authed, onboarded, mode, router]);

  if (!hydrated) return <Splash />;

  // Avoid rendering protected content for a frame before redirect fires.
  if (mode === "protected" && (!authed || !onboarded)) return <Splash />;
  if (mode === "guest" && authed && onboarded) return <Splash />;
  if (mode === "onboarding" && (!authed || onboarded)) return <Splash />;

  return <>{children}</>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

---

## Task 3: Shared auth UI (AuthShell + Field)

**Files:**
- Create: `components/auth/AuthShell.tsx`
- Create: `components/auth/Field.tsx`

- [ ] **Step 1: Write AuthShell**

```tsx
import { MessagesSquare } from "lucide-react";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MessagesSquare className="h-6 w-6" />
          ChatPulse
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Where teams talk,<br />share, and ship.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Real-time conversations, organized chats, and everything your team
            needs in one calm, modern workspace.
          </p>
        </div>
        <div className="text-xs text-white/60">© 2026 ChatPulse — demo build</div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10" />
      </aside>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-violet-50 to-white px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Write Field**

```tsx
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  testid: string;
}

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  testid,
}: FieldProps) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <input
        data-testid={testid}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-300 focus:ring-rose-200"
            : "border-slate-200 focus:border-violet-300 focus:ring-violet-200"
        }`}
      />
      {error && (
        <span data-testid={`${testid}-error`} className="mt-1 block text-xs text-rose-500">
          {error}
        </span>
      )}
    </label>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

---

## Task 4: Login page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Field from "@/components/auth/Field";
import RouteGuard from "@/components/RouteGuard";
import { useAuthStore } from "@/lib/authStore";

function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    router.replace("/");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to ChatPulse."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-violet-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={submit} data-testid="login-form">
        <Field testid="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field testid="login-password" label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && (
          <p data-testid="login-error" className="mb-3 text-xs text-rose-500">{error}</p>
        )}
        <div className="mb-4 text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-violet-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" data-testid="login-submit" className="w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600">
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <RouteGuard mode="guest">
      <LoginForm />
    </RouteGuard>
  );
}
```

- [ ] **Step 2: Checkpoint — build**

Run: `npm run build`
Expected: route `/login` listed, `✓ Compiled successfully`.

---

## Task 5: Signup page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Field from "@/components/auth/Field";
import RouteGuard from "@/components/RouteGuard";
import { useAuthStore } from "@/lib/authStore";

function SignupForm() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const res = signup({ name, email, password });
    if (!res.ok) {
      setErrors({ email: res.error ?? "Signup failed." });
      return;
    }
    router.replace("/onboarding");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start chatting in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} data-testid="signup-form">
        <Field testid="signup-name" label="Full name" value={name} onChange={setName} placeholder="Jane Cooper" error={errors.name} />
        <Field testid="signup-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
        <Field testid="signup-password" label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={errors.password} />
        <Field testid="signup-confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={errors.confirm} />
        <button type="submit" data-testid="signup-submit" className="mt-1 w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600">
          Create account
        </button>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <RouteGuard mode="guest">
      <SignupForm />
    </RouteGuard>
  );
}
```

- [ ] **Step 2: Checkpoint — build**

Run: `npm run build`
Expected: route `/signup` listed, `✓ Compiled successfully`.

---

## Task 6: Forgot-password page

**Files:**
- Create: `app/forgot-password/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Field from "@/components/auth/Field";
import RouteGuard from "@/components/RouteGuard";

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setSent(true); // mock — no real email
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a link to get back in."
      footer={
        <Link href="/login" className="font-semibold text-violet-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div data-testid="forgot-success" className="rounded-xl bg-emerald-50 p-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-2 text-sm font-medium text-slate-700">Check your inbox</p>
          <p className="mt-1 text-xs text-slate-500">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} data-testid="forgot-form">
          <Field testid="forgot-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={error} />
          <button type="submit" data-testid="forgot-submit" className="w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600">
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <RouteGuard mode="guest">
      <ForgotForm />
    </RouteGuard>
  );
}
```

- [ ] **Step 2: Checkpoint — build**

Run: `npm run build`
Expected: route `/forgot-password` listed, `✓ Compiled successfully`.

---

## Task 7: Onboarding (Stepper + 3 steps)

**Files:**
- Create: `components/auth/Stepper.tsx`
- Create: `app/onboarding/page.tsx`

- [ ] **Step 1: Write Stepper**

```tsx
export default function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2" data-testid="stepper">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= current ? "w-8 bg-violet-500" : "w-4 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write onboarding page**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import RouteGuard from "@/components/RouteGuard";
import Stepper from "@/components/auth/Stepper";
import {
  AVATAR_COLORS,
  INTEREST_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/avatarColors";
import { selectCurrentAccount, useAuthStore } from "@/lib/authStore";

function Onboarding() {
  const router = useRouter();
  const account = useAuthStore(selectCurrentAccount);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [color, setColor] = useState(AVATAR_COLORS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [interests, setInterests] = useState<string[]>([]);

  const name = account?.name ?? "there";

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const finish = () => {
    completeOnboarding({ avatarColor: color, status, interests });
    router.replace("/");
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100 p-6">
      <div data-testid="onboarding-card" className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-violet-200/50">
        <Stepper current={step} total={3} />

        {step === 0 && (
          <div data-testid="onboarding-step-0">
            <h2 className="text-center text-xl font-bold text-slate-800">Welcome, {name}!</h2>
            <p className="mt-1 text-center text-sm text-slate-500">Pick your avatar color.</p>
            <div className="my-6 flex justify-center">
              <Avatar name={name} color={color} size="xl" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-testid={`color-${c.id}`}
                  onClick={() => setColor(c.value)}
                  className={`h-12 rounded-xl bg-gradient-to-br ${c.value} transition-transform hover:scale-105 ${
                    color === c.value ? "ring-2 ring-violet-500 ring-offset-2" : ""
                  }`}
                />
              ))}
            </div>
            <button type="button" data-testid="onboarding-next" onClick={() => setStep(1)} className="mt-7 w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-violet-600">
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div data-testid="onboarding-step-1">
            <h2 className="text-center text-xl font-bold text-slate-800">Tell us about you</h2>
            <p className="mt-1 text-center text-sm text-slate-500">Pick a status and your interests.</p>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-slate-600">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} type="button" data-testid={`status-${s}`} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-slate-600">Interests</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button key={i} type="button" data-testid={`interest-${i}`} onClick={() => toggleInterest(i)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${interests.includes(i) ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-7 flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">Back</button>
              <button type="button" data-testid="onboarding-next" onClick={() => setStep(2)} className="flex-1 rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-violet-600">Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div data-testid="onboarding-step-2" className="text-center">
            <div className="my-4 flex justify-center">
              <Avatar name={name} color={color} size="xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">You&apos;re all set, {name}!</h2>
            <p className="mt-1 text-sm text-slate-500">Status: {status}{interests.length > 0 ? ` · ${interests.join(", ")}` : ""}</p>
            <button type="button" data-testid="onboarding-finish" onClick={finish} className="mt-7 w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-violet-600">
              Enter chat
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <RouteGuard mode="onboarding">
      <Onboarding />
    </RouteGuard>
  );
}
```

- [ ] **Step 3: Checkpoint — build**

Run: `npm run build`
Expected: route `/onboarding` listed, `✓ Compiled successfully`.

---

## Task 8: Chat integration (guard + signed-in user + logout)

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/NavSidebar.tsx`

- [ ] **Step 1: Wrap chat in the protected guard**

Replace `app/page.tsx` contents:

```tsx
import ChatList from "@/components/ChatList";
import ConversationPanel from "@/components/ConversationPanel";
import DetailsPanel from "@/components/DetailsPanel";
import NavSidebar from "@/components/NavSidebar";
import RouteGuard from "@/components/RouteGuard";

export default function Home() {
  return (
    <RouteGuard mode="protected">
      <main
        data-testid="feature-root"
        className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100 p-4"
      >
        <div
          data-testid="chat-app"
          className="flex h-full max-h-[900px] w-full max-w-[1400px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-200/50"
        >
          <NavSidebar />
          <ChatList />
          <ConversationPanel />
          <DetailsPanel />
        </div>
      </main>
    </RouteGuard>
  );
}
```

- [ ] **Step 2: Show signed-in user + add logout in NavSidebar**

In `components/NavSidebar.tsx`, add imports at top (after existing imports):

```tsx
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { selectCurrentAccount, useAuthStore } from "@/lib/authStore";
```

Inside the component, after the existing `selectTab` hook, add:

```tsx
  const router = useRouter();
  const account = useAuthStore(selectCurrentAccount);
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
    router.replace("/login");
  };
```

Replace the avatar block:

```tsx
      <div className="mb-4" data-testid="nav-avatar">
        <Avatar name="You" color="from-violet-500 to-indigo-600" size="md" online />
      </div>
```

with:

```tsx
      <div className="mb-4" data-testid="nav-avatar">
        <Avatar
          name={account?.name ?? "You"}
          color={account?.avatarColor ?? "from-violet-500 to-indigo-600"}
          size="md"
          online
        />
      </div>
```

Then add a logout button immediately AFTER the existing settings button (before `</nav>`):

```tsx
      <button
        type="button"
        data-testid="nav-logout"
        onClick={handleLogout}
        title="Log out"
        className="group mt-1 flex w-[60px] flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-medium text-slate-400 transition-all duration-150 hover:bg-rose-50 hover:text-rose-500"
      >
        <LogOut className="h-[22px] w-[22px]" />
        <span>Log out</span>
      </button>
```

- [ ] **Step 3: Checkpoint — build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

---

## Task 9: Test helper + fix existing chat tests

**Files:**
- Create: `tests/helpers.ts`
- Modify: `tests/feature.spec.ts`

- [ ] **Step 1: Write seedAuth helper**

```ts
import type { Page } from "@playwright/test";

/**
 * Seed an authenticated + onboarded account into localStorage BEFORE the app
 * loads, so protected pages (chat) render without going through the UI.
 * Matches the zustand-persist storage shape for key "loop-eng-auth".
 */
export async function seedAuth(page: Page) {
  const value = JSON.stringify({
    state: {
      accounts: [
        {
          id: "seed-1",
          name: "Demo User",
          email: "demo@example.com",
          password: "secret1",
          avatarColor: "from-violet-400 to-indigo-500",
          status: "Available",
          interests: ["Design"],
          onboarded: true,
        },
      ],
      currentUserId: "seed-1",
    },
    version: 0,
  });
  await page.addInitScript(
    ([k, v]) => window.localStorage.setItem(k, v),
    ["loop-eng-auth", value] as const
  );
}
```

- [ ] **Step 2: Use it in feature.spec.ts**

Change the top of `tests/feature.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { seedAuth } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedAuth(page);
  await page.goto("/");
});
```

- [ ] **Step 3: Run chat tests**

Run: `npm run verify -- feature.spec.ts`
Expected: all 10 chat tests PASS (chat renders because seeded auth is onboarded).

---

## Task 10: Auth Playwright tests

**Files:**
- Create: `tests/auth.spec.ts`

- [ ] **Step 1: Write the tests**

```ts
import { test, expect } from "@playwright/test";
import { seedAuth } from "./helpers";

test("unauthenticated visit to / redirects to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId("login-form")).toBeVisible();
});

test("signup -> onboarding (3 steps) -> chat", async ({ page }) => {
  await page.goto("/signup");
  await page.getByTestId("signup-name").fill("Ada Lovelace");
  await page.getByTestId("signup-email").fill("ada@example.com");
  await page.getByTestId("signup-password").fill("secret1");
  await page.getByTestId("signup-confirm").fill("secret1");
  await page.getByTestId("signup-submit").click();

  await expect(page.getByTestId("onboarding-step-0")).toBeVisible();
  await page.getByTestId("color-blue").click();
  await page.getByTestId("onboarding-next").click();

  await expect(page.getByTestId("onboarding-step-1")).toBeVisible();
  await page.getByTestId("interest-Design").click();
  await page.getByTestId("onboarding-next").click();

  await expect(page.getByTestId("onboarding-step-2")).toBeVisible();
  await page.getByTestId("onboarding-finish").click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("chat-app")).toBeVisible();
});

test("signup validation: mismatch + short password", async ({ page }) => {
  await page.goto("/signup");
  await page.getByTestId("signup-name").fill("Test");
  await page.getByTestId("signup-email").fill("bad");
  await page.getByTestId("signup-password").fill("123");
  await page.getByTestId("signup-confirm").fill("456");
  await page.getByTestId("signup-submit").click();
  await expect(page.getByTestId("signup-email-error")).toBeVisible();
  await expect(page.getByTestId("signup-password-error")).toBeVisible();
  await expect(page.getByTestId("signup-confirm-error")).toBeVisible();
});

test("login with wrong credentials shows error", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/login");
  await page.getByTestId("login-email").fill("demo@example.com");
  await page.getByTestId("login-password").fill("wrongpass");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("login-error")).toBeVisible();
});

test("login with correct seeded credentials -> chat", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/login");
  await page.getByTestId("login-email").fill("demo@example.com");
  await page.getByTestId("login-password").fill("secret1");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("chat-app")).toBeVisible();
});

test("logout returns to login", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/");
  await expect(page.getByTestId("chat-app")).toBeVisible();
  await page.getByTestId("nav-logout").click();
  await expect(page).toHaveURL(/\/login$/);
});

test("forgot password shows success state", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByTestId("forgot-email").fill("demo@example.com");
  await page.getByTestId("forgot-submit").click();
  await expect(page.getByTestId("forgot-success")).toBeVisible();
});
```

- [ ] **Step 2: Run full gate**

Run: `npm run verify`
Expected: all chat + auth tests PASS, no console errors.

---

## Task 11: Visual verification loop

**Files:** none (verification only)

- [ ] **Step 1: Start dev server + capture each auth screen**

```bash
npm run dev   # background
APP_URL=http://localhost:3000/login npm run shot -- 1280 800
APP_URL=http://localhost:3000/signup npm run shot -- 1280 800
APP_URL=http://localhost:3000/forgot-password npm run shot -- 1280 800
```
(onboarding + chat require a seeded session; verify via Playwright above.)

- [ ] **Step 2: Visual review**

Confirm each screen matches the chat app's visual language: violet/blue gradient
brand panel, rounded cards, soft shadows, consistent typography. Fix gaps and
re-capture until the visual goal is met.

- [ ] **Step 3: Final gate**

Run: `npm run build && npm run verify`
Expected: build clean, all tests green → both halves of the goal met.

---

## Self-Review

**Spec coverage:**
- Routing + guard → Tasks 2, 4–8 ✅
- Auth store (persist) → Task 1 ✅
- Login / signup / forgot / onboarding screens → Tasks 4–7 ✅
- Chat integration (avatar + logout) → Task 8 ✅
- Existing chat tests keep passing → Task 9 ✅
- Testing matrix (protection, signup→onboarding→chat, login, logout, forgot) → Task 10 ✅
- Visual verification → Task 11 ✅

**Placeholder scan:** No TBD/TODO; every step has concrete code or exact commands. ✅

**Type consistency:** `Account` shape, `signup/login/logout/completeOnboarding` signatures, selectors (`selectCurrentAccount`, `selectIsAuthenticated`), and the persist key `loop-eng-auth` are identical across the store (Task 1), guard (Task 2), pages (Tasks 4–8), and the seed helper (Task 9). ✅
