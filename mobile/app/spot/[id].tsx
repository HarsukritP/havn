import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSpotDetails } from '../../hooks/useSpots';
import { useLocation } from '../../hooks/useLocation';
import { occupancyApi } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { SpotSaveRequestModal } from '../../components/SpotSaveRequestModal';

function SpotDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: spot, isLoading, error } = useSpotDetails(id);
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'details' | 'friends'>('details');
  const [showSpotSaveModal, setShowSpotSaveModal] = useState(false);
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const isCheckedIn = profile?.current_spot_id === id;

  const checkInMutation = useMutation({
    mutationFn: () => {
      if (!location) throw new Error('Location required');
      return occupancyApi.checkIn({
        spot_id: id,
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spot', id] });
      Alert.alert('Success', 'Checked in successfully!');
    },
    onError: (error: Error) => {
      Alert.alert('Check-in Failed', error.message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => occupancyApi.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spot', id] });
      Alert.alert('Success', 'Checked out successfully!');
    },
    onError: (error: Error) => {
      Alert.alert('Check-out Failed', error.message);
    },
  });

  const getOccupancyColor = (status: string) => {
    switch (status) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOccupancyText = (status: string) => {
    switch (status) {
      case 'low': return 'Low Occupancy';
      case 'moderate': return 'Moderate Occupancy';
      case 'high': return 'High Occupancy';
      default: return 'Unknown';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spot Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !spot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spot Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Spot Not Found</Text>
          <Text style={styles.errorText}>This spot doesn't exist or couldn't be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spot Details</Text>
        <TouchableOpacity onPress={() => setShowSpotSaveModal(true)}>
          <Ionicons name="bookmark-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Spot Save Request Modal */}
      <SpotSaveRequestModal
        visible={showSpotSaveModal}
        spotId={id}
        spotName={spot?.name || ''}
        onClose={() => setShowSpotSaveModal(false)}
      />

      <ScrollView style={styles.scrollView}>
        {/* Main Info */}
        <View style={styles.infoCard}>
          <View style={styles.spotHeader}>
            <View style={styles.spotTitleContainer}>
              <Text style={styles.spotName}>{spot.name}</Text>
              {spot.is_verified && (
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              )}
            </View>
            {spot.building_name && (
              <Text style={styles.buildingName}>{spot.building_name}</Text>
            )}
            {spot.distance_meters && (
              <Text style={styles.distance}>{formatDistance(spot.distance_meters)}</Text>
            )}
          </View>

          {/* Occupancy Status */}
          <View style={[
            styles.occupancyBadge,
            { backgroundColor: `${getOccupancyColor(spot.occupancy_status)}15` }
          ]}>
            <View style={[
              styles.occupancyDot,
              { backgroundColor: getOccupancyColor(spot.occupancy_status) }
            ]} />
            <Text style={[
              styles.occupancyText,
              { color: getOccupancyColor(spot.occupancy_status) }
            ]}>
              {getOccupancyText(spot.occupancy_status)} • {spot.current_occupancy}/{spot.capacity} ({spot.occupancy_percentage}%)
            </Text>
          </View>

          {/* Hours */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {spot.is_open_now ? 'Open now' : 'Closed'}
            </Text>
          </View>

          {/* Type */}
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {spot.spot_type.charAt(0).toUpperCase() + spot.spot_type.slice(1)}
            </Text>
          </View>

          {/* Address */}
          {spot.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{spot.address}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'details' && styles.tabTextActive
            ]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'friends' && styles.tabTextActive
            ]}>
              Friends ({spot.friends_here?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'details' ? (
          <View style={styles.detailsContainer}>
            {/* Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {spot.amenities.wifi && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="wifi" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>WiFi</Text>
                  </View>
                )}
                {spot.amenities.outlets && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="flash" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>Outlets</Text>
                  </View>
                )}
                {spot.amenities.quiet && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="volume-mute" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>Quiet</Text>
                  </View>
                )}
                {spot.amenities.food_nearby && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="restaurant" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>Food</Text>
                  </View>
                )}
                {spot.amenities.natural_light && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="sunny" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>Natural Light</Text>
                  </View>
                )}
                {spot.amenities.printers && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="print" size={20} color="#6366f1" />
                    <Text style={styles.amenityText}>Printers</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hours</Text>
              {Object.entries(spot.hours).map(([day, hours]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <Text style={styles.hoursText}>
                    {Array.isArray(hours) ? hours.join(', ') : String(hours)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.friendsContainer}>
            {spot.friends_here && spot.friends_here.length > 0 ? (
              spot.friends_here.map((friend: any) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {friend.full_name?.charAt(0) || friend.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.full_name || friend.username}</Text>
                    <Text style={styles.friendMeta}>
                      Checked in {friend.checked_in_duration}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No friends here yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Check-in/Check-out Button */}
      <View style={styles.actionContainer}>
        {isCheckedIn ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkOutButton]}
            onPress={() => checkOutMutation.mutate()}
            disabled={checkOutMutation.isPending}
          >
            {checkOutMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Check Out</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
          >
            {checkInMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Check In</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  spotHeader: {
    marginBottom: 16,
  },
  spotTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  buildingName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#9ca3af',
  },
  occupancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  occupancyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  occupancyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: 'white',
  },
  detailsContainer: {
    marginHorizontal: 16,
    marginBottom: 100,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#111827',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: '#111827',
  },
  friendsContainer: {
    marginHorizontal: 16,
    marginBottom: 100,
  },
  friendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  friendMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkOutButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

SpotDetailsScreen.displayName = 'SpotDetailsScreen';

export default SpotDetailsScreen;

