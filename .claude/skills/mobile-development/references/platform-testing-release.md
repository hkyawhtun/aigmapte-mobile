# Platform differences, testing and release

## Android vs iOS checklist

| Area | iOS | Android |
|---|---|---|
| Keyboard | `KeyboardAvoidingView behavior="padding"` | usually none (`softwareKeyboardLayoutMode` handles it) |
| Back navigation | swipe-back gesture | hardware back — router handles it; confirm before leaving a mock test |
| Shadows | `shadow*` props | `elevation` |
| Status bar | `expo-status-bar` style per screen | same; check translucent edge-to-edge layouts |
| Permissions (microphone) | `NSMicrophoneUsageDescription` via config plugin | `RECORD_AUDIO` permission |
| Social login | Sign in with Apple required if others are offered | Google, Facebook |
| Purchases | Store rules on digital subscriptions — see `deliverables/AIGMA_PTE_Mobile_Tech_Stack.md` §4.1 | same |
| OTP autofill | `textContentType="oneTimeCode"` | `autoComplete="sms-otp"` / `one-time-code` |
| Fonts | check Burmese rendering with Noto Sans Myanmar if localised | same |

Use `Platform.select` for small differences; use `File.ios.tsx` / `File.android.tsx` only when a whole component differs.

## Testing

Not configured yet. When the first logic worth testing lands, add:

```bash
npx expo install jest-expo jest @testing-library/react-native -- --save-dev
```

`package.json`: `"test": "jest"`, `"jest": { "preset": "jest-expo" }`.

What to test:

- Pure logic: schemas, mappers (DTO → domain), score calculations, timers — unit tests.
- Hooks with a fresh `QueryClient` per test and a mocked `http` (or MSW).
- Screens: render the four states with React Native Testing Library; query by role/label, not test IDs.
- Critical flows (sign-in, mock test submit): Maestro end-to-end on a device build.

Always run what exists: `npm run typecheck` and `npm test`. Report actual results.

## Production builds (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure                    # creates eas.json
eas build -p android --profile preview # installable APK/AAB for testers
eas build -p ios --profile preview     # needs an Apple Developer account
eas build --profile production --platform all
eas submit -p android                  # / -p ios
eas update --branch production         # JS-only fixes (OTA)
```

Suggested `eas.json` profiles: `development` (dev client, internal), `preview` (internal distribution, staging API), `production` (store, production API). Put `EXPO_PUBLIC_API_URL` per profile under `env` — public values only; secrets go in EAS secrets and are never bundled.

Before a release:

- Version: bump `version` in `app.json`; let EAS manage build numbers (`"appVersionSource": "remote"`, `autoIncrement`).
- App icon, splash and adaptive icon from `assets/`.
- Permissions strings present and accurate; remove unused permissions.
- `typecheck` clean, no `console.log` of user data, Sentry (or equivalent) configured.
- Test on a low-end Android device and the smallest supported iPhone.
- Privacy labels / Data safety form match what the app collects.
