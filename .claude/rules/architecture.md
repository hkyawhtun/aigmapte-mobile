---
paths:
  - "app/**"
  - "src/**"
  - "App.tsx"
---

# Architecture rules

## Where code goes

| Code | Location |
|---|---|
| Route file (Expo Router) | `app/**` — thin: read params, render a feature screen, nothing else |
| Feature screen, feature-only components | `src/features/<feature>/screens/`, `components/` |
| HTTP calls + DTO → domain mapping | `src/features/<feature>/api/` |
| TanStack Query hooks, mutations, query keys | `src/features/<feature>/hooks/` |
| Zod schemas (forms + API responses) | `src/features/<feature>/schemas/` |
| Feature Zustand store | `src/features/<feature>/store/` |
| Shared UI used by 2+ features | `src/components/` |
| Axios instance, `ApiError`, query client, storage, env | `src/api/`, `src/lib/` |
| Design tokens | `src/theme.ts` (use `brand`, `radius`) |

## Dependency direction

`app/` → `features/*/screens` → `features/*/hooks` → `features/*/api` → `src/api/client`

- UI components never import Axios or `src/api/client` directly.
- A feature imports another feature only through its `index.ts`. No deep imports like `features/auth/screens/Login`.
- `src/components/` never imports from `src/features/`.
- Circular imports between features are not allowed — move the shared piece to `src/lib/` or `src/components/`.

## Query keys

Define keys in one factory per feature (`hooks/keys.ts`), e.g. `practiceKeys.list(filters)`. Never inline string arrays in components.

## Size and simplicity

- Split a component when it exceeds ~200 lines or mixes data fetching with heavy layout.
- Do not add a layer (repository, service class, adapter) unless there are two real consumers or it isolates the backend's response format.
- Do not move or rename existing modules as a side effect of an unrelated task.
