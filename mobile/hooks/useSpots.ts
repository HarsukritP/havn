import { useQuery } from '@tanstack/react-query';
import { spotsApi } from '../lib/api';
import { useLocation } from './useLocation';
import { useSpotStore } from '../stores/spotStore';

export function useSpots() {
  const { location } = useLocation();
  const filters = useSpotStore((state) => state.filters);
  const setSpots = useSpotStore((state) => state.setSpots);
  const setLoading = useSpotStore((state) => state.setLoading);

  const query = useQuery({
    queryKey: ['spots', location, filters],
    queryFn: async () => {
      if (!location) throw new Error('Location required');
      
      setLoading(true);
      const response = await spotsApi.getSpots({
        lat: location.latitude,
        lon: location.longitude,
        radius: filters.radius,
        type: filters.type,
        availableOnly: filters.availableOnly,
      });
      
      setSpots(response.data.spots);
      setLoading(false);
      return response.data.spots;
    },
    enabled: !!location,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return query;
}

export function useSpotDetails(spotId: string | null) {
  return useQuery({
    queryKey: ['spot', spotId],
    queryFn: async () => {
      if (!spotId) throw new Error('Spot ID required');
      const response = await spotsApi.getSpotById(spotId);
      return response.data.spot;
    },
    enabled: !!spotId,
    staleTime: 30000,
  });
}

