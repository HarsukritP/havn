import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export const SkeletonSpotCard: React.FC = () => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // Infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <View style={[styles.card, shadows.md]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.skeletonTitle, animatedStyle]} />
          <Animated.View style={[styles.skeletonDistance, animatedStyle]} />
        </View>
        <Animated.View style={[styles.skeletonBadge, animatedStyle]} />
      </View>

      <Animated.View style={[styles.skeletonBar, animatedStyle]} />

      <View style={styles.footer}>
        <View style={styles.amenities}>
          <Animated.View style={[styles.skeletonIcon, animatedStyle]} />
          <Animated.View style={[styles.skeletonIcon, animatedStyle]} />
          <Animated.View style={[styles.skeletonIcon, animatedStyle]} />
        </View>
        <Animated.View style={[styles.skeletonText, animatedStyle]} />
      </View>
    </View>
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
    borderLeftColor: colors.light[200],
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
  skeletonTitle: {
    height: 20,
    width: '70%',
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  skeletonDistance: {
    height: 14,
    width: '40%',
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
  },
  skeletonBadge: {
    height: 32,
    width: 60,
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
    marginLeft: spacing.md,
  },
  skeletonBar: {
    height: 4,
    backgroundColor: colors.light[200],
    borderRadius: 2,
    marginBottom: spacing.md,
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
  skeletonIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
  },
  skeletonText: {
    height: 12,
    width: 80,
    backgroundColor: colors.light[200],
    borderRadius: borderRadius.sm,
  },
});

