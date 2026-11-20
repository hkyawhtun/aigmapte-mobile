# State and forms

## Decision table

| Question | Use |
|---|---|
| Does it come from the API? | TanStack Query |
| Needed by many screens, not from the API, must survive navigation? | Zustand |
| Only this screen/component? | `useState` / `useReducer` |
| User input with validation? | React Hook Form + Zod |
| Must survive app restart? | Zustand `persist` (non-sensitive) / SecureStore (tokens) / SQLite (large offline data) |

## Query client

```ts
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: (count, error) => !(isApiError(error) && ['unauthorized', 'validation', 'business'].includes(error.kind)) && count < 2,
    },
    mutations: { retry: false },
  },
});
```

## Query keys and hooks

```ts
// src/features/practice/hooks/keys.ts
export const practiceKeys = {
  all: ['practice'] as const,
  list: (skill: Skill) => [...practiceKeys.all, 'list', skill] as const,
  detail: (id: number) => [...practiceKeys.all, 'detail', id] as const,
};

// src/features/practice/hooks/usePracticeList.ts
export function usePracticeList(skill: Skill) {
  return useQuery({ queryKey: practiceKeys.list(skill), queryFn: () => fetchPracticeList(skill) });
}

// src/features/practice/hooks/useSubmitAnswer.ts
export function useSubmitAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitAnswer,
    onSuccess: (_result, vars) => qc.invalidateQueries({ queryKey: practiceKeys.detail(vars.questionId) }),
  });
}
```

## Rendering all four states

```tsx
function PracticeListScreen({ skill }: { skill: Skill }) {
  const q = usePracticeList(skill);
  if (q.isPending) return <ListSkeleton />;
  if (q.isError) return <ErrorState message={toMessage(q.error)} onRetry={() => q.refetch()} />;
  if (q.data.length === 0) return <EmptyState title="No questions yet" />;
  return <FlashList data={q.data} renderItem={...} estimatedItemSize={72} />;
}
```

## Zustand

```ts
// src/features/auth/store/session.store.ts
import { create } from 'zustand';

type Status = 'loading' | 'signedOut' | 'signedIn';
type SessionState = {
  status: Status;
  setStatus: (s: Status) => void;
  setSignedIn: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(set => ({
  status: 'loading',
  setStatus: status => set({ status }),
  setSignedIn: () => set({ status: 'signedIn' }),
  reset: () => set({ status: 'signedOut' }),
}));
```

- Select narrowly: `useSessionStore(s => s.status)` — never `useSessionStore()` in render.
- Persist with `persist(..., { name, storage: createJSONStorage(() => AsyncStorage), partialize })` — **only non-sensitive fields** (e.g. `onboarded`, preferences, an in-progress mock-test answer draft).
- Every user-scoped store exposes `reset()`; sign-out calls it.

## Forms: React Hook Form + Zod

```tsx
// src/features/auth/schemas/sign-in.schema.ts
export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
export type SignInInput = z.infer<typeof signInSchema>;

// src/features/auth/screens/SignInScreen.tsx
const { control, handleSubmit, setError, formState: { isSubmitting } } = useForm<SignInInput>({
  resolver: zodResolver(signInSchema),
  defaultValues: { email: '', password: '' },
});
const signIn = useSignIn();

const onSubmit = handleSubmit(async values => {
  try { await signIn.mutateAsync(values); }
  catch (e) {
    if (isApiError(e) && e.fieldErrors) Object.entries(e.fieldErrors).forEach(([k, v]) => setError(k as keyof SignInInput, { message: v[0] }));
    else setError('root', { message: toMessage(e) });
  }
});

<Controller control={control} name="email" render={({ field, fieldState }) =>
  <Field label="Email" icon="mail-outline" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />} />
```

Map Laravel 422/`errors` to field errors with `setError`. Keep schemas next to the feature; share only truly common ones (email, password policy) from `src/lib/validation.ts`.
