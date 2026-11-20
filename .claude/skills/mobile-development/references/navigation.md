# Navigation with Expo Router

## Adopting Expo Router (one-time migration — only when requested)

1. `npx expo install expo-router expo-linking expo-constants`
2. `package.json`: `"main": "expo-router/entry"`.
3. `app.json`: add `"scheme": "aigmapte"` and `"plugins": ["expo-router"]`.
4. Move providers from `App.tsx` into `app/_layout.tsx`; move each screen to a route file that renders the existing screen component.
5. Replace `src/features/auth/AuthFlow.tsx` with the `(auth)` group. Screens keep their UI; swap the `nav` prop for `useRouter()`.
6. Delete `App.tsx` only after every screen is reachable through `app/`.

## Root layout with a session gate

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { useSession } from '@/features/auth';
import { Splash } from '@/features/auth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootStack />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { status, hasProfile } = useSession(); // 'loading' | 'signedOut' | 'signedIn'
  if (status === 'loading') return <Splash />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn' && !hasProfile}>
        <Stack.Screen name="exam-setup" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn' && hasProfile}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
```

`Stack.Protected` redirects automatically when a guard flips (e.g. sign-out or 401), so screens never call `router.replace('/sign-in')` themselves.

## Thin route files

```tsx
// app/(app)/practice/[taskId].tsx
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { PracticeTaskScreen } from '@/features/practice';
import { ErrorState } from '@/components/ErrorState';

const Params = z.object({ taskId: z.string().regex(/^\d+$/) });

export default function PracticeTaskRoute() {
  const parsed = Params.safeParse(useLocalSearchParams());
  if (!parsed.success) return <ErrorState title="Question not found" />;
  return <PracticeTaskScreen taskId={Number(parsed.data.taskId)} />;
}
```

## Tabs

```tsx
// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { brand } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: brand.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice', tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> }} />
      {/* mock, progress, profile */}
    </Tabs>
  );
}
```

## Rules

- Navigate with typed hrefs: `router.push({ pathname: '/practice/[taskId]', params: { taskId: String(id) } })`.
- Params are strings — validate with Zod before use.
- Modals (`presentation: 'modal'`) for short tasks (filters, confirmations); full screens for flows.
- Android back is handled by the router; do not add `BackHandler` listeners in routed screens.
- Path alias `@/` requires `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` — add it in the migration, not before.
