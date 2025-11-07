import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Auth layout - redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="signup" options={{ animation: 'fade' }} />
    </Stack>
  );
}
