import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Crosshair, Plus } from 'lucide-react-native';
import { spotService } from '../../services/spotService';
import { Spot } from '../../types';
import { SpotMarker } from '../../components/SpotMarker';
import { PointsBadge } from '../../components/PointsBadge';
import { CheckInModal } from '../../components/CheckInModal';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

const DEFAULT_REGION = {
  latitude: 37.7749, // Default to SF
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export const MapScreen: React.FC = () => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation();
  const { user } = useAuthStore();

  // Request location permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'SpotSave needs your location to show nearby study spots.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      
      const newRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    })();
  }, []);

  // Fetch nearby spots
  const { data: spots = [], isLoading, refetch } = useQuery({
    queryKey: ['spots', 'nearby', region.latitude, region.longitude],
    queryFn: () => spotService.getNearbySpots(region.latitude, region.longitude, 1000),
    enabled: !!region,
  });

  const handleMarkerPress = (spot: Spot) => {
    setSelectedSpot(spot);
    navigation.navigate('SpotDetail' as never, { spotId: spot.id } as never);
  };

  const handleRecenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (userLocation) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  const handleAddSpotPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Add New Spot',
      'This feature is coming soon! You can currently update existing spots.',
      [{ text: 'OK' }]
    );
  };

  const handleCheckInSubmit = async (data: { seatsAvailable: number; noiseLevel?: 'quiet' | 'moderate' | 'loud' }) => {
    if (!selectedSpot || !userLocation) return;

    try {
      await spotService.updateSpotAvailability(selectedSpot.id, {
        seats_available: data.seatsAvailable,
        noise_level: data.noiseLevel,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Refetch spots to get updated data
      refetch();
      
      Alert.alert('Success!', 'Thanks for helping the community! +5 points', [{ text: 'OK' }]);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.error || 'Failed to update spot', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {spots.map((spot, index) => (
          <SpotMarker
            key={spot.id}
            spot={spot}
            onPress={handleMarkerPress}
            index={index}
          />
        ))}
      </MapView>

      {/* Top Bar - Points Badge */}
      {user && (
        <View style={styles.topBar}>
          <PointsBadge points={user.total_points} />
        </View>
      )}

      {/* Recenter Button */}
      <Pressable onPress={handleRecenterPress} style={[styles.recenterButton, shadows.lg]}>
        <Crosshair size={24} color={colors.dark[900]} />
      </Pressable>

      {/* Add Spot Button */}
      <Pressable onPress={handleAddSpotPress} style={[styles.addButton, shadows.lg]}>
        <Plus size={28} color={colors.white} strokeWidth={3} />
      </Pressable>

      {/* Check-In Modal */}
      <CheckInModal
        visible={showCheckInModal}
        spot={selectedSpot}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleCheckInSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: spacing.lg,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
