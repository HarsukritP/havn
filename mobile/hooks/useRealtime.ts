import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSpotStore } from '../stores/spotStore';

export function useOccupancyRealtime() {
  const queryClient = useQueryClient();
  const updateSpotOccupancy = useSpotStore((state) => state.updateSpotOccupancy);

  useEffect(() => {
    // Subscribe to occupancy_logs table changes
    const channel = supabase
      .channel('occupancy_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'occupancy_logs',
        },
        (payload) => {
          console.log('Occupancy change:', payload);
          
          // Invalidate spots query to refetch with updated occupancy
          queryClient.invalidateQueries({ queryKey: ['spots'] });
          
          // If we have spot_id in the payload, update that spot specifically
          if (payload.new && 'spot_id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: ['spot', (payload.new as any).spot_id] 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, updateSpotOccupancy]);
}

export function useFriendLocationRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to profiles table changes (for friend location updates)
    const channel = supabase
      .channel('friend_location_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Friend location change:', payload);
          
          // Invalidate friends query to refetch with updated locations
          queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

