import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSpots } from '../hooks/useSpots';
import { useLocation } from '../hooks/useLocation';
import { useSpotStore } from '../stores/spotStore';

function SpotsListScreen() {
  const router = useRouter();
  const { data: spots, isLoading } = useSpots();
  const { location } = useLocation();
  const selectSpot = useSpotStore((state) => state.selectSpot);

  const getOccupancyColor = (status: string) => {
    switch (status) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleSpotPress = (spot: any) => {
    selectSpot(spot);
    router.push(`/spot/${spot.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Spots</Text>
        </View>
        <Text style={styles.spotCount}>{spots?.length || 0} spots</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Finding nearby spots...</Text>
        </View>
      ) : !location ? (
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>Please enable location to view nearby spots</Text>
        </View>
      ) : spots && spots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No Spots Found</Text>
          <Text style={styles.emptyText}>Try adjusting your filters or increasing the search radius</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.listContainer}>
            {spots?.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={styles.spotCard}
                onPress={() => handleSpotPress(spot)}
              >
                <View style={styles.spotHeader}>
                  <View style={styles.spotInfo}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    {spot.building_name && (
                      <Text style={styles.buildingName}>{spot.building_name}</Text>
                    )}
                  </View>
                  {spot.distance_meters && (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="walk" size={14} color="#6b7280" />
                      <Text style={styles.distanceText}>{formatDistance(spot.distance_meters)}</Text>
                    </View>
                  )}
                </View>

                <View style={[
                  styles.occupancyBar,
                  { backgroundColor: `${getOccupancyColor(spot.occupancy_status)}15` }
                ]}>
                  <View style={styles.occupancyInfo}>
                    <View style={[
                      styles.occupancyDot,
                      { backgroundColor: getOccupancyColor(spot.occupancy_status) }
                    ]} />
                    <Text style={[
                      styles.occupancyText,
                      { color: getOccupancyColor(spot.occupancy_status) }
                    ]}>
                      {spot.occupancy_percentage}% Full • {spot.current_occupancy}/{spot.capacity}
                    </Text>
                  </View>
                  {spot.is_open_now ? (
                    <Text style={styles.openText}>Open</Text>
                  ) : (
                    <Text style={styles.closedText}>Closed</Text>
                  )}
                </View>

                <View style={styles.amenitiesRow}>
                  {spot.amenities.wifi && (
                    <View style={styles.amenityBadge}>
                      <Ionicons name="wifi" size={14} color="#6366f1" />
                      <Text style={styles.amenityText}>WiFi</Text>
                    </View>
                  )}
                  {spot.amenities.outlets && (
                    <View style={styles.amenityBadge}>
                      <Ionicons name="flash" size={14} color="#6366f1" />
                      <Text style={styles.amenityText}>Outlets</Text>
                    </View>
                  )}
                  {spot.amenities.quiet && (
                    <View style={styles.amenityBadge}>
                      <Ionicons name="volume-mute" size={14} color="#6366f1" />
                      <Text style={styles.amenityText}>Quiet</Text>
                    </View>
                  )}
                  {spot.amenities.food_nearby && (
                    <View style={styles.amenityBadge}>
                      <Ionicons name="restaurant" size={14} color="#6366f1" />
                      <Text style={styles.amenityText}>Food</Text>
                    </View>
                  )}
                </View>

                {spot.friends_here && spot.friends_here.length > 0 && (
                  <View style={styles.friendsHere}>
                    <Ionicons name="people" size={16} color="#8b5cf6" />
                    <Text style={styles.friendsHereText}>
                      {spot.friends_here.length} {spot.friends_here.length === 1 ? 'friend' : 'friends'} here
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  spotCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  spotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  buildingName: {
    fontSize: 14,
    color: '#6b7280',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  occupancyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  occupancyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  occupancyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  occupancyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  friendsHere: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  friendsHereText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

SpotsListScreen.displayName = 'SpotsListScreen';

export default SpotsListScreen;

