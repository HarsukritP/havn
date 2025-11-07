import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

// ⚠️ TEMPORARY MOCK AUTHENTICATION ⚠️
// This is a temporary mock to bypass Auth0 issues
// This allows any email/password combination and doesn't connect to a database

export interface Auth0User {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  updated_at?: string;
}

export interface Auth0Tokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export function useAuth0() {
  const { setSession, setProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate a brief loading delay to make it feel more realistic
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock user session
      const mockUserId = `mock-user-${Date.now()}`;
      const mockEmail = 'demo@uwaterloo.ca';
      const mockName = 'Demo User';
      
      const session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 86400, // 24 hours
        expires_at: Date.now() + 86400 * 1000,
        user: {
          id: mockUserId,
          email: mockEmail,
          user_metadata: {
            full_name: mockName,
            avatar_url: undefined,
          },
        },
      };

      setSession(session as any);
      setProfile({
        id: mockUserId,
        email: mockEmail,
        full_name: mockName,
        username: 'demouser',
        avatar_url: undefined,
      });

      console.log('✅ Mock login successful - You can now explore the UI!');
    } catch (err) {
      console.error('Mock login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local state
      setSession(null);
      setProfile(null);
      setError(null);
      
      console.log('✅ Mock logout successful');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    isReady: true, // Always ready in mock mode
  };
}


