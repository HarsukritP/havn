import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth session interface compatible with both Supabase and Auth0
interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user: {
    id: string;
    email: string;
    user_metadata?: any;
  };
}

interface AuthState {
  session: AuthSession | null;
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setSession: (session: AuthSession | null) => void;
  setProfile: (profile: any) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

const AUTH_SESSION_KEY = '@havn_auth_session';
const AUTH_PROFILE_KEY = '@havn_auth_profile';

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false, // Start as FALSE - app is immediately ready
  isAuthenticated: false,

  setSession: (session) => {
    try {
      if (session) {
        AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)).catch(console.error);
      } else {
        AsyncStorage.removeItem(AUTH_SESSION_KEY).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
    
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
    });
  },

  setProfile: (profile) => {
    try {
      if (profile) {
        AsyncStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile)).catch(console.error);
      } else {
        AsyncStorage.removeItem(AUTH_PROFILE_KEY).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    
    set({ profile });
  },

  signOut: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_SESSION_KEY, AUTH_PROFILE_KEY]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    console.log('🔄 Initializing auth store (non-blocking)...');
    
    // Run initialization in background without blocking app
    try {
      const sessionJson = await AsyncStorage.getItem(AUTH_SESSION_KEY).catch(() => null);
      
      if (sessionJson && typeof sessionJson === 'string') {
        try {
          const session = JSON.parse(sessionJson);
          const profileJson = await AsyncStorage.getItem(AUTH_PROFILE_KEY).catch(() => null);
          
          // Check if session is expired
          if (session.expires_at && session.expires_at < Date.now()) {
            console.log('⚠️ Session expired, clearing...');
            get().signOut().catch(console.error);
          } else {
            console.log('✅ Session restored');
            set({
              session,
              user: session.user,
              isAuthenticated: true,
              profile: profileJson && typeof profileJson === 'string' ? JSON.parse(profileJson) : null,
            });
          }
        } catch (parseError) {
          console.error('Failed to parse session:', parseError);
        }
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
    
    console.log('✅ Auth initialization complete');
  },
}));

