# API integration and authentication

## Backend facts (verified in `aigma-backend`, read-only)

- Base: Laravel 9, routes in `routes/api.php`, customer guard `auth:customer-api` (Passport) with scope `customer`.
- `POST /api/login` → `{ status: 1, message, token, favorite, cart }` on success, `{ status: 0, message }` on failure — **both with HTTP 200**.
- Tokens are Passport **personal access tokens**; there is **no refresh-token endpoint**.
- Auth endpoints: `register`, `login`, `logout`, `social-login`, `sent-verify-code`, `resend-verification-code`, `email-verify`, `sms-verify`, `otp-confirm`, `reset-password-sent`, `reset-otp-confirm`, `reset-password`, `get-user`.

Always re-check the controller before typing a response — do not assume fields.

## Environment

```ts
// src/lib/env.ts
import { z } from 'zod';
const Env = z.object({ EXPO_PUBLIC_API_URL: z.string().url() });
export const env = Env.parse({ EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL });
```

Expo inlines `process.env.EXPO_PUBLIC_*` at build time — reference each variable literally (no dynamic `process.env[key]`).

## Secure storage

```ts
// src/lib/secure-storage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'aigma.accessToken';
export const tokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
```

Keep stored values small (a token, not user objects). SecureStore is async — load the token once at startup into memory.

## Errors

```ts
// src/api/errors.ts
export type ApiErrorKind = 'network' | 'timeout' | 'unauthorized' | 'validation' | 'server' | 'business';
export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
    public fieldErrors?: Record<string, string[]>,
  ) { super(message); }
}
export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
```

## Axios client

```ts
// src/api/client.ts
import axios, { AxiosError } from 'axios';
import { env } from '@/lib/env';
import { ApiError } from './errors';
import { session } from '@/features/auth/session'; // in-memory token + signOut()

export const http = axios.create({
  baseURL: `${env.EXPO_PUBLIC_API_URL}/api`,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use(config => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  response => {
    // AIGMA envelope: failures arrive as HTTP 200 with status 0
    const body = response.data as { status?: number; message?: string; errors?: Record<string, string[]> };
    if (body && body.status === 0) {
      throw new ApiError(body.errors ? 'validation' : 'business', body.message ?? 'Request failed', response.status, body.errors);
    }
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.code === 'ECONNABORTED') throw new ApiError('timeout', 'The request timed out. Please try again.');
    if (!error.response) throw new ApiError('network', 'No internet connection.');
    const { status, data } = error.response;
    if (status === 401) { void session.expire(); throw new ApiError('unauthorized', 'Your session has expired. Please sign in again.', 401); }
    if (status === 422) throw new ApiError('validation', data?.message ?? 'Please check your input.', 422, data?.errors);
    throw new ApiError('server', data?.message ?? 'Something went wrong. Please try again.', status);
  },
);
```

## Feature API function (boundary validation)

```ts
// src/features/auth/api/auth.api.ts
import { z } from 'zod';
import { http } from '@/api/client';

const LoginDto = z.object({ status: z.literal(1), message: z.string(), token: z.string().min(1) });

export async function login(input: { email: string; password: string }): Promise<{ token: string }> {
  const { data } = await http.post('/login', input);
  const dto = LoginDto.parse(data);
  return { token: dto.token };
}
```

## Session expiry — single-flight sign-out

```ts
// src/features/auth/session.ts
import { tokenStorage } from '@/lib/secure-storage';
import { queryClient } from '@/lib/query-client';
import { useSessionStore } from './store/session.store';

let token: string | null = null;
let expiring: Promise<void> | null = null;

export const session = {
  getToken: () => token,
  async start(newToken: string) { token = newToken; await tokenStorage.set(newToken); useSessionStore.getState().setSignedIn(); },
  async restore() { token = await tokenStorage.get(); useSessionStore.getState().setStatus(token ? 'signedIn' : 'signedOut'); },
  expire() {
    // many requests can 401 at once — run cleanup exactly once
    expiring ??= (async () => {
      token = null;
      await tokenStorage.clear();
      queryClient.clear();
      useSessionStore.getState().reset();
    })().finally(() => { expiring = null; });
    return expiring;
  },
};
```

Explicit sign-out: call `POST /logout` (ignore its failure), then `session.expire()`.

## Token refresh — only if the backend adds a refresh endpoint

Do not implement until the endpoint exists. Pattern when it does:

```ts
let refreshing: Promise<string> | null = null;

async function refreshOnce(): Promise<string> {
  refreshing ??= refreshToken().finally(() => { refreshing = null; }); // one request shared by all callers
  return refreshing;
}

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !original || original._retried || original.url?.includes('/refresh')) throw error;
  original._retried = true;
  try {
    const newToken = await refreshOnce();
    original.headers.Authorization = `Bearer ${newToken}`;
    return http(original);
  } catch {
    await session.expire();
    throw error;
  }
});
```

## Social sign-in

Google/Facebook via `expo-auth-session` → send the provider token to `POST /api/social-login`. iOS must also offer Sign in with Apple when other social logins exist (needs a backend endpoint that does not exist yet — flag it, do not fake it).
