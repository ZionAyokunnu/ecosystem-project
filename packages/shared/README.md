# @ecosystem/shared

Shared business logic, types, and integrations for the Ecosystem web and mobile apps.

## Structure

```
packages/shared/
├── context/         # React contexts (Auth, User, Location, Ecosystem)
├── hooks/           # Business logic hooks
├── integrations/    # External service clients (Supabase)
├── services/        # API and business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Usage

### Web App
```typescript
import { useAuth, learningPathService, UserProfile } from '@ecosystem/shared';
```

### Mobile App  
```typescript
import { useAuth, learningPathService, UserProfile } from '@ecosystem/shared';
```

## Dependencies

This package requires:
- React 18+
- @supabase/supabase-js
- @tanstack/react-query
- zod

## Platform-Specific Considerations

### Storage
- Web uses `localStorage`
- Mobile needs to use `AsyncStorage` or `expo-secure-store`
- Abstraction layer needed in consuming apps

### UI Dependencies
Some hooks (like `useAuth`) import UI components:
- `toast` / `useToast` - needs platform-specific implementation
- These should be passed as props or use dependency injection

### Asset Loading
`localLLM.ts` imports markdown assets - may need platform-specific loading strategy.

## Notes

- All imports use relative paths (no `@/` aliases)
- Exports are centralized through index files
- No UI components included (pure business logic)
