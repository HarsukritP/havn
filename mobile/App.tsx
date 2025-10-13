import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { loadAuth } = useAuthStore();

  // Load auth state on app start
  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider config={config}>
          <StatusBar style="auto" />
          <AppNavigator />
        </GluestackUIProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

