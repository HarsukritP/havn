import { useAuthStore } from '../stores/authStore';
import { config } from '../config/env';

const API_URL = config.apiUrl;

async function getAuthToken(): Promise<string | null> {
  const session = useAuthStore.getState().session;
  return session?.access_token || null;
}

// Check if we're in mock mode
function isMockMode(): boolean {
  const token = useAuthStore.getState().session?.access_token;
  return token === 'mock-access-token';
}

// Mock data for demo mode
const MOCK_SPOTS = [
  {
    id: '1',
    name: 'Dana Porter Library - 5th Floor',
    type: 'library',
    latitude: 43.4695,
    longitude: -80.5422,
    address: 'Dana Porter Library, University Ave W',
    building_name: 'Dana Porter Library',
    occupancy_status: 'low',
    current_occupancy: 15,
    capacity: 100,
    occupancy_percentage: 15,
    description: 'Quiet study space with great views',
    amenities: {
      wifi: true,
      outlets: true,
      quiet: true,
      food_nearby: true,
      whiteboard: false,
      natural_light: true,
    },
    hours: {
      Monday: '8:00 AM - 11:00 PM',
      Tuesday: '8:00 AM - 11:00 PM',
      Wednesday: '8:00 AM - 11:00 PM',
      Thursday: '8:00 AM - 11:00 PM',
      Friday: '8:00 AM - 9:00 PM',
      Saturday: '10:00 AM - 6:00 PM',
      Sunday: '10:00 AM - 11:00 PM',
    },
    friends_here: [],
  },
  {
    id: '2',
    name: 'SLC Great Hall',
    type: 'lounge',
    latitude: 43.4717,
    longitude: -80.5461,
    address: 'Student Life Centre, Ring Rd',
    building_name: 'Student Life Centre',
    occupancy_status: 'moderate',
    current_occupancy: 45,
    capacity: 80,
    occupancy_percentage: 56,
    description: 'Social study space in the heart of campus',
    amenities: {
      wifi: true,
      outlets: true,
      quiet: false,
      food_nearby: true,
      whiteboard: false,
      natural_light: true,
    },
    hours: {
      Monday: '7:00 AM - 11:00 PM',
      Tuesday: '7:00 AM - 11:00 PM',
      Wednesday: '7:00 AM - 11:00 PM',
      Thursday: '7:00 AM - 11:00 PM',
      Friday: '7:00 AM - 10:00 PM',
      Saturday: '9:00 AM - 10:00 PM',
      Sunday: '9:00 AM - 11:00 PM',
    },
    friends_here: [
      { id: 'friend-2', username: 'mikejohnson', full_name: 'Mike Johnson' },
    ],
  },
  {
    id: '3',
    name: 'Engineering 5 - 2nd Floor',
    type: 'library',
    latitude: 43.4728,
    longitude: -80.5400,
    address: 'Engineering 5 Building',
    building_name: 'Engineering 5',
    occupancy_status: 'high',
    current_occupancy: 75,
    capacity: 90,
    occupancy_percentage: 83,
    description: 'Popular engineering study space',
    amenities: {
      wifi: true,
      outlets: true,
      quiet: true,
      food_nearby: false,
      whiteboard: true,
      natural_light: false,
    },
    hours: {
      Monday: '24 hours',
      Tuesday: '24 hours',
      Wednesday: '24 hours',
      Thursday: '24 hours',
      Friday: '24 hours',
      Saturday: '24 hours',
      Sunday: '24 hours',
    },
    friends_here: [],
  },
  {
    id: '4',
    name: 'Celsius Coffee Bar',
    type: 'cafe',
    latitude: 43.4710,
    longitude: -80.5425,
    address: 'Math & Computer Building',
    building_name: 'Math & Computer',
    occupancy_status: 'moderate',
    current_occupancy: 20,
    capacity: 35,
    occupancy_percentage: 57,
    description: 'Cozy cafe with coffee and snacks',
    amenities: {
      wifi: true,
      outlets: true,
      quiet: false,
      food_nearby: true,
      whiteboard: false,
      natural_light: true,
    },
    hours: {
      Monday: '7:30 AM - 5:00 PM',
      Tuesday: '7:30 AM - 5:00 PM',
      Wednesday: '7:30 AM - 5:00 PM',
      Thursday: '7:30 AM - 5:00 PM',
      Friday: '7:30 AM - 4:00 PM',
      Saturday: 'Closed',
      Sunday: 'Closed',
    },
    friends_here: [],
  },
];

const MOCK_FRIENDS = [
  {
    id: 'friend-1',
    username: 'sarahchen',
    full_name: 'Sarah Chen',
    current_spot_name: 'Dana Porter Library - 5th Floor',
    current_latitude: 43.4695,
    current_longitude: -80.5422,
  },
  {
    id: 'friend-2',
    username: 'mikejohnson',
    full_name: 'Mike Johnson',
    current_spot_name: 'SLC Great Hall',
    current_latitude: 43.4717,
    current_longitude: -80.5461,
  },
];

const MOCK_PROFILE = {
  id: 'mock-user',
  username: 'demouser',
  email: 'demo@uwaterloo.ca',
  full_name: 'Demo User',
  major: 'Computer Science',
  grad_year: 2025,
  total_study_minutes: 1440, // 24 hours
  total_check_ins: 47,
  friend_count: 2,
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  // If in mock mode, return mock data
  if (isMockMode()) {
    return handleMockRequest<T>(endpoint, options);
  }
  
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

// Handle mock API requests
async function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('🎭 Mock API:', options.method || 'GET', endpoint);
  
  // Spots endpoints
  if (endpoint.startsWith('/spots?')) {
    return { success: true, data: { spots: MOCK_SPOTS, count: MOCK_SPOTS.length } } as T;
  }
  
  if (endpoint.match(/^\/spots\/\d+$/)) {
    const spotId = endpoint.split('/')[2];
    const spot = MOCK_SPOTS.find(s => s.id === spotId) || MOCK_SPOTS[0];
    return { success: true, data: { spot } } as T;
  }
  
  // Friends endpoints
  if (endpoint === '/friends') {
    return { 
      success: true, 
      data: { 
        friends: MOCK_FRIENDS, 
        received_requests: [], 
        sent_requests: [] 
      } 
    } as T;
  }
  
  // User endpoints
  if (endpoint === '/users/me') {
    return { success: true, data: { profile: MOCK_PROFILE } } as T;
  }
  
  if (endpoint.startsWith('/users/search')) {
    return { 
      success: true, 
      data: { 
        users: [
          { id: 'user-1', username: 'alexwang', full_name: 'Alex Wang', email: 'alex@uwaterloo.ca' },
          { id: 'user-2', username: 'emilyzhang', full_name: 'Emily Zhang', email: 'emily@uwaterloo.ca' },
        ] 
      } 
    } as T;
  }
  
  // Check-in/Check-out
  if (endpoint === '/occupancy/checkin') {
    return { success: true, data: { message: 'Checked in successfully' } } as T;
  }
  
  if (endpoint === '/occupancy/checkout') {
    return { success: true, data: { message: 'Checked out successfully' } } as T;
  }
  
  // Spot saves
  if (endpoint === '/spot-saves') {
    return { success: true, data: { requests: [] } } as T;
  }
  
  // Default mock response for POST/PUT requests
  if (options.method === 'POST' || options.method === 'PUT') {
    return { success: true, data: { message: 'Success (mock)' } } as T;
  }
  
  // Default empty response
  return { success: true, data: {} } as T;
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

