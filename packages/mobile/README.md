# Ecosystem Mobile App

React Native mobile app built with Expo Router and NativeWind.

## Setup

```bash
cd packages/mobile
npm install

# Install shared package
npm install ../shared
```

## Development

```bash
# Start development server
npm run start

# Run on iOS (requires Mac)
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
packages/mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with providers
│   ├── auth.tsx           # Authentication screen
│   ├── onboarding.tsx     # Onboarding flow
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tab layout
│       ├── index.tsx      # Learning Path home
│       ├── achievements.tsx
│       ├── wallet.tsx
│       └── profile.tsx
├── src/
│   ├── components/ui/     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Text.tsx
│   └── lib/
│       └── utils.ts       # Utility functions
├── global.css             # Tailwind CSS styles
├── tailwind.config.js     # Tailwind configuration
└── metro.config.js        # Metro bundler config
```

## Shared Package Integration

The mobile app uses `@ecosystem/shared` for:
- Authentication (`useAuth`)
- User context (`useUser`)
- Ecosystem data (`useEcosystem`)
- Location context (`useLocation`)
- All business logic services
- Type definitions

## UI Components

All UI components are built with:
- **NativeWind** - Tailwind CSS for React Native
- **Class Variance Authority** - Variant management
- Exact styling copied from web app's shadcn/ui components

## Navigation

- **Expo Router** - File-based routing
- **Tab Navigation** - Bottom tabs for main screens
- **Stack Navigation** - For auth and onboarding flows

## Features Implemented

- ✅ Authentication (Sign In / Sign Up)
- ✅ Onboarding flow
- ✅ Tab navigation
- ✅ Profile screen
- ✅ Wallet screen
- ✅ Shared context providers
- ✅ UI component library
- 🚧 Learning Path (coming soon)
- 🚧 Survey system (coming soon)
- 🚧 Achievements (coming soon)

## Next Steps

1. Build Learning Path screens
2. Implement survey system
3. Add achievements
4. Add social features
5. Implement push notifications
