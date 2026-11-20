# App lifecycle and offline

## Refetch on foreground

```ts
// src/lib/query-lifecycle.ts — call once from the root layout
import { AppState, Platform } from 'react-native';
import { focusManager } from '@tanstack/react-query';

export function bindQueryFocus() {
  const sub = AppState.addEventListener('change', status => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  });
  return () => sub.remove();
}
```

## Online state (when offline UX is required)

Requires `@react-native-community/netinfo` (`npx expo install @react-native-community/netinfo`) — add only for a feature that needs it.

```ts
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

onlineManager.setEventListener(setOnline =>
  NetInfo.addEventListener(state => setOnline(!!state.isConnected)),
);
```

Queries pause while offline and resume on reconnect. Show an offline banner from `useIsRestoring`/`onlineManager.isOnline()` rather than error screens.

## What must survive interruptions

| Situation | Handling |
|---|---|
| Timed mock test, app backgrounded | Store `startedAt` + answers in a persisted Zustand slice; compute remaining time from the clock on resume — never trust a JS interval while backgrounded |
| Recording in progress, call comes in | Stop and keep the partial file, or discard with a clear message; release the recorder |
| Answer submission offline | Queue in SQLite (if required) or block with "You're offline — your answer is saved, we'll submit when you're back" |
| App killed during sign-in | Nothing persisted except the token after success |

## SQLite (only when needed)

Use `expo-sqlite` for data that is large, relational or must work offline (downloaded question packs, submission queue). Do not use it as a cache for normal API data — TanStack Query does that.

```ts
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('aigma.db');
await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS pending_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);
await db.runAsync('INSERT INTO pending_submissions (question_id, payload, created_at) VALUES (?, ?, ?)', questionId, JSON.stringify(body), Date.now());
const rows = await db.getAllAsync<{ id: number; payload: string }>('SELECT id, payload FROM pending_submissions ORDER BY id');
```

- Version the schema (`PRAGMA user_version`) and migrate forward on open.
- Never store tokens or passwords in SQLite.
- Clear user data tables on sign-out.
