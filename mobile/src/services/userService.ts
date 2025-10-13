import api from './api';
import { User, ApiResponse } from '../types';

export interface UserStats {
  total_check_ins: number;
  check_ins_this_week: number;
  check_ins_today: number;
  accuracy_rate: number;
  rank_percentile: number;
  achievements_unlocked: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  points: number;
  check_ins: number;
  reputation_score: number;
  is_current_user?: boolean;
}

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<{ user: User; stats: UserStats }> => {
    const response = await api.get<ApiResponse<{ user: User; stats: UserStats }>>('/users/me');
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (data: { full_name?: string; email?: string }): Promise<User> => {
    const response = await api.patch<ApiResponse<{ user: User }>>('/users/me', data);
    return response.data.user;
  },

  // Get leaderboard
  getLeaderboard: async (period: 'weekly' | 'all_time' = 'weekly', limit: number = 10): Promise<LeaderboardEntry[]> => {
    const params = { period, limit };
    const response = await api.get<ApiResponse<{ leaderboard: LeaderboardEntry[] }>>('/users/leaderboard', { params });
    return response.data.leaderboard;
  },

  // Get user public stats
  getUserStats: async (userId: string): Promise<{ user: User; stats: UserStats }> => {
    const response = await api.get<ApiResponse<{ user: User; stats: UserStats }>>(`/users/${userId}/stats`);
    return response.data;
  },
};

