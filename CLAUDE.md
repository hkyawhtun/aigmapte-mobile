# AIGMA PTE Mobile

PTE exam preparation app for iOS and Android. Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 (strict). Node.js 24.3+ required.
Backend: existing AIGMA Laravel 9 API (Passport auth) — **read-only for this project; never modify it.**

Detailed how-to guides live in the `mobile-development` skill (`.claude/skills/mobile-development/`).
File-scoped rules live in `.claude/rules/`.

## Commands

```bash
npm start              # Expo dev server (scan QR with Expo Go)
npm run android        # / npm run ios
npm run typecheck      # tsc --noEmit — must pass before any task is reported done
```

npm is the package manager (`package-lock.json`). Install Expo-native packages with `npx expo install <pkg>` so versions match the SDK.
No test runner is configured yet — never claim tests passed unless you actually ran them.

## Target stack

Expo Router · TanStack Query · Zustand · Axios · React Hook Form + Zod · expo-secure-store · expo-sqlite (only when offline data is needed).
These are **not all installed yet**. Add a library only when the feature being built needs it, and say so in the summary.

## Architecture rules

- Feature-based structure. Business logic in `src/features/<feature>/`; Expo Router route files in `app/` (thin — they render a feature screen).
- Shared, feature-agnostic UI in `src/components/`; shared infrastructure (HTTP client, storage, query client, env) in `src/lib/` or `src/api/`.
- Layers inside a feature: `api/` (HTTP + DTO mapping) → `hooks/` (Query/mutation hooks) → `screens/` + `components/` (UI). UI never calls Axios directly.
- A feature exposes its public surface through `index.ts`; other features import only from there.
- Prefer simple code over abstractions. No generic repositories, base classes or wrappers without a second real use.

## Coding standards

- Strict TypeScript, no `any` (use `unknown` + narrowing). Explicit types for every API request and response.
- Functional components and custom hooks only. Keep components small; extract when a file passes ~200 lines or logic repeats.
- Naming: `PascalCase` components/types, `useCamelCase` hooks, `camelCase` functions, `kebab-case` route files, `SCREAMING_SNAKE` constants.
- Every data-driven screen handles **loading, error, empty and success** states.
- No duplicated code — reuse `src/components/` and feature hooks.

## State management

| State | Tool |
|---|---|
| Server data (anything from the API) | TanStack Query |
| Global client state (session flags, preferences, in-progress mock test) | Zustand |
| Local UI state (inputs, toggles, modals) | `useState` / `useReducer` |
| Forms | React Hook Form + Zod |

Never copy server data into Zustand. Persist only what must survive a restart.

## API standards

- One Axios instance in `src/api/client.ts` with shared interceptors (auth header, error normalisation).
- The AIGMA API returns **HTTP 200 with `{ status: 0 }` on failure** — the client must normalise this into a typed `ApiError`.
- The backend issues long-lived Passport personal access tokens and has **no refresh endpoint today**. On 401: clear the session and send the user to sign-in. Implement single-flight token refresh only when a refresh endpoint exists.
- Do not invent endpoints. Check `../aigma/aigma-backend/routes/api.php` (read-only) or ask.

## Security

- Tokens and credentials only in `expo-secure-store`. Never in AsyncStorage, Zustand-persist, logs or URLs. Never store passwords.
- No secrets in the repo or bundle. `EXPO_PUBLIC_*` values are public by design.
- Validate all external input (API responses at the boundary, deep-link params, forms) with Zod.
- Sign-out and session expiry must clear the token, the Query cache and user-scoped stores.

## Workflow for every feature request

1. Analyse the requirement and inspect related files.
2. Identify affected feature modules.
3. Propose a short plan and explain any architectural decision.
4. Implement — without rewriting unrelated modules or adding unneeded dependencies.
5. Run `npm run typecheck` (and tests, when they exist); fix what you broke.
6. Summarise changed files and key decisions.

Ask only when an important requirement is genuinely unclear. Never invent APIs or requirements.

## Current state and known deviations (do not "fix" unprompted)

- `App.tsx` still holds the main tabs and screens; Expo Router is not adopted yet. The auth flow uses a small custom stack (`src/features/auth/AuthFlow.tsx`).
- `src/api/auth.ts` and `src/api/client.ts` are **demo** services (no network). Each auth method documents its real endpoint.
- `src/features/auth/AuthContext.tsx` persists a **demo** session in AsyncStorage. This must move to SecureStore + Zustand when the backend is connected.
- `src/features/auth/ui.tsx` holds form components that belong in `src/components/` once a second feature needs them.
- `src/theme.ts` has a legacy `colors` palette and the approved prototype `brand` palette — use `brand` for new UI.
- `design/` (prototype, concept PDFs) and `deliverables/` are documentation, not app code.
