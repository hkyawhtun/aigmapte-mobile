# UI components and performance

## Design source

- Tokens: `src/theme.ts` → `brand` (colours), `radius`. The legacy `colors` palette is for existing `App.tsx` screens only.
- Approved visual reference: `design/prototype/` (open `index.html`) and `deliverables/*.pdf`.
- Existing form primitives: `src/features/auth/ui.tsx` (`Button`, `Field`, `Checkbox`, `Sheet`, `Dialog`, `ErrorBanner`…). When a second feature needs one, move it to `src/components/` and update imports — don't duplicate.

## Shared component checklist

A component in `src/components/` must:

- Take typed props; no feature imports, no data fetching.
- Support disabled/loading states where relevant.
- Have `accessibilityRole`, `accessibilityLabel` (for icon-only), and `accessibilityState`.
- Have touch targets ≥ 44×44 pt (use `hitSlop` for small icons).
- Respect safe areas (`SafeAreaView` / `useSafeAreaInsets`) at screen level, not inside small components.

Standard set to build as needed: `Screen`, `Button`, `Field`, `Card`, `ListItem`, `EmptyState`, `ErrorState`, `Skeleton`, `Sheet`, `Dialog`, `ScoreRing`.

```tsx
// src/components/ErrorState.tsx
type ErrorStateProps = { title?: string; message?: string; onRetry?: () => void };
export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={40} color={brand.muted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.body}>{message}</Text> : null}
      {onRetry ? <Button label="Try again" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}
```

## Styling

- `StyleSheet.create` at the bottom of the file; no inline style objects inside list items.
- Spacing on a 4-pt scale; colours only from tokens.
- Text: never below 12 pt; body 15–16 pt. Allow font scaling — test with large system text.
- Keyboard: `KeyboardAvoidingView` (`padding` on iOS) + `keyboardShouldPersistTaps="handled"`; set `returnKeyType` and focus the next field.

## Performance

- Long lists: `FlatList` with `keyExtractor`, `getItemLayout` when rows are fixed height; consider `@shopify/flash-list` for large question banks (add only when a list is measurably slow).
- `React.memo` list rows; stable callbacks (`useCallback`) only where a memoised child receives them.
- Select narrow Zustand slices; use Query `select` to derive subsets instead of computing in render.
- Images: `expo-image` with caching for course thumbnails; size images to their display size.
- Animations: `useNativeDriver: true` (Animated) or Reanimated worklets; never animate layout on the JS thread in lists.
- Avoid work at startup: lazy-load heavy screens via routes; keep `_layout.tsx` light.
- Audio/video: release players and recorders on unmount.
- Measure before optimising (React DevTools Profiler, Expo performance monitor).
