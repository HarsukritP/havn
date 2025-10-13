// Core API types for Havn

export interface User {
  id: string;
  email: string;
  full_name: string;
  total_points: number;
  current_streak: number;
  reputation_score: number;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Spot {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  current_available: number | null;
  availability_status: 'available' | 'low' | 'full' | 'unknown';
  confidence_score: number;
  last_update_at: string | null;
  distance_meters?: number;
  amenities: {
    wifi: boolean;
    outlets: boolean;
    printer: boolean;
    quiet_zone: boolean;
    outdoor: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateSpotRequest {
  seats_available: number;
  noise_level?: 'quiet' | 'moderate' | 'loud';
  photo_url?: string;
  user_latitude: number;
  user_longitude: number;
}

// Navigation
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  List: undefined;
  Profile: undefined;
};

export type MapStackParamList = {
  MapView: undefined;
  SpotDetail: { spotId: string };
};

// WebSocket
export interface WebSocketMessage {
  type: 'SPOT_UPDATE' | 'NEW_USER' | 'ACHIEVEMENT';
  data: any;
}

