import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setSession: (session: Session | null) => void;
  setProfile: (profile: any) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
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
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      get().setSession(session);
      
      // Set up auth state listener AFTER initial session is fetched
      supabase.auth.onAuthStateChange((_event, session) => {
        get().setSession(session);
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

