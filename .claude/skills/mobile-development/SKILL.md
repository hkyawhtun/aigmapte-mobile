---
name: mobile-development
description: How to build features in the AIGMA PTE React Native / Expo app — feature-module architecture, Expo Router navigation, Axios + TanStack Query + Zustand, React Hook Form + Zod, secure authentication with SecureStore, offline and app-lifecycle handling, performance, Android/iOS differences, testing and EAS production builds. Use when creating or changing screens, features, navigation, API integration, state, auth, or build configuration in this project.
---

# Mobile development (AIGMA PTE)

Project rules are in `CLAUDE.md` and `.claude/rules/`. This skill is the **how**. Read only the reference you need:

| Task | Read |
|---|---|
| Routes, layouts, auth guards, deep links | `references/navigation.md` |
| Axios client, error handling, auth/token flow, SecureStore | `references/api-and-auth.md` |
| TanStack Query, Zustand, forms (RHF + Zod) | `references/state-and-forms.md` |
| Shared UI components, styling, accessibility, performance | `references/ui-and-performance.md` |
| App lifecycle, offline, SQLite | `references/offline-and-lifecycle.md` |
| Android vs iOS, testing, EAS builds and release | `references/platform-testing-release.md` |

## Workflow for a new feature

1. **Analyse** the request. List screens, data, and user states (loading / error / empty / success).
2. **Inspect** existing code: `App.tsx`, `src/features/`, `src/api/`, `src/theme.ts`. Reuse before creating.
3. **Check the backend contract** in `../aigma/aigma-backend/routes/api.php` and its controller (read-only). Never invent endpoints or fields; if one is missing, say so and use a typed demo implementation behind the same function signature.
4. **Plan**: affected modules, new files, any new dependency (and why). Keep it short.
5. **Implement** bottom-up: schemas/types → `api/` → `hooks/` → `components/` → `screens/` → route file.
6. **Verify**: `npm run typecheck`; run tests if they exist; for UI, run the app (`npm start`) or a web export and look at it.
7. **Summarise** changed files and decisions. Report failures honestly.

## Feature module layout

```
src/features/practice/
├── api/
│   ├── practice.api.ts        # HTTP calls via src/api/client, DTO → domain mapping
│   └── practice.dto.ts        # Zod schemas for raw server payloads
├── hooks/
│   ├── keys.ts                # query-key factory
│   ├── usePracticeList.ts     # useQuery wrapper
│   └── useSubmitAnswer.ts     # useMutation wrapper
├── components/                # feature-only UI (QuestionCard, Timer…)
├── screens/                   # full screens rendered by app/ routes
├── schemas/                   # form schemas
├── store/                     # Zustand slice, only if truly global client state
├── types.ts                   # domain types used by UI
└── index.ts                   # public exports — the only import path for other features
```

Create only the folders a feature needs. A two-screen feature with one query does not need `store/` or `schemas/`.

## Target app layout

```
app/                            # Expo Router — thin route files only
├── _layout.tsx                 # providers (QueryClient, SafeArea), session gate
├── (auth)/_layout.tsx          # stack: onboarding, sign-in, register, otp, forgot…
├── (app)/_layout.tsx           # signed-in stack
├── (app)/(tabs)/_layout.tsx    # Home · Practice · Mock · Progress · Profile
└── (app)/practice/[taskId].tsx
src/
├── api/                        # client.ts (Axios), errors.ts, envelope.ts
├── components/                 # Button, Field, Screen, EmptyState, ErrorState…
├── features/                   # auth, home, practice, mock-test, courses, progress, profile
├── lib/                        # env.ts, secure-storage.ts, query-client.ts
└── theme.ts
```

Migration from today's `App.tsx` + custom auth stack happens **one feature at a time** and only when requested — see `references/navigation.md` → "Adopting Expo Router".

## Non-negotiables

- UI never calls Axios; screens use feature hooks.
- Server data lives in TanStack Query only.
- Tokens only in SecureStore.
- Every data screen renders loading, error (with retry), empty and success.
- `npm run typecheck` passes before you say "done".
