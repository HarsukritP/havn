import React, { useEffect } from 'react';
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

  // Initialize auth ONCE on mount
  useEffect(() => {
    initialize().catch(console.error);
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but on login screen, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >
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
