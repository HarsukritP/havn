import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AUTH_TOKEN_KEY = '@spotsave_auth_token';
const AUTH_USER_KEY = '@spotsave_auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save auth:', error);
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  },

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  updateUser: (updatedData: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updatedData };
    
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser)).catch(console.error);
    
    set({ user: updatedUser });
  },
}));

