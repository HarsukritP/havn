import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
    },
  },
});

function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize auth ONCE on mount
  useEffect(() => {
    initialize()
      .then(() => setIsMounted(true))
      .catch((err) => {
        console.error('Auth init error:', err);
        setIsMounted(true);
      });
  }, []);

  // Handle navigation AFTER component is mounted
  useEffect(() => {
    if (!isMounted || isLoading) return; // Wait for mount and auth

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);
  }, [isAuthenticated, segments, isLoading, isMounted]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="spot/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="spots-list" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
      <Stack.Screen name="spot-saves" options={{ presentation: 'card' }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;
