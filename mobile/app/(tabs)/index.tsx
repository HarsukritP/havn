import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSpots } from '../../hooks/useSpots';
import { useLocation } from '../../hooks/useLocation';
import { useSpotStore, Spot } from '../../stores/spotStore';
import { useAuthStore } from '../../stores/authStore';
import { friendsApi } from '../../lib/api';
import { useOccupancyRealtime, useFriendLocationRealtime } from '../../hooks/useRealtime';

function MapScreen() {
  const router = useRouter();
  const { location, isLoading: locationLoading, error: locationError } = useLocation();
  const { data: spots, isLoading: spotsLoading, error: spotsError } = useSpots();
  const [showFilters, setShowFilters] = useState(false);
  const filters = useSpotStore((state) => state.filters);
  const updateFilters = useSpotStore((state) => state.updateFilters);
  const selectSpot = useSpotStore((state) => state.selectSpot);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialize realtime subscriptions only on map screen
  useOccupancyRealtime();
  useFriendLocationRealtime();

  // Fetch friends for map markers
  const { data: friendsData } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await friendsApi.getFriends();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'low': return '#10b981'; // green
      case 'moderate': return '#f59e0b'; // yellow
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const handleMarkerPress = (spot: Spot) => {
    selectSpot(spot);
    router.push(`/spot/${spot.id}`);
  };

  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>havn</Text>
          <Text style={styles.subtitle}>Find study spots at UW</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>havn</Text>
          <Text style={styles.subtitle}>Find study spots at UW</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>
            {locationError || 'Please enable location services to find nearby study spots'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>havn</Text>
          <Text style={styles.subtitle}>
            {spots?.length || 0} spots nearby
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/spots-list')}
          >
            <Ionicons name="list-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filters</Text>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Distance</Text>
            <View style={styles.filterChips}>
              {[500, 1000, 2000, 5000].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.chip,
                    filters.radius === radius && styles.chipActive
                  ]}
                  onPress={() => updateFilters({ radius })}
                >
                  <Text style={[
                    styles.chipText,
                    filters.radius === radius && styles.chipTextActive
                  ]}>
                    {radius >= 1000 ? `${radius/1000}km` : `${radius}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.filterChips}>
              {['all', 'library', 'cafe', 'lounge', 'outdoor'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    filters.type === type && styles.chipActive
                  ]}
                  onPress={() => updateFilters({ type })}
                >
                  <Text style={[
                    styles.chipText,
                    filters.type === type && styles.chipTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.availableToggle}
            onPress={() => updateFilters({ availableOnly: !filters.availableOnly })}
          >
            <Ionicons 
              name={filters.availableOnly ? "checkbox" : "square-outline"} 
              size={24} 
              color="#6366f1" 
            />
            <Text style={styles.availableText}>Available only</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {spots?.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => handleMarkerPress(spot)}
          >
            <View style={[
              styles.markerContainer,
              { backgroundColor: getMarkerColor(spot.occupancy_status) }
            ]}>
              <Ionicons name="location" size={24} color="white" />
            </View>
          </Marker>
        ))}

        {/* Friend markers */}
        {friendsData?.friends?.filter((friend: any) => 
          friend.current_latitude && friend.current_longitude
        ).map((friend: any) => (
          <Marker
            key={`friend-${friend.id}`}
            coordinate={{
              latitude: friend.current_latitude,
              longitude: friend.current_longitude,
            }}
          >
            <View style={styles.friendMarker}>
              <Text style={styles.friendMarkerText}>
                {friend.full_name?.charAt(0) || friend.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Loading overlay */}
      {spotsLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingOverlayText}>Loading spots...</Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chipTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  availableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableText: {
    fontSize: 14,
    color: '#111827',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  friendMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  friendMarkerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlayText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

MapScreen.displayName = 'MapScreen';

export default MapScreen;

