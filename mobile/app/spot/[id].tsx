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
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: spot, isLoading, error } = useSpotDetails(id);
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'details' | 'friends'>('details');
  const [showSpotSaveModal, setShowSpotSaveModal] = useState(false);
  
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

  // NOW WE CAN DO CONDITIONAL RETURNS (after all hooks)
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
          <Text style={styles.errorText}>Unable to load spot details</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends Here
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'details' ? (
          <View>
            {/* Spot Info */}
            <View style={styles.section}>
              <Text style={styles.spotName}>{spot.name}</Text>
              {spot.building_name && (
                <Text style={styles.buildingName}>{spot.building_name}</Text>
              )}
              {spot.distance_meters !== undefined && (
                <Text style={styles.distance}>{formatDistance(spot.distance_meters)}</Text>
              )}
            </View>

            {/* Occupancy */}
            <View style={styles.section}>
              <View style={styles.occupancyCard}>
                <View style={[styles.occupancyIndicator, { backgroundColor: getOccupancyColor(spot.occupancy_status) }]} />
                <View style={styles.occupancyInfo}>
                  <Text style={styles.occupancyTitle}>{getOccupancyText(spot.occupancy_status)}</Text>
                  <Text style={styles.occupancyText}>
                    {spot.current_occupancy} / {spot.capacity} people
                  </Text>
                </View>
                <Text style={styles.occupancyPercentage}>{spot.occupancy_percentage}%</Text>
              </View>
            </View>

            {/* Check-in/out */}
            <View style={styles.section}>
              {isCheckedIn ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkOutButton]}
                  onPress={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                >
                  {checkOutMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Check Out</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkInButton]}
                  onPress={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending || !location}
                >
                  {checkInMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Check In</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Address */}
            {spot.address && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#6b7280" />
                  <Text style={styles.infoText}>{spot.address}</Text>
                </View>
              </View>
            )}

            {/* Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {spot.amenities.wifi && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="wifi" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>WiFi</Text>
                  </View>
                )}
                {spot.amenities.outlets && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="flash" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>Outlets</Text>
                  </View>
                )}
                {spot.amenities.quiet && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="volume-mute" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>Quiet</Text>
                  </View>
                )}
                {spot.amenities.food_nearby && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="restaurant" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>Food Nearby</Text>
                  </View>
                )}
                {spot.amenities.whiteboard && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="create" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>Whiteboard</Text>
                  </View>
                )}
                {spot.amenities.natural_light && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="sunny" size={16} color="#6366f1" />
                    <Text style={styles.amenityText}>Natural Light</Text>
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
                    <Text style={styles.friendUsername}>@{friend.username}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyFriends}>
                <Ionicons name="people-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Friends Here</Text>
                <Text style={styles.emptyText}>None of your friends are currently at this spot</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <SpotSaveRequestModal
        visible={showSpotSaveModal}
        spotId={id}
        spotName={spot.name}
        onClose={() => setShowSpotSaveModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
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
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  buildingName: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  distance: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 8,
  },
  occupancyCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occupancyIndicator: {
    width: 12,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  occupancyInfo: {
    flex: 1,
  },
  occupancyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  occupancyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  occupancyPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#10b981',
  },
  checkOutButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
    color: '#6366f1',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  hoursText: {
    fontSize: 14,
    color: '#6b7280',
  },
  friendsContainer: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  friendUsername: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyFriends: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

SpotDetailsScreen.displayName = 'SpotDetailsScreen';

export default SpotDetailsScreen;
