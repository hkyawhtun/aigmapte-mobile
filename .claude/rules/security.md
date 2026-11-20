---
paths:
  - "src/api/**"
  - "src/lib/**"
  - "src/features/auth/**"
  - "src/features/**/store/**"
  - "app.json"
  - "app.config.*"
  - "eas.json"
  - ".env*"
---

# Security rules

## Credentials

- Access tokens (and refresh tokens, if the backend ever adds them) live **only** in `expo-secure-store`, behind a small wrapper in `src/lib/secure-storage.ts`.
- Never write tokens or passwords to AsyncStorage, Zustand `persist`, SQLite, logs, analytics, crash reports or URLs.
- Passwords exist only in form state for the duration of the request. Clear password fields after a failed attempt.
- The current AsyncStorage session in `AuthContext.tsx` is a demo token only. Do not copy that pattern for real tokens.

## Secrets and config

- No API keys or secrets in source, `app.json` or `EXPO_PUBLIC_*` variables — anything in the bundle is public.
- Third-party keys (scoring, payments) stay on the backend. The app calls the AIGMA API only.
- Base URLs come from `EXPO_PUBLIC_API_URL` read in one place (`src/lib/env.ts`), validated with Zod at startup.

## Input validation

- Validate API responses with Zod at the `features/*/api` boundary before they reach UI.
- Validate deep-link and route params before use.
- Forms use React Hook Form + Zod; the server remains the authority.

## Session lifecycle

- On sign-out **and** on a 401: delete the token, `queryClient.clear()`, reset user-scoped Zustand stores, route to sign-in.
- Only one sign-out/redirect may run at a time (guard against parallel 401s).
- Token refresh (if a refresh endpoint is added): single-flight — one refresh promise shared by all waiting requests; on refresh failure, sign out.

## Transport

- HTTPS only in preview/production builds. No `usesCleartextTraffic` outside development.
- Do not log request headers or bodies in production builds.
