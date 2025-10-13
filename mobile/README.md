# SpotSave Mobile App

React Native mobile application for SpotSave - Real-time study spot availability platform.

## Tech Stack

- **React Native 0.73+** - Cross-platform mobile framework
- **TypeScript 5+** - Type-safe development
- **Expo** - Development and build tooling
- **Gluestack UI v2** - Production-grade component library
- **React Navigation 6** - Navigation (bottom tabs + stack)
- **React Query v5** - Server state management
- **Zustand** - Client state management
- **react-native-maps** - Interactive maps
- **Reanimated v3** - 60fps animations
- **Expo Haptics** - Tactile feedback

## Project Structure

```
mobile/
├── src/
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── map/           # Map view
│   │   ├── list/          # List view
│   │   └── profile/       # Profile & stats
│   ├── components/        # Reusable components
│   ├── services/          # API layer
│   │   └── api.ts         # Axios instance
│   ├── hooks/             # Custom hooks
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── constants/         # Constants & config
│   └── navigation/        # Navigation setup
├── android/               # Android native code
├── ios/                   # iOS native code
├── App.tsx                # App entry point
├── package.json
└── tsconfig.json
```

## Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Start Development Server

```bash
npm start
```

This opens the Expo Dev Tools in your browser.

### 3. Run on iOS

```bash
# Open iOS Simulator
npm run ios
```

### 4. Run on Android

```bash
# Open Android Emulator first, then:
npm run android
```

## Development

### Run on Physical Device

1. Install Expo Go app on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Scan the QR code from `npm start`

### Environment Configuration

API base URL is configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api'  // Development
  : 'https://api.spotsave.app/api';  // Production
```

**For Physical Device Testing:**
Replace `localhost` with your computer's IP address:
```typescript
const API_BASE_URL = 'http://192.168.1.XXX:8080/api';
```

### TypeScript

This project uses TypeScript in strict mode. All types are defined in `src/types/`.

```typescript
// Example: Using typed API calls
import { Spot, ApiResponse } from '../types';

const spots: Spot[] = await getSpots();
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Features

### Current (Foundation)

- ✅ Project structure setup
- ✅ TypeScript configuration (strict mode)
- ✅ Gluestack UI integration
- ✅ React Navigation (bottom tabs)
- ✅ API service with Axios
- ✅ Type definitions
- ✅ Placeholder screens

### To Implement

- [ ] Authentication (login/register)
- [ ] Map view with markers
- [ ] Spot detail screen
- [ ] Check-in modal
- [ ] Profile & stats
- [ ] Leaderboard
- [ ] Real-time WebSocket updates
- [ ] Animated components
- [ ] Haptic feedback
- [ ] Offline support

## Scripts

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Building for Production

### iOS (Requires Mac + Apple Developer Account)

```bash
# Build iOS app
expo build:ios
```

### Android

```bash
# Build Android APK
expo build:android -t apk

# Build Android App Bundle (for Play Store)
expo build:android -t app-bundle
```

## Component Guidelines

Follow the standards defined in `/docs/design.md`:

1. **Always use TypeScript** - No `any` types
2. **Use Gluestack UI components** - Don't build from scratch
3. **Add animations** - Use Reanimated for smooth 60fps
4. **Add haptic feedback** - Use expo-haptics for interactions
5. **Show loading states** - Use skeletons, not spinners
6. **Handle errors** - Always show error states with retry
7. **Accessibility** - Add labels and minimum touch targets (44x44pt)

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
expo start -c
```

### iOS Build Issues

```bash
# Clean iOS build
cd ios && pod deintegrate && pod install && cd ..
```

### Android Build Issues

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

### Type Errors

```bash
# Check TypeScript errors
npx tsc --noEmit
```

## Documentation

- **API Specification:** `/docs/api-spec.md`
- **Design System:** `/docs/design.md`
- **UI Components:** `/docs/ui-enhancement-summary.md`

## License

MIT License - See LICENSE for details

---

**Built with ❤️ for students, by students.**

