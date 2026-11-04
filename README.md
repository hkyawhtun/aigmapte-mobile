# AIGMA PTE Mobile

Mobile-first PTE preparation experience for iOS and Android, built with Expo and React Native.

## Included experience

- Onboarding and sign-in flows
- Goal-led dashboard and personalised daily plan
- Complete Academic practice catalogue for Speaking, Writing, Reading and Listening
- Interactive response flow ready for microphone/API integration
- Full and section mock-test library
- Progress, skill analytics and study insights
- Profile, settings and subscription plan selection
- Demo data isolated from the future backend integration boundary

## Run locally

```bash
npm install
npm start
```

Then scan the Expo QR code, press `a` for Android, or run the iOS simulator from macOS.

## Verification

```bash
npm run typecheck
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

The application currently uses local product data. Connect backend authentication, questions, media, scoring, entitlements, and payments through `src/api/client.ts`.
