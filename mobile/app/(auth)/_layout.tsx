import React from 'react';
import { Stack } from 'expo-router';

function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;

