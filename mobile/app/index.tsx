import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  console.log('📍 Index - isAuthenticated:', isAuthenticated);

  // Immediately redirect based on auth state - no loading
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}






