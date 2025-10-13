import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const authService = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

