import { create } from 'zustand';

export interface Spot {
  id: string;
  name: string;
  building_name?: string;
  floor_number?: string;
  latitude: number;
  longitude: number;
  distance_meters?: number;
  address?: string;
  spot_type: string;
  capacity: number;
  current_occupancy: number;
  occupancy_percentage: number;
  occupancy_status: 'low' | 'moderate' | 'high';
  amenities: Record<string, any>;
  hours: Record<string, string[]>;
  photo_urls?: string[];
  is_verified: boolean;
  avg_rating: number;
  total_reviews: number;
  is_open_now?: boolean;
  friends_here?: any[];
}

interface SpotFilters {
  radius: number;
  type: string;
  availableOnly: boolean;
}

interface SpotState {
  spots: Spot[];
  selectedSpot: Spot | null;
  filters: SpotFilters;
  isLoading: boolean;
  
  setSpots: (spots: Spot[]) => void;
  selectSpot: (spot: Spot | null) => void;
  updateFilters: (filters: Partial<SpotFilters>) => void;
  updateSpotOccupancy: (spotId: string, occupancy: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useSpotStore = create<SpotState>((set) => ({
  spots: [],
  selectedSpot: null,
  filters: {
    radius: 2000,
    type: 'all',
    availableOnly: false,
  },
  isLoading: false,

  setSpots: (spots) => set({ spots }),
  
  selectSpot: (spot) => set({ selectedSpot: spot }),
  
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  updateSpotOccupancy: (spotId, occupancy) => set((state) => ({
    spots: state.spots.map(spot =>
      spot.id === spotId 
        ? { 
            ...spot, 
            current_occupancy: occupancy,
            occupancy_percentage: Math.round((occupancy / spot.capacity) * 100),
            occupancy_status: 
              occupancy / spot.capacity <= 0.33 ? 'low' :
              occupancy / spot.capacity <= 0.66 ? 'moderate' : 'high'
          }
        : spot
    ),
    selectedSpot: state.selectedSpot?.id === spotId
      ? {
          ...state.selectedSpot,
          current_occupancy: occupancy,
          occupancy_percentage: Math.round((occupancy / state.selectedSpot.capacity) * 100),
          occupancy_status:
            occupancy / state.selectedSpot.capacity <= 0.33 ? 'low' :
            occupancy / state.selectedSpot.capacity <= 0.66 ? 'moderate' : 'high'
        }
      : state.selectedSpot,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));

