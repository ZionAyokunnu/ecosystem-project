import "../global.css";
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  AuthProvider, 
  UserProvider, 
  EcosystemProvider, 
  LocationProvider 
} from '@ecosystem/shared';
import { OfflineProvider } from '@/src/components/native/OfflineStorage';
import { SyncManagerProvider } from '@/src/components/native/SyncManager';
import { NotificationProvider } from '@/src/components/ui/Notification';
import { OfflineBanner } from '@/src/components/native/OfflineBanner';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <OfflineProvider>
          <SyncManagerProvider>
            <NotificationProvider>
              <AuthProvider>
                <UserProvider>
                  <EcosystemProvider>
                    <LocationProvider>
                      <OfflineBanner />
                      <RootLayoutNav />
                    </LocationProvider>
                  </EcosystemProvider>
                </UserProvider>
              </AuthProvider>
            </NotificationProvider>
          </SyncManagerProvider>
        </OfflineProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
