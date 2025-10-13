import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, MapPin, Users, Wifi, Zap, Volume2, VolumeX, Clock } from 'lucide-react-native';
import { spotService } from '../../services/spotService';
import { CheckInModal } from '../../components/CheckInModal';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { getAvailabilityColor } from '../../constants/theme';
import { formatTimeAgo, formatDistance, formatWalkingTime } from '../../utils/formatters';

export const SpotDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { spotId } = route.params as { spotId: string };
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const { data: spot, isLoading, error, refetch } = useQuery({
    queryKey: ['spots', spotId],
    queryFn: () => spotService.getSpotById(spotId),
  });

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleUpdatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCheckInModal(true);
  };

  const handleCheckInSubmit = async (data: { seatsAvailable: number; noiseLevel?: 'quiet' | 'moderate' | 'loud' }) => {
    // Handle check-in submission (similar to MapScreen)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !spot) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load spot details</Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const availabilityColor = getAvailabilityColor(spot.availability_status);
  const availabilityPercent = (spot.current_available || 0) / spot.total_capacity * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: availabilityColor }]}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.white} />
        </Pressable>
        
        <View style={styles.headerContent}>
          <Text style={styles.spotName}>{spot.name}</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.white} />
            <Text style={styles.address}>{spot.address}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Availability Card */}
        <View style={[styles.card, shadows.md]}>
          <Text style={styles.cardTitle}>Current Availability</Text>
          
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityLeft}>
              <Text style={[styles.availabilityNumber, { color: availabilityColor }]}>
                {spot.current_available || '?'}
              </Text>
              <Text style={styles.availabilityLabel}>seats available</Text>
            </View>
            
            <View style={styles.availabilityRight}>
              <View style={styles.capacityRow}>
                <Users size={20} color={colors.gray[600]} />
                <Text style={styles.capacityText}>Total: {spot.total_capacity}</Text>
              </View>
              
              {spot.last_update_at && (
                <View style={styles.updateRow}>
                  <Clock size={20} color={colors.gray[600]} />
                  <Text style={styles.updateText}>Updated {formatTimeAgo(spot.last_update_at)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Availability Bar */}
          <View style={styles.availabilityBarContainer}>
            <View
              style={[
                styles.availabilityBar,
                { width: `${availabilityPercent}%`, backgroundColor: availabilityColor },
              ]}
            />
          </View>
          
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(spot.confidence_score * 100)}%
          </Text>
        </View>

        {/* Distance Card */}
        {spot.distance_meters && (
          <View style={[styles.card, shadows.md]}>
            <Text style={styles.cardTitle}>Distance</Text>
            <View style={styles.distanceRow}>
              <Text style={styles.distanceText}>{formatDistance(spot.distance_meters)}</Text>
              <Text style={styles.walkingText}>
                ~{formatWalkingTime(spot.distance_meters)} walk
              </Text>
            </View>
          </View>
        )}

        {/* Amenities Card */}
        <View style={[styles.card, shadows.md]}>
          <Text style={styles.cardTitle}>Amenities</Text>
          
          <View style={styles.amenitiesGrid}>
            <View style={[styles.amenity, spot.amenities.wifi && styles.amenityActive]}>
              <Wifi size={24} color={spot.amenities.wifi ? colors.primary[500] : colors.gray[600]} />
              <Text style={[styles.amenityText, spot.amenities.wifi && styles.amenityTextActive]}>
                WiFi
              </Text>
            </View>

            <View style={[styles.amenity, spot.amenities.outlets && styles.amenityActive]}>
              <Zap size={24} color={spot.amenities.outlets ? colors.primary[500] : colors.gray[600]} />
              <Text style={[styles.amenityText, spot.amenities.outlets && styles.amenityTextActive]}>
                Outlets
              </Text>
            </View>

            <View style={[styles.amenity, spot.amenities.quiet_zone && styles.amenityActive]}>
              <VolumeX size={24} color={spot.amenities.quiet_zone ? colors.primary[500] : colors.gray[600]} />
              <Text style={[styles.amenityText, spot.amenities.quiet_zone && styles.amenityTextActive]}>
                Quiet
              </Text>
            </View>

            <View style={[styles.amenity, !spot.amenities.quiet_zone && styles.amenityActive]}>
              <Volume2 size={24} color={!spot.amenities.quiet_zone ? colors.primary[500] : colors.gray[600]} />
              <Text style={[styles.amenityText, !spot.amenities.quiet_zone && styles.amenityTextActive]}>
                Social
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {spot.description && (
          <View style={[styles.card, shadows.md]}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>
        )}
      </ScrollView>

      {/* Update Button */}
      <View style={[styles.footer, shadows.lg]}>
        <Pressable onPress={handleUpdatePress} style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Update Availability</Text>
        </Pressable>
      </View>

      {/* Check-In Modal */}
      <CheckInModal
        visible={showCheckInModal}
        spot={spot}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleCheckInSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    gap: spacing.sm,
  },
  spotName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  address: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.md,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  availabilityLeft: {
    alignItems: 'center',
  },
  availabilityNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  availabilityLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  availabilityRight: {
    justifyContent: 'center',
    gap: spacing.md,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  capacityText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  updateText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  availabilityBarContainer: {
    height: 8,
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  availabilityBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark[900],
  },
  walkingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  amenity: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.light[200],
    alignItems: 'center',
    gap: spacing.sm,
  },
  amenityActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  amenityTextActive: {
    color: colors.primary[500],
  },
  description: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  updateButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});

