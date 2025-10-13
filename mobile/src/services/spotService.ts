import api from './api';
import { Spot, UpdateSpotRequest, ApiResponse } from '../types';

export interface GetSpotsParams {
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface UpdateSpotResponse {
  update: {
    id: string;
    spot_id: string;
    seats_available: number;
    confidence_score: number;
    distance_from_spot: number;
    created_at: string;
  };
  rewards: {
    points_earned: number;
    accuracy_bonus: number;
    total_points_earned: number;
    user_total_points: number;
    streak_updated: boolean;
    current_streak: number;
  };
  spot_updated: {
    current_available: number;
    availability_status: string;
    confidence_score: number;
  };
}

export const spotService = {
  // Get all spots
  getSpots: async (params?: GetSpotsParams): Promise<Spot[]> => {
    const response = await api.get<ApiResponse<{ spots: Spot[]; count: number }>>('/spots', { params });
    return response.data.spots;
  },

  // Get nearby spots
  getNearbySpots: async (lat: number, lng: number, radius?: number): Promise<Spot[]> => {
    const params = { lat, lng, radius: radius || 1000, limit: 50 };
    const response = await api.get<ApiResponse<{ spots: Spot[]; count: number }>>('/spots/nearby', { params });
    return response.data.spots;
  },

  // Get spot by ID
  getSpotById: async (spotId: string): Promise<Spot> => {
    const response = await api.get<ApiResponse<{ spot: Spot }>>(`/spots/${spotId}`);
    return response.data.spot;
  },

  // Update spot availability
  updateSpotAvailability: async (spotId: string, data: UpdateSpotRequest): Promise<UpdateSpotResponse> => {
    const response = await api.post<ApiResponse<UpdateSpotResponse>>(`/spots/${spotId}/update`, data);
    return response.data;
  },
};

