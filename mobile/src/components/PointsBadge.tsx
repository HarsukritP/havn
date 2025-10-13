import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Trophy } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { formatPoints } from '../utils/formatters';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface PointsBadgeProps {
  points: number;
  showAnimation?: boolean;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({ points, showAnimation = false }) => {
  const scale = useSharedValue(1);
  const animatedPoints = useSharedValue(points);

  useEffect(() => {
    if (showAnimation) {
      // Scale up animation
      scale.value = withSpring(1.2, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [showAnimation]);

  useEffect(() => {
    // Animate number counting
    animatedPoints.value = withTiming(points, { duration: 500 });
  }, [points]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: Math.floor(animatedPoints.value).toString(),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, shadows.md]}>
      <Trophy size={20} color={colors.warning[500]} />
      <AnimatedText style={styles.pointsText} animatedProps={animatedTextProps}>
        {formatPoints(points)}
      </AnimatedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark[900],
  },
});

