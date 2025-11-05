import { useAuthStore } from '../stores/authStore';
import { config } from '../config/env';

const API_URL = config.apiUrl;

async function getAuthToken(): Promise<string | null> {
  const session = useAuthStore.getState().session;
  return session?.access_token || null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: `HTTP ${response.status}: ${response.statusText}` 
    }));
    throw new Error(error.error?.message || error.message || 'API request failed');
  }

  return response.json();
}

// Spots API
export const spotsApi = {
  getSpots: async (params: {
    lat: number;
    lon: number;
    radius?: number;
    type?: string;
    availableOnly?: boolean;
  }) => {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lon: params.lon.toString(),
      radius: (params.radius || 2000).toString(),
      type: params.type || 'all',
      available_only: (params.availableOnly || false).toString(),
    });
    return apiRequest<{ success: boolean; data: { spots: any[]; count: number } }>(
      `/spots?${queryParams}`
    );
  },

  getSpotById: async (id: string) => {
    return apiRequest<{ success: boolean; data: { spot: any } }>(`/spots/${id}`);
  },
};

// Occupancy API
export const occupancyApi = {
  checkIn: async (data: {
    spot_id: string;
    latitude: number;
    longitude: number;
    location_accuracy?: number;
  }) => {
    return apiRequest<{ success: boolean; data: any }>('/occupancy/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkOut: async () => {
    return apiRequest<{ success: boolean; data: any }>('/occupancy/checkout', {
      method: 'POST',
    });
  },
};

// Users API
export const usersApi = {
  search: async (query: string) => {
    return apiRequest<{ success: boolean; data: { users: any[] } }>(
      `/users/search?q=${encodeURIComponent(query)}`
    );
  },

  getProfile: async () => {
    return apiRequest<{ success: boolean; data: { profile: any } }>('/users/me');
  },

  updateProfile: async (updates: Record<string, any>) => {
    return apiRequest<{ success: boolean; data: { message: string } }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Friends API
export const friendsApi = {
  getFriends: async () => {
    return apiRequest<{ success: boolean; data: any }>('/friends');
  },

  sendRequest: async (friendId: string) => {
    return apiRequest<{ success: boolean; data: any }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    });
  },

  respondToRequest: async (friendshipId: string, response: 'accepted' | 'declined') => {
    return apiRequest<{ success: boolean; data: any }>('/friends/respond', {
      method: 'POST',
      body: JSON.stringify({ friendship_id: friendshipId, response }),
    });
  },
};

// Spot Saves API
export const spotSavesApi = {
  getRequests: async () => {
    return apiRequest<{ success: boolean; data: any }>('/spot-saves');
  },

  createRequest: async (data: {
    spot_id: string;
    saver_id: string;
    message?: string;
  }) => {
    return apiRequest<{ success: boolean; data: any }>('/spot-saves/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  respondToRequest: async (requestId: string, response: 'accepted' | 'declined') => {
    return apiRequest<{ success: boolean; data: any }>('/spot-saves/respond', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, response }),
    });
  },
};

