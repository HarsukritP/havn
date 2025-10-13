import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MapPin, Wifi, Zap, Volume2, VolumeX } from 'lucide-react-native';
import { Spot } from '../types';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { formatTimeAgo, formatDistance } from '../utils/formatters';
import { getAvailabilityColor } from '../constants/theme';

interface SpotCardProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
  onFavorite?: (spot: Spot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onPress, onFavorite }) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swipe left (reveal favorite action)
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -80 && onFavorite) {
        // Trigger favorite action
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onFavorite)(spot);
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSpring(0.98, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    
    onPress(spot);
  };

  const availabilityColor = getAvailabilityColor(spot.availability_status);
  const availabilityPercent = (spot.current_available || 0) / spot.total_capacity * 100;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <Pressable onPress={handlePress}>
          <View style={[styles.card, shadows.md, { borderLeftColor: availabilityColor }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.spotName}>{spot.name}</Text>
                {spot.distance_meters && (
                  <View style={styles.distanceRow}>
                    <MapPin size={14} color={colors.gray[600]} />
                    <Text style={styles.distance}>{formatDistance(spot.distance_meters)}</Text>
                  </View>
                )}
              </View>
              
              <View style={[styles.badge, { backgroundColor: availabilityColor }]}>
                <Text style={styles.badgeText}>
                  {spot.current_available || '?'}/{spot.total_capacity}
                </Text>
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

            {/* Amenities & Info */}
            <View style={styles.footer}>
              <View style={styles.amenities}>
                {spot.amenities.wifi && (
                  <View style={styles.amenityIcon}>
                    <Wifi size={16} color={colors.gray[600]} />
                  </View>
                )}
                {spot.amenities.outlets && (
                  <View style={styles.amenityIcon}>
                    <Zap size={16} color={colors.gray[600]} />
                  </View>
                )}
                {spot.amenities.quiet_zone ? (
                  <View style={styles.amenityIcon}>
                    <VolumeX size={16} color={colors.gray[600]} />
                  </View>
                ) : (
                  <View style={styles.amenityIcon}>
                    <Volume2 size={16} color={colors.gray[600]} />
                  </View>
                )}
              </View>
              
              {spot.last_update_at && (
                <Text style={styles.lastUpdate}>Updated {formatTimeAgo(spot.last_update_at)}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.xs,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distance: {
    fontSize: 14,
    color: colors.gray[600],
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  availabilityBarContainer: {
    height: 4,
    backgroundColor: colors.light[200],
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  availabilityBar: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenities: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amenityIcon: {
    padding: spacing.xs,
  },
  lastUpdate: {
    fontSize: 12,
    color: colors.gray[600],
  },
});

