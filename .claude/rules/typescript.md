---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript rules

`tsconfig.json` has `strict` and `noUncheckedIndexedAccess` on. Keep them on.

- No `any` (explicit or implicit). Use `unknown` and narrow, or a Zod-inferred type.
- No non-null `!` unless the invariant is proven on the line above; prefer an early return.
- No `@ts-ignore`. If `@ts-expect-error` is unavoidable, add a one-line reason.
- Type API data twice at the boundary: the raw DTO (what the server sends) and the domain type (what the UI uses). Map in `features/*/api/`.
- Derive types from Zod schemas: `type SignInInput = z.infer<typeof signInSchema>`.
- Model screen/request states with discriminated unions, not parallel booleans.
- Props: a named `type XxxProps`. Optional callbacks are optional, not `() => void | undefined`.
- Icon names: `React.ComponentProps<typeof Ionicons>['name']`, never `string`.
- Exported functions and hooks declare their return type when it is not obvious.
- `as` casts only for narrowing literals (`as const`) or after validation.

```ts
// Good: validated boundary
const LoginResponse = z.object({ status: z.literal(1), token: z.string(), message: z.string() });
export type LoginResponse = z.infer<typeof LoginResponse>;

// Bad
const data: any = res.data;
```

Before reporting work as done: `npm run typecheck` with zero errors.
