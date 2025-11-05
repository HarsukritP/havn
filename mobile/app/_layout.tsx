import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
      initialRouteName="(auth)"
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

