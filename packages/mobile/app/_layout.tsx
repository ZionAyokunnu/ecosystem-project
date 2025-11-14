import "../global.css";
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  AuthProvider, 
  UserProvider, 
  EcosystemProvider, 
  LocationProvider 
} from '@ecosystem/shared';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <EcosystemProvider>
            <LocationProvider>
              <RootLayoutNav />
            </LocationProvider>
          </EcosystemProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
