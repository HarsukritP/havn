import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth0Config } from '../config/auth0';
import { useAuthStore } from '../stores/authStore';

// This is required for web browser authentication
WebBrowser.maybeCompleteAuthSession();

// Auth0 discovery endpoint
const discovery = AuthSession.useAutoDiscovery(`https://${auth0Config.domain}`);

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

  // Create auth request
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0Config.clientId,
      scopes: auth0Config.scope.split(' '),
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'havnapp',
        path: 'auth',
      }),
      extraParams: {
        audience: auth0Config.audience,
      },
    },
    discovery
  );

  // Handle auth result
  useEffect(() => {
    if (result?.type === 'success') {
      const { code } = result.params;
      exchangeCodeForTokens(code);
    } else if (result?.type === 'error') {
      setError(result.error?.message || 'Authentication failed');
      setIsLoading(false);
    }
  }, [result]);

  const exchangeCodeForTokens = async (code: string) => {
    try {
      setIsLoading(true);
      
      // Exchange authorization code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: auth0Config.clientId,
          code,
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'havnapp',
            path: 'auth',
          }),
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
        },
        discovery!
      );

      // Get user info
      const userInfoResponse = await fetch(
        `https://${auth0Config.domain}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo: Auth0User = await userInfoResponse.json();

      // Store tokens and user info
      const session = {
        access_token: tokenResult.accessToken,
        refresh_token: tokenResult.refreshToken,
        expires_in: tokenResult.expiresIn || 3600,
        expires_at: Date.now() + (tokenResult.expiresIn || 3600) * 1000,
        user: {
          id: userInfo.sub,
          email: userInfo.email || '',
          user_metadata: {
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
          },
        },
      };

      setSession(session as any);
      setProfile({
        id: userInfo.sub,
        email: userInfo.email,
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
      });

      setError(null);
    } catch (err) {
      console.error('Token exchange error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await promptAsync();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear session from Auth0
      const logoutUrl = `https://${auth0Config.domain}/v2/logout?${new URLSearchParams({
        client_id: auth0Config.clientId,
        returnTo: AuthSession.makeRedirectUri({
          scheme: 'havnapp',
          path: 'auth',
        }),
      })}`;

      await WebBrowser.openAuthSessionAsync(logoutUrl, AuthSession.makeRedirectUri({
        scheme: 'havnapp',
        path: 'auth',
      }));

      // Clear local state
      setSession(null);
      setProfile(null);
      setError(null);
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
    isReady: !!discovery && !!request,
  };
}


